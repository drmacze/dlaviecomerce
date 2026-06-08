import { NextResponse } from 'next/server';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../../src/lib/supabase/url';
import { DLAVIE_ACCESS_COOKIE, DLAVIE_REFRESH_COOKIE, getAuthMessage, isSecureCookieRuntime, type DlavieAuthPayload } from '../../../../src/lib/supabase/session';
import { checkLoginRateLimit, isSameOriginRequest, isValidEmail } from '../../../../src/lib/account/security';

async function readPayload(response: Response) {
  try {
    return await response.json() as DlavieAuthPayload;
  } catch {
    return {} as DlavieAuthPayload;
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false, message: 'Invalid request origin.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!isValidEmail(email) || !password) {
    return NextResponse.json({ ok: false, message: 'Enter a valid email and password.' }, { status: 400 });
  }

  const rateLimit = checkLoginRateLimit(request, email);
  if (rateLimit.limited) {
    return NextResponse.json(
      { ok: false, message: 'Too many sign-in attempts. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
    );
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
