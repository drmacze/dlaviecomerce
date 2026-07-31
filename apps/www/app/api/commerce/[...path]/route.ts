import { commerceApiPath, CommerceConfigurationError } from '../../../../src/commerce/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const forwardedRequestHeaders = [
  'accept',
  'content-type',
  'idempotency-key',
  'x-cart-token',
  'x-order-token',
] as const;

function isSafePath(segments: string[]): boolean {
  if (segments.length === 0) return false;
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..')) {
    return false;
  }
  const joined = segments.join('/').toLowerCase();
  return !joined.startsWith('v1/admin/') && !joined.startsWith('v1/webhooks/');
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  if (!isSafePath(path)) {
    return Response.json(
      { error: { code: 'NOT_FOUND', message: 'Commerce route was not found.', details: {} } },
      { status: 404 },
    );
  }

  let target: URL;
  try {
    target = commerceApiPath(`/${path.map(encodeURIComponent).join('/')}`);
  } catch (error) {
    const message =
      error instanceof CommerceConfigurationError
        ? error.message
        : 'Commerce API configuration is invalid.';
    return Response.json(
      { error: { code: 'SERVICE_UNAVAILABLE', message, details: {} } },
      { status: 503 },
    );
  }

  target.search = new URL(request.url).search;
  const headers = new Headers();
  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

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
    return Response.json(
      {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Commerce service is currently unreachable.',
          details: {},
        },
      },
      { status: 503 },
    );
  }

  const responseHeaders = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
  });
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) responseHeaders.set('Retry-After', retryAfter);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
