import { NextResponse } from 'next/server';
import { clearAuthCookies } from '../../../../src/server/account/authCookies';

export async function POST() {
  const response = NextResponse.json({ ok: true, redirectTo: '/account/login' });
  clearAuthCookies(response);
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL('/account/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dlavie.vercel.app'));
  clearAuthCookies(response);
  return response;
}
