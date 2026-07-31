import { commerceApiPath, CommerceConfigurationError } from '../../../../../src/commerce/config';
import {
  adminSessionCookie,
  AdminSessionConfigurationError,
  clearAdminSessionCookie,
  readAdminSession,
  refreshAdminSession,
} from '../../../../../src/admin/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const maximumBodyBytes = 1_000_000;

type Method = 'GET' | 'POST' | 'PATCH';

function errorResponse(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message, details: {} } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

function sameOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

function validSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment.length <= 180 &&
    segment !== '.' &&
    segment !== '..' &&
    !segment.includes('/') &&
    !segment.includes('\\')
  );
}

function samePath(path: string[], expected: string[]): boolean {
  return path.length === expected.length && path.every((value, index) => value === expected[index]);
}

function allowed(method: string, path: string[]): method is Method {
  if (!path.every(validSegment)) return false;
  if (method === 'GET') {
    return (
      samePath(path, ['overview']) ||
      samePath(path, ['categories']) ||
      samePath(path, ['shipping-methods']) ||
      samePath(path, ['products']) ||
      (path.length === 2 && path[0] === 'products') ||
      samePath(path, ['orders']) ||
      (path.length === 2 && path[0] === 'orders') ||
      (path.length === 3 && path[0] === 'inventory' && path[2] === 'movements')
    );
  }
  if (method === 'POST') {
    return (
      samePath(path, ['categories']) ||
      samePath(path, ['shipping-methods']) ||
      samePath(path, ['products']) ||
      (path.length === 3 && path[0] === 'products' && path[2] === 'variants') ||
      (path.length === 3 && path[0] === 'products' && path[2] === 'images') ||
      (path.length === 3 && path[0] === 'inventory' && path[2] === 'adjustments')
    );
  }
  if (method === 'PATCH') {
    return (
      (path.length === 2 && path[0] === 'categories') ||
      (path.length === 2 && path[0] === 'shipping-methods') ||
      (path.length === 2 && path[0] === 'products') ||
      (path.length === 2 && path[0] === 'variants') ||
      (path.length === 3 && path[0] === 'orders' && path[2] === 'status')
    );
  }
  return false;
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  if (!sameOrigin(request)) {
    return errorResponse(403, 'FORBIDDEN', 'Cross-origin admin mutations are not allowed.');
  }
  if (!allowed(request.method, path)) {
    return errorResponse(404, 'NOT_FOUND', 'Admin route was not found.');
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maximumBodyBytes) {
    return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Admin request body is too large.');
  }

  try {
    const current = readAdminSession(request);
    if (!current) return errorResponse(401, 'UNAUTHORIZED', 'Admin sign-in is required.');
    const session = await refreshAdminSession(current);
    const target = commerceApiPath(
      `/v1/admin/commerce/${path.map((segment) => encodeURIComponent(segment)).join('/')}`,
    );
    target.search = new URL(request.url).search;

    const headers = new Headers({
      Accept: 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    });
    const contentType = request.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.arrayBuffer() : undefined;
    if (body && body.byteLength > maximumBodyBytes) {
      return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Admin request body is too large.');
    }

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(body ? { body } : {}),
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000),
    });
    const responseHeaders = new Headers({
      'Cache-Control': 'no-store',
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
    });
    if (session.accessToken !== current.accessToken) {
      responseHeaders.set('Set-Cookie', adminSessionCookie(session));
    }
    if (upstream.status === 401 || upstream.status === 403) {
      responseHeaders.set('Set-Cookie', clearAdminSessionCookie());
    }

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const configurationError =
      error instanceof AdminSessionConfigurationError ||
      error instanceof CommerceConfigurationError;
    const response = errorResponse(
      configurationError ? 503 : 401,
      configurationError ? 'SERVICE_UNAVAILABLE' : 'UNAUTHORIZED',
      configurationError ? error.message : 'Admin session has expired.',
    );
    if (!configurationError) response.headers.set('Set-Cookie', clearAdminSessionCookie());
    return response;
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
