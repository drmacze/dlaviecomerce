import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const COOKIE_PAYLOAD = 'dlavie_admin_unlock';
const COOKIE_SIG = 'dlavie_admin_sig';
const SESSION_SECONDS = 60 * 60 * 6;

function base64url(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function sessionSecret() {
  return process.env.DLAVIE_ADMIN_SESSION_SECRET || process.env.TELEGRAM_SETUP_KEY || '';
}

function securityKey() {
  return process.env.DLAVIE_ADMIN_SECURITY_KEY || '';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function setSessionCookies(res: NextApiResponse) {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({ iat: now, exp: now + SESSION_SECONDS, scope: 'dlavie-admin' }));
  const sig = sign(payload);
  const base = `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`;
  res.setHeader('Set-Cookie', [`${COOKIE_PAYLOAD}=${payload}; ${base}`, `${COOKIE_SIG}=${sig}; ${base}`]);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!securityKey()) return res.status(500).json({ ok: false, error: 'DLAVIE_ADMIN_SECURITY_KEY belum diisi.' });
  if (!sessionSecret()) return res.status(500).json({ ok: false, error: 'DLAVIE_ADMIN_SESSION_SECRET belum diisi.' });

  const input = String(req.body?.key || '');
  if (!input || !safeEqual(input, securityKey())) return res.status(401).json({ ok: false, error: 'Security key salah.' });

  setSessionCookies(res);
  return res.status(200).json({ ok: true, unlocked: true, expiresIn: SESSION_SECONDS });
}
