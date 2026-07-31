import { commerceApiPath, CommerceConfigurationError } from '../../../../src/commerce/config';
import {
  clearCartCredential,
  commerceSessionCookie,
  CommerceSessionConfigurationError,
  orderCredential,
  publicCommerceSession,
  readCommerceSession,
  setCartCredential,
  setOrderCredential,
  type CommerceSession,
} from '../../../../src/commerce/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const forwardedRequestHeaders = ['accept', 'content-type', 'idempotency-key'] as const;

type ProxyKind = 'catalog' | 'create-cart' | 'cart' | 'checkout' | 'order';

type ProxyResolution = {
  backendPath: string[];
  kind: ProxyKind;
  cartToken?: string;
  orderToken?: string;
};

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message, details: {} } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

function validSegments(segments: string[]): boolean {
  return (
    segments.length > 0 &&
    segments.every(
      (segment) =>
        segment.length > 0 &&
        segment.length <= 180 &&
        segment !== '.' &&
        segment !== '..' &&
        !segment.includes('/') &&
        !segment.includes('\\'),
    )
  );
}

function samePath(segments: string[], expected: string[]): boolean {
  return (
    segments.length === expected.length &&
    segments.every((value, index) => value === expected[index])
  );
}

function isAllowedOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

function resolveProxy(
  method: string,
  segments: string[],
  session: CommerceSession,
): ProxyResolution | Response {
  if (!validSegments(segments)) {
    return errorResponse(404, 'NOT_FOUND', 'Commerce route was not found.');
  }

  if (method === 'GET' && samePath(segments, ['v1', 'catalog', 'products'])) {
    return { backendPath: segments, kind: 'catalog' };
  }
  if (
    method === 'GET' &&
    segments.length === 4 &&
    samePath(segments.slice(0, 3), ['v1', 'catalog', 'products'])
  ) {
    return { backendPath: segments, kind: 'catalog' };
  }
  if (
    method === 'GET' &&
    (samePath(segments, ['v1', 'catalog', 'categories']) ||
      samePath(segments, ['v1', 'catalog', 'shipping-methods']))
  ) {
    return { backendPath: segments, kind: 'catalog' };
  }

  if (method === 'POST' && samePath(segments, ['v1', 'carts'])) {
    return { backendPath: segments, kind: 'create-cart' };
  }

  if (
    (method === 'GET' || method === 'DELETE') &&
    samePath(segments, ['v1', 'carts', 'current'])
  ) {
    if (!session.cart) {
      return errorResponse(401, 'CART_SESSION_REQUIRED', 'No active cart session was found.');
    }
    return {
      backendPath: ['v1', 'carts', session.cart.id],
      kind: 'cart',
      cartToken: session.cart.token,
    };
  }

  if (
    (method === 'PUT' || method === 'DELETE') &&
    segments.length === 5 &&
    samePath(segments.slice(0, 4), ['v1', 'carts', 'current', 'items'])
  ) {
    if (!session.cart) {
      return errorResponse(401, 'CART_SESSION_REQUIRED', 'No active cart session was found.');
    }
    return {
      backendPath: ['v1', 'carts', session.cart.id, 'items', segments[4]],
      kind: 'cart',
      cartToken: session.cart.token,
    };
  }

  if (method === 'POST' && samePath(segments, ['v1', 'checkout', 'current'])) {
    if (!session.cart) {
      return errorResponse(401, 'CART_SESSION_REQUIRED', 'No active cart session was found.');
    }
    return {
      backendPath: ['v1', 'checkout', session.cart.id],
      kind: 'checkout',
      cartToken: session.cart.token,
    };
  }

  if (
    method === 'GET' &&
    segments.length === 3 &&
    samePath(segments.slice(0, 2), ['v1', 'orders'])
  ) {
    const token = orderCredential(session, segments[2]);
    if (!token) {
      return errorResponse(
        401,
        'ORDER_SESSION_REQUIRED',
        'Order access is not available in this browser session.',
      );
    }
    return { backendPath: segments, kind: 'order', orderToken: token };
  }

  return errorResponse(404, 'NOT_FOUND', 'Commerce route was not found.');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseJsonBody(bytes: ArrayBuffer, contentType: string): unknown | null {
  if (!contentType.toLowerCase().includes('application/json') || bytes.byteLength === 0) return null;
  try {
    return JSON.parse(Buffer.from(bytes).toString('utf8')) as unknown;
  } catch {
    return null;
  }
}

function sanitizeOrderPayload(payload: unknown): unknown {
  if (!isRecord(payload) || !isRecord(payload.data)) return payload;
  const data = { ...payload.data };
  if (isRecord(data.payment)) {
    const payment = { ...data.payment };
    delete payment.checkoutToken;
    data.payment = payment;
  }
  return { ...payload, data };
}

function createCartSession(payload: unknown): {
  id: string;
  token: string;
  expiresAt: string;
} | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null;
  const { id, token, expiresAt } = payload.data;
  if (
    typeof id !== 'string' ||
    typeof token !== 'string' ||
    typeof expiresAt !== 'string' ||
    token.length < 32 ||
    !Number.isFinite(Date.parse(expiresAt))
  ) {
    return null;
  }
  return { id, token, expiresAt };
}

