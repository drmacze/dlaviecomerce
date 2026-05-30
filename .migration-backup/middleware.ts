import { NextRequest, NextResponse } from 'next/server';

const COOKIE_PAYLOAD = 'dlavie_admin_unlock';
const COOKIE_SIG = 'dlavie_admin_sig';

const maintenanceBypass = [
  '/maintenance',
  '/api/runtime/status',
  '/api/admin/runtime',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
];

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

function bypassMaintenance(path: string) {
  return maintenanceBypass.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

async function maintenanceEnabled(req: NextRequest) {
  try {
    const response = await fetch(new URL('/api/runtime/status', req.url), { cache: 'no-store' });
    const runtime = await response.json().catch(() => null);
    return Boolean(runtime?.maintenance?.enabled);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!bypassMaintenance(path) && await maintenanceEnabled(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  if (!path.startsWith('/admin')) return NextResponse.next();
  if (await unlocked(req)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/telegram-admin';
  url.searchParams.set('locked', '1');
  url.searchParams.set('next', path);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
