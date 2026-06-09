import { NextResponse } from 'next/server';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../../src/lib/supabase/url';
import { DLAVIE_ACCESS_COOKIE, DLAVIE_REFRESH_COOKIE, getAuthMessage, isSecureCookieRuntime, type DlavieAuthPayload } from '../../../../src/lib/supabase/session';

async function readPayload(response: Response) {
  try {
    return await response.json() as DlavieAuthPayload;
  } catch {
    return {} as DlavieAuthPayload;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Email and password are required.' }, { status: 400 });
  }

  const response = await fetch(getSupabaseAuthEndpoint('/token?grant_type=password'), {
    method: 'POST',
    headers: getSupabaseRequestHeaders(),
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  const payload = await readPayload(response);

  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    return NextResponse.json(
      { ok: false, message: getAuthMessage(payload, 'Unable to sign in. Check your email and password.') },
      { status: response.status || 401 }
    );
  }

  const result = NextResponse.json({ ok: true, redirectTo: '/ai' });
  const secure = isSecureCookieRuntime();

  result.cookies.set(DLAVIE_ACCESS_COOKIE, payload.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.max(payload.expires_in ?? 3600, 60),
  });

  result.cookies.set(DLAVIE_REFRESH_COOKIE, payload.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return result;
}
