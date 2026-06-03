import { NextResponse } from 'next/server';
import {
  DLAVIE_ACCESS_COOKIE,
  DLAVIE_REFRESH_COOKIE,
  isSecureCookieRuntime,
} from '../../lib/supabase/session';
import type { AuthenticatedPayload } from './authService';

export function setAuthCookies(response: NextResponse, payload: AuthenticatedPayload) {
  const secure = isSecureCookieRuntime();

  response.cookies.set(DLAVIE_ACCESS_COOKIE, payload.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.max(payload.expires_in ?? 3600, 60),
  });

  response.cookies.set(DLAVIE_REFRESH_COOKIE, payload.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
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
