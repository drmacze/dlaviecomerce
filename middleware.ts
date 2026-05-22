import { NextRequest, NextResponse } from 'next/server';

const COOKIE_PAYLOAD = 'dlavie_admin_unlock';
const COOKIE_SIG = 'dlavie_admin_sig';

function base64url(bytes: ArrayBuffer) {
  const raw = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)));
}

function decodePayload(payload: string) {
  try {
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number; scope?: string };
  } catch {
    return null;
  }
}

async function unlocked(req: NextRequest) {
  const payload = req.cookies.get(COOKIE_PAYLOAD)?.value || '';
  const sig = req.cookies.get(COOKIE_SIG)?.value || '';
  const secret = process.env.DLAVIE_ADMIN_SESSION_SECRET || process.env.TELEGRAM_SETUP_KEY || '';
  if (!payload || !sig || !secret) return false;
  const expected = await sign(payload, secret);
  if (sig !== expected) return false;
  const data = decodePayload(payload);
  return data?.scope === 'dlavie-admin' && Number(data.exp || 0) > Math.floor(Date.now() / 1000);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!path.startsWith('/admin')) return NextResponse.next();
  if (await unlocked(req)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/telegram-admin';
  url.searchParams.set('locked', '1');
  url.searchParams.set('next', path);
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*'] };
