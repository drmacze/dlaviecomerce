import { commerceApiPath, CommerceConfigurationError } from '../../../../src/commerce/config';
import {
  addOrderAccess,
  getOrCreateCheckoutKey,
  readCommerceSession,
  writeCommerceSession,
  type CommerceSessionState,
} from '../../../../src/commerce/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const forwardedRequestHeaders = ['accept', 'content-type'] as const;
const cartPathPattern = /^v1\/carts\/([0-9a-f-]{36})(?:\/|$)/i;
const checkoutPathPattern = /^v1\/checkout\/([0-9a-f-]{36})$/i;
const orderPathPattern = /^v1\/orders\/([A-Z0-9]{2,8}-\d{8}-[A-F0-9]{10})$/;

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message, details: {} } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

function isSafePath(segments: string[]): boolean {
  if (segments.length === 0) return false;
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..')) {
    return false;
  }
  const joined = segments.join('/').toLowerCase();
  return !joined.startsWith('v1/admin/') && !joined.startsWith('v1/webhooks/');
}

function responseHeaders(response: Response): Headers {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
  });
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) headers.set('Retry-After', retryAfter);
  return headers;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeOrderPayload(value: unknown): unknown {
  if (!isRecord(value) || !isRecord(value.data)) return value;
  const payment = value.data.payment;
  if (!isRecord(payment)) return value;
  return {
    ...value,
    data: {
      ...value.data,
      payment: { ...payment, checkoutToken: null },
    },
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

async function cartCreationResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders(response),
    });
  }

  const payload = await readJson(response);
  if (!isRecord(payload) || !isRecord(payload.data)) {
    return errorResponse(502, 'INVALID_COMMERCE_RESPONSE', 'Commerce service returned invalid cart data.');
  }
  const { id, token, expiresAt } = payload.data;
  if (
    typeof id !== 'string' ||
    typeof token !== 'string' ||
    typeof expiresAt !== 'string' ||
    token.length < 32
  ) {
    return errorResponse(502, 'INVALID_COMMERCE_RESPONSE', 'Commerce service returned invalid cart data.');
  }

  const state = await readCommerceSession();
  await writeCommerceSession({
    ...state,
    cart: { id, token, expiresAt },
    checkout: undefined,
  });

  return Response.json(
    { data: { id, expiresAt } },
    { status: response.status, headers: { 'Cache-Control': 'no-store' } },
  );
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  if (!isSafePath(path)) {
    return errorResponse(404, 'NOT_FOUND', 'Commerce route was not found.');
  }

  const joinedPath = path.join('/');
  const isCartCreation = request.method === 'POST' && joinedPath === 'v1/carts';
  const cartMatch = cartPathPattern.exec(joinedPath);
  const checkoutMatch = checkoutPathPattern.exec(joinedPath);
  const orderMatch = orderPathPattern.exec(joinedPath);

  let state: CommerceSessionState | undefined;
  const headers = new Headers();
  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (cartMatch || checkoutMatch || orderMatch) {
    state = await readCommerceSession();
  }

  if (cartMatch) {
    const cartId = cartMatch[1];
    if (!cartId || !state?.cart || state.cart.id.toLowerCase() !== cartId.toLowerCase()) {
      return errorResponse(401, 'UNAUTHORIZED', 'Cart session is missing or invalid.');
    }
    headers.set('x-cart-token', state.cart.token);
  }

  if (checkoutMatch) {
    const cartId = checkoutMatch[1];
    if (!cartId || !state?.cart || state.cart.id.toLowerCase() !== cartId.toLowerCase()) {
      return errorResponse(401, 'UNAUTHORIZED', 'Cart session is missing or invalid.');
    }
    const checkout = getOrCreateCheckoutKey(state, state.cart.id);
    state = checkout.state;
    headers.set('x-cart-token', state.cart.token);
    headers.set('idempotency-key', checkout.key);
    await writeCommerceSession(state);
  }

  if (orderMatch) {
    const orderNumber = orderMatch[1];
    const orderAccess = orderNumber ? state?.orders?.[orderNumber] : undefined;
    if (!orderNumber || !orderAccess) {
      return errorResponse(401, 'UNAUTHORIZED', 'Order access is missing on this device.');
    }
    headers.set('x-order-token', orderAccess.token);
  }

  let target: URL;
  try {
    target = commerceApiPath(`/${path.map(encodeURIComponent).join('/')}`);
  } catch (error) {
    const message =
      error instanceof CommerceConfigurationError
        ? error.message
        : 'Commerce API configuration is invalid.';
    return errorResponse(503, 'SERVICE_UNAVAILABLE', message);
  }

  target.search = new URL(request.url).search;
  const hasBody = !['GET', 'HEAD'].includes(request.method);
  let response: Response;
  try {
    response = await fetch(target, {
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

  if (isCartCreation) return cartCreationResponse(response);

  if (cartMatch && response.status === 401 && state) {
    await writeCommerceSession({ ...state, cart: undefined, checkout: undefined });
  }

  if (checkoutMatch && response.ok && state?.checkout) {
    const payload = await readJson(response);
    if (!isRecord(payload) || !isRecord(payload.data) || typeof payload.data.orderNumber !== 'string') {
      return errorResponse(
        502,
        'INVALID_COMMERCE_RESPONSE',
        'Commerce service returned invalid order data.',
      );
    }
    const nextState = addOrderAccess(state, payload.data.orderNumber, state.checkout.key);
    await writeCommerceSession({ ...nextState, cart: undefined, checkout: undefined });
    return Response.json(sanitizeOrderPayload(payload), {
      status: response.status,
      headers: responseHeaders(response),
    });
  }

  if (orderMatch && response.ok) {
    const payload = await readJson(response);
    return Response.json(sanitizeOrderPayload(payload), {
      status: response.status,
      headers: responseHeaders(response),
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders(response),
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
