import { NextResponse } from 'next/server';
import { DLAVIE_ACCESS_COOKIE, DLAVIE_REFRESH_COOKIE, isSecureCookieRuntime } from '../../../../src/lib/supabase/session';

function clear(response: NextResponse) {
  const secure = isSecureCookieRuntime();

  response.cookies.set(DLAVIE_ACCESS_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });

  response.cookies.set(DLAVIE_REFRESH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 0,
  });
}

export async function POST() {
  const response = NextResponse.json({ ok: true, redirectTo: '/account/login' });
  clear(response);
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL('/account/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dlavie.vercel.app'));
  clear(response);
  return response;
}
