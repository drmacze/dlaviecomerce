import { z } from 'zod';
import {
  commerceBackendFetch,
  CommerceConfigurationError,
  EmbeddedCommerceConfigurationError,
} from '../../../../src/commerce/backend';
import {
  checkoutCredential,
  clearCartCredential,
  commerceSessionCookie,
  CommerceSessionConfigurationError,
  orderAccessCredential,
  orderCredential,
  readCommerceSession,
  setOrderCredential,
  type CommerceSession,
} from '../../../../src/commerce/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const maximumCheckoutBodyBytes = 4_096;
const checkoutBodySchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z.string().trim().min(6).max(30).optional(),
    customerNote: z.string().trim().max(500).optional(),
  })
  .strict();

type Resolution = {
  backendPath: string;
  cartToken?: string;
  orderToken?: string;
  orderAccessToken?: string;
  idempotencyKey?: string;
  checkout?: boolean;
};

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message, details: {} } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

function isAllowedOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const origin = request.headers.get('origin');
  return Boolean(origin && origin === new URL(request.url).origin);
}

function validSegment(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 180 &&
    value !== '.' &&
    value !== '..' &&
    !value.includes('/') &&
    !value.includes('\\')
  );
}

function resolve(
  method: string,
  path: string[],
  session: CommerceSession,
): Resolution | Response {
  if (!path.every(validSegment)) {
    return errorResponse(404, 'NOT_FOUND', 'Commerce v2 route was not found.');
  }

  if (method === 'POST' && path.length === 2 && path[0] === 'checkout' && path[1] === 'current') {
    if (!session.cart) {
      return errorResponse(401, 'CART_SESSION_REQUIRED', 'No active cart session was found.');
    }
    const idempotencyKey = checkoutCredential(session);
    const orderAccessToken = orderAccessCredential(session);
    if (!idempotencyKey || !orderAccessToken) {
      return errorResponse(401, 'CART_SESSION_REQUIRED', 'No active cart session was found.');
    }
    return {
      backendPath: `/v2/checkout/${encodeURIComponent(session.cart.id)}`,
      cartToken: session.cart.token,
      idempotencyKey,
      orderAccessToken,
      checkout: true,
    };
  }

  if (method === 'GET' && path.length === 2 && path[0] === 'orders') {
    const orderToken = orderCredential(session, path[1]);
    if (!orderToken) {
      return errorResponse(
        401,
        'ORDER_SESSION_REQUIRED',
        'Order access is not available in this browser session.',
      );
    }
    return {
      backendPath: `/v2/orders/${encodeURIComponent(path[1])}`,
      orderToken,
    };
  }

  return errorResponse(404, 'NOT_FOUND', 'Commerce v2 route was not found.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function orderNumberFromPayload(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null;
  return typeof payload.data.orderNumber === 'string' ? payload.data.orderNumber : null;
}

async function validatedCheckoutBody(request: Request): Promise<ArrayBuffer | Response> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/json')) {
    return errorResponse(415, 'UNSUPPORTED_MEDIA_TYPE', 'Checkout requires application/json.');
  }

  const contentLengthValue = request.headers.get('content-length');
  const contentLength = contentLengthValue ? Number(contentLengthValue) : Number.NaN;
  if (!Number.isSafeInteger(contentLength) || contentLength < 1) {
    return errorResponse(411, 'LENGTH_REQUIRED', 'A valid Content-Length header is required.');
  }
  if (contentLength > maximumCheckoutBodyBytes) {
    return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Checkout payload is too large.');
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength < 1 || bytes.byteLength > maximumCheckoutBodyBytes) {
    return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Checkout payload is too large.');
  }

  let candidate: unknown;
  try {
    candidate = JSON.parse(Buffer.from(bytes).toString('utf8')) as unknown;
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Checkout payload must contain valid JSON.');
  }

  const parsed = checkoutBodySchema.safeParse(candidate);
  if (!parsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Checkout payload is invalid.');
  }

  const serialized = Buffer.from(JSON.stringify(parsed.data), 'utf8');
  return serialized.buffer.slice(
    serialized.byteOffset,
    serialized.byteOffset + serialized.byteLength,
  ) as ArrayBuffer;
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  if (!isAllowedOrigin(request)) {
    return errorResponse(403, 'FORBIDDEN', 'Cross-origin commerce mutations are not allowed.');
  }

  let session: CommerceSession;
  try {
    session = readCommerceSession(request);
  } catch (error) {
    const message =
      error instanceof CommerceSessionConfigurationError
        ? error.message
        : 'Commerce session configuration is invalid.';
    return errorResponse(503, 'SERVICE_UNAVAILABLE', message);
  }

  const { path } = await context.params;
  const resolution = resolve(request.method, path, session);
  if (resolution instanceof Response) return resolution;

  const headers = new Headers({ Accept: 'application/json' });
  if (resolution.cartToken) headers.set('X-Cart-Token', resolution.cartToken);
  if (resolution.orderToken) headers.set('X-Order-Token', resolution.orderToken);
  if (resolution.orderAccessToken) {
    headers.set('X-Order-Access-Token', resolution.orderAccessToken);
  }
  if (resolution.idempotencyKey) headers.set('Idempotency-Key', resolution.idempotencyKey);

  let body: ArrayBuffer | undefined;
  if (resolution.checkout) {
    const validatedBody = await validatedCheckoutBody(request);
    if (validatedBody instanceof Response) return validatedBody;
    body = validatedBody;
    headers.set('Content-Type', 'application/json');
  }

  let upstream: Response;
  try {
    upstream = await commerceBackendFetch(resolution.backendPath, {
      method: request.method,
      headers,
      ...(body ? { body } : {}),
      origin: new URL(request.url).origin,
      timeoutMs: 25_000,
    });
  } catch (error) {
    const message =
      error instanceof CommerceConfigurationError ||
      error instanceof EmbeddedCommerceConfigurationError
        ? error.message
        : 'Commerce service is currently unreachable.';
    return errorResponse(503, 'SERVICE_UNAVAILABLE', message);
  }

  const bytes = await upstream.arrayBuffer();
  const responseHeaders = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
  });

  if (upstream.ok && resolution.checkout && resolution.orderAccessToken) {
    let payload: unknown;
    try {
      payload = JSON.parse(Buffer.from(bytes).toString('utf8')) as unknown;
    } catch {
      return errorResponse(502, 'UPSTREAM_ERROR', 'Commerce service returned an invalid order.');
    }
    const orderNumber = orderNumberFromPayload(payload);
    if (!orderNumber) {
      return errorResponse(502, 'UPSTREAM_ERROR', 'Commerce service returned an invalid order.');
    }
    const nextSession = clearCartCredential(
      setOrderCredential(session, orderNumber, resolution.orderAccessToken),
    );
    responseHeaders.set('Set-Cookie', commerceSessionCookie(nextSession));
  }

  return new Response(bytes.byteLength > 0 ? bytes : null, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
