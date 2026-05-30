import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const COOKIE_PAYLOAD = 'dlavie_admin_unlock';
const COOKIE_SIG = 'dlavie_admin_sig';

function sessionSecret() {
  return process.env.DLAVIE_ADMIN_SESSION_SECRET || process.env.TELEGRAM_SETUP_KEY || '';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function safeEqual(a = '', b = '') {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function isUnlocked(req: NextApiRequest) {
  const payload = req.cookies[COOKIE_PAYLOAD] || '';
  const sig = req.cookies[COOKIE_SIG] || '';
  if (!payload || !sig || !sessionSecret()) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number; scope?: string };
    return data.scope === 'dlavie-admin' && Number(data.exp || 0) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ ok: true, unlocked: isUnlocked(req) });
}