function publicCartPayload(payload: unknown): unknown {
  const cart = createCartSession(payload);
  if (!cart || !isRecord(payload)) return payload;
  return { ...payload, data: { id: cart.id, expiresAt: cart.expiresAt } };
}

function orderNumberFromPayload(payload: unknown): string | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null;
  return typeof payload.data.orderNumber === 'string' ? payload.data.orderNumber : null;
}

function upstreamHeaders(response: Response): Headers {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
  });
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) headers.set('Retry-After', retryAfter);
  return headers;
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;

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

  if (request.method === 'GET' && samePath(path, ['session'])) {
    const response = Response.json(
      { data: publicCommerceSession(session) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
    response.headers.set('Set-Cookie', commerceSessionCookie(session));
    return response;
  }

  const resolution = resolveProxy(request.method, path, session);
  if (resolution instanceof Response) return resolution;

  let target: URL;
  try {
    target = commerceApiPath(
      `/${resolution.backendPath.map((segment) => encodeURIComponent(segment)).join('/')}`,
    );
  } catch (error) {
    const message =
      error instanceof CommerceConfigurationError
        ? error.message
        : 'Commerce API configuration is invalid.';
    return errorResponse(503, 'SERVICE_UNAVAILABLE', message);
  }

  target.search = new URL(request.url).search;
  const headers = new Headers();
  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (resolution.cartToken) headers.set('X-Cart-Token', resolution.cartToken);
  if (resolution.orderToken) headers.set('X-Order-Token', resolution.orderToken);

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(hasBody ? { body: await request.arrayBuffer() } : {}),
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return errorResponse(503, 'SERVICE_UNAVAILABLE', 'Commerce service is currently unreachable.');
  }

  const bytes = await upstream.arrayBuffer();
  const contentType = upstream.headers.get('content-type') ?? '';
  let payload = parseJsonBody(bytes, contentType);
  let nextSession = session;
  let sessionChanged = false;

  if (upstream.ok && resolution.kind === 'create-cart') {
    const cart = createCartSession(payload);
    if (!cart) {
      return errorResponse(502, 'UPSTREAM_ERROR', 'Commerce service returned an invalid cart session.');
    }
    nextSession = setCartCredential(session, cart);
    sessionChanged = true;
    payload = publicCartPayload(payload);
  }

  if (upstream.ok && resolution.kind === 'checkout') {
    const idempotencyKey = request.headers.get('idempotency-key');
    const orderNumber = orderNumberFromPayload(payload);
    if (!idempotencyKey || idempotencyKey.length < 32 || !orderNumber) {
      return errorResponse(502, 'UPSTREAM_ERROR', 'Commerce service returned an invalid order session.');
    }
    nextSession = clearCartCredential(setOrderCredential(session, orderNumber, idempotencyKey));
    sessionChanged = true;
    payload = sanitizeOrderPayload(payload);
  } else if (resolution.kind === 'order') {
    payload = sanitizeOrderPayload(payload);
  }

  if (!upstream.ok && resolution.kind === 'cart' && upstream.status === 401) {
    nextSession = clearCartCredential(session);
    sessionChanged = true;
  }

  const responseHeaders = upstreamHeaders(upstream);
  if (sessionChanged) responseHeaders.set('Set-Cookie', commerceSessionCookie(nextSession));

  const responseBody =
    payload === null ? (bytes.byteLength > 0 ? bytes : null) : JSON.stringify(payload);
  if (payload !== null) responseHeaders.set('Content-Type', 'application/json; charset=utf-8');

  return new Response(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
