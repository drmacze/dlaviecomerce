import { NextResponse } from 'next/server';
import { isSameOriginRequest } from '../../../../../src/lib/account/security';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../../../src/lib/supabase/url';
import { DLAVIE_ACCESS_COOKIE, DLAVIE_REFRESH_COOKIE, isSecureCookieRuntime } from '../../../../../src/lib/supabase/session';

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false, message: 'Invalid request origin.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const accessToken = String(body.access_token ?? '');
  const refreshToken = String(body.refresh_token ?? '');
  const expiresIn = Number(body.expires_in ?? 3600);

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ ok: false, message: 'OAuth session is incomplete.' }, { status: 400 });
  }

  const headers = getSupabaseRequestHeaders();
  headers.set('Authorization', `Bearer ${accessToken}`);

  const userResponse = await fetch(getSupabaseAuthEndpoint('/user'), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!userResponse.ok) {
    return NextResponse.json({ ok: false, message: 'OAuth session could not be verified.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirectTo: '/ai' });
  const secure = isSecureCookieRuntime();

  response.cookies.set(DLAVIE_ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.max(Number.isFinite(expiresIn) ? expiresIn : 3600, 60),
  });

  response.cookies.set(DLAVIE_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
