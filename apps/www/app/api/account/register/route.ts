import { NextResponse } from 'next/server';
import {
  getSupabaseAuthEndpoint,
  getSupabaseRequestHeaders,
} from '../../../../src/lib/supabase/url';
import {
  DLAVIE_ACCESS_COOKIE,
  DLAVIE_REFRESH_COOKIE,
  getAuthMessage,
  isSecureCookieRuntime,
  type DlavieAuthPayload,
} from '../../../../src/lib/supabase/session';

async function readPayload(response: Response) {
  try {
    return (await response.json()) as DlavieAuthPayload;
  } catch {
    return {} as DlavieAuthPayload;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const interest = String(body.interest ?? 'commerce');

  if (!name || !email || !password) {
    return NextResponse.json(
      { ok: false, message: 'Name, email, and password are required.' },
      { status: 400 },
    );
  }

  if (password.length < 12) {
    return NextResponse.json(
      { ok: false, message: 'Password must contain at least 12 characters.' },
      { status: 400 },
    );
  }

  const response = await fetch(getSupabaseAuthEndpoint('/signup'), {
    method: 'POST',
    headers: getSupabaseRequestHeaders(),
    body: JSON.stringify({
      email,
      password,
      data: {
        full_name: name,
        product_interest: interest,
        source: 'dlavie-www',
      },
    }),
    cache: 'no-store',
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    return NextResponse.json(
      { ok: false, message: getAuthMessage(payload, 'Unable to create your DLavie Account.') },
      { status: response.status || 400 },
    );
  }

  if (!payload.access_token || !payload.refresh_token) {
    return NextResponse.json({
      ok: true,
      requiresConfirmation: true,
      message:
        'Account created. Please check your email to confirm your DLavie Account before signing in.',
      redirectTo: '/account/login',
    });
  }

  const result = NextResponse.json({ ok: true, redirectTo: '/account/onboarding' });
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
