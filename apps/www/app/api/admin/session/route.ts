import { z } from 'zod';
import { commerceApiPath, CommerceConfigurationError } from '../../../../src/commerce/config';
import {
  adminSessionCookie,
  AdminSessionConfigurationError,
  clearAdminSessionCookie,
  readAdminSession,
  refreshAdminSession,
  revokeAdminSession,
  signInAdmin,
} from '../../../../src/admin/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const signInSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(512),
});

function responseError(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message, details: {} } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

async function verifyAdmin(accessToken: string): Promise<boolean> {
  const response = await fetch(commerceApiPath('/v1/admin/commerce/overview'), {
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
  });
  return response.ok;
}

export async function POST(request: Request): Promise<Response> {
  if (!sameOrigin(request)) {
    return responseError(403, 'FORBIDDEN', 'Cross-origin sign-in is not allowed.');
  }

  try {
    const body = signInSchema.parse(await request.json());
    const session = await signInAdmin(body.email, body.password);
    if (!(await verifyAdmin(session.accessToken))) {
      await revokeAdminSession(session).catch(() => undefined);
      return responseError(403, 'FORBIDDEN', 'This account is not authorized for commerce admin.');
    }

    const response = Response.json(
      { data: { email: session.email, expiresAt: session.expiresAt } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
    response.headers.set('Set-Cookie', adminSessionCookie(session));
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return responseError(400, 'BAD_REQUEST', 'Enter a valid email and password.');
    }
    if (
      error instanceof AdminSessionConfigurationError ||
      error instanceof CommerceConfigurationError
    ) {
      return responseError(503, 'SERVICE_UNAVAILABLE', error.message);
    }
    return responseError(401, 'UNAUTHORIZED', 'Email or password is invalid.');
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const current = readAdminSession(request);
    if (!current) return responseError(401, 'UNAUTHORIZED', 'Admin sign-in is required.');
    const session = await refreshAdminSession(current);
    const response = Response.json(
      { data: { email: session.email, expiresAt: session.expiresAt } },
      { headers: { 'Cache-Control': 'no-store' } },
    );
    if (session.accessToken !== current.accessToken) {
      response.headers.set('Set-Cookie', adminSessionCookie(session));
    }
    return response;
  } catch (error) {
    const response = responseError(
      error instanceof AdminSessionConfigurationError ? 503 : 401,
      error instanceof AdminSessionConfigurationError ? 'SERVICE_UNAVAILABLE' : 'UNAUTHORIZED',
      error instanceof AdminSessionConfigurationError
        ? error.message
        : 'Admin session has expired.',
    );
    response.headers.set('Set-Cookie', clearAdminSessionCookie());
    return response;
  }
}

export async function DELETE(request: Request): Promise<Response> {
  if (!sameOrigin(request)) {
    return responseError(403, 'FORBIDDEN', 'Cross-origin sign-out is not allowed.');
  }
  try {
    const session = readAdminSession(request);
    if (session) await revokeAdminSession(session).catch(() => undefined);
  } catch {
    // Clearing the local encrypted cookie remains safe if the upstream session is unavailable.
  }
  const response = new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  response.headers.set('Set-Cookie', clearAdminSessionCookie());
  return response;
}
