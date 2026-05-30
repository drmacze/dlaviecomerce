import type { NextApiRequest, NextApiResponse } from 'next';

function getBaseUrl(req: NextApiRequest) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = req.headers.host || 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

function getTelegramAuthBotToken() {
  return process.env.DLAVIE_TELEGRAM_AUTH_BOT_TOKEN || process.env.DLAVIE_TELEGRAM_OTP_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
}

function assertSetupSecret(req: NextApiRequest) {
  const secret = process.env.DLAVIE_BOT_AUTH_SECRET;
  const provided = String(req.query.secret || req.headers['x-dlavie-bot-secret'] || '');
  return Boolean(secret && provided === secret);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!assertSetupSecret(req)) return res.status(401).json({ ok: false, error: 'Unauthorized setup request.' });

  const token = getTelegramAuthBotToken();
  if (!token) return res.status(500).json({ ok: false, error: 'Telegram auth bot token env belum diset.' });

  const baseUrl = getBaseUrl(req);
  const webhookUrl = `${baseUrl}/api/bots/telegram/webhook`;
  const action = String(req.query.action || 'set');
  const method = action === 'info' ? 'getWebhookInfo' : 'setWebhook';
  const url = action === 'info'
    ? `https://api.telegram.org/bot${token}/${method}`
    : `https://api.telegram.org/bot${token}/${method}?url=${encodeURIComponent(webhookUrl)}`;

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  return res.status(response.ok ? 200 : 502).json({
    ok: response.ok && data.ok !== false,
    action,
    webhookUrl,
    telegram: data
  });
}
