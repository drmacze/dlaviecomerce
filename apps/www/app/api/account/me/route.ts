import { NextResponse } from 'next/server';
import { createAccountSessionView, getAccountProviders } from '../../../../src/lib/supabase/account-session';
import { readCookie, validateDlavieAccessToken } from '../../../../src/lib/supabase/server-session';
import { DLAVIE_ACCESS_COOKIE, DLAVIE_REFRESH_COOKIE, isSecureCookieRuntime, type DlavieAuthPayload } from '../../../../src/lib/supabase/session';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../../src/lib/supabase/url';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isSecureCookieRuntime(),
  path: '/',
};

async function refreshDlavieSession(refreshToken: string | null) {
  if (!refreshToken) return null;

  const response = await fetch(getSupabaseAuthEndpoint('/token?grant_type=refresh_token'), {
    method: 'POST',
    headers: getSupabaseRequestHeaders(),
    cache: 'no-store',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) return null;
  const payload = (await response.json().catch(() => null)) as DlavieAuthPayload | null;
  if (!payload?.access_token || !payload.refresh_token) return null;

  const user = payload.user?.id
    ? payload.user
    : await validateDlavieAccessToken(payload.access_token).catch(() => null);
  if (!user?.id) return null;

  return { payload, user };
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const accessToken = readCookie(cookieHeader, DLAVIE_ACCESS_COOKIE);
  const refreshToken = readCookie(cookieHeader, DLAVIE_REFRESH_COOKIE);

  const accessUser = await validateDlavieAccessToken(accessToken).catch(() => null);
  if (accessUser?.id) {
    return NextResponse.json({
      ok: true,
      account: createAccountSessionView(accessUser),
      providers: getAccountProviders(accessUser),
    });
  }

  const refreshed = await refreshDlavieSession(refreshToken).catch(() => null);
  if (!refreshed) {
    return NextResponse.json({
      ok: true,
      account: createAccountSessionView(null),
      providers: [],
    });
  }

  const result = NextResponse.json({
    ok: true,
    account: createAccountSessionView(refreshed.user),
    providers: getAccountProviders(refreshed.user),
  });

  result.cookies.set(DLAVIE_ACCESS_COOKIE, refreshed.payload.access_token!, {
    ...cookieOptions,
    maxAge: Math.max(refreshed.payload.expires_in ?? 3600, 60),
  });
  result.cookies.set(DLAVIE_REFRESH_COOKIE, refreshed.payload.refresh_token!, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  return result;
}
