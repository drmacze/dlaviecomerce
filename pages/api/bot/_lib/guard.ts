import type { NextApiRequest, NextApiResponse } from 'next';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function getExpectedBotKey() {
  return process.env.BOT_GATE_KEY || process.env.DLAVIE_API_TOKEN || '';
}

function getIncomingBotKey(req: NextApiRequest) {
  const authorization = req.headers.authorization || '';
  const customHeader = req.headers['x-dlavie-bot-key'];

  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  if (Array.isArray(customHeader)) return customHeader[0] || '';
  return customHeader || '';
}

export function ensureMethod(req: NextApiRequest, res: NextApiResponse, methods: Method[]) {
  if (methods.includes(req.method as Method)) return true;

  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({
    ok: false,
    error: `Method ${req.method} tidak diizinkan.`
  });
  return false;
}

export function ensureBotRequest(req: NextApiRequest, res: NextApiResponse) {
  const expected = getExpectedBotKey();

  if (!expected) {
    res.status(500).json({
      ok: false,
      error: 'BOT_GATE_KEY belum diatur di Vercel Environment Variables.'
    });
    return false;
  }

  if (getIncomingBotKey(req) !== expected) {
    res.status(401).json({
      ok: false,
      error: 'Unauthorized bot request.'
    });
    return false;
  }

  return true;
}

export function withBotApi(methods: Method[], handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async function botApiHandler(req: NextApiRequest, res: NextApiResponse) {
    if (!ensureMethod(req, res, methods)) return;
    if (!ensureBotRequest(req, res)) return;

    try {
      await handler(req, res);
    } catch (error) {
      console.error('[dlavie-bot-api]', error);
      res.status(500).json({
        ok: false,
        error: 'Terjadi kesalahan server pada API bot Dlavie.'
      });
    }
  };
}

export function publicId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function numericCode(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(min + Math.random() * (max - min)));
}

export function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function guardHelperRoute(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(404).json({
    ok: false,
    error: 'Not found.'
  });
}
