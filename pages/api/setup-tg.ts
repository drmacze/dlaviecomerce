import type { NextApiRequest, NextApiResponse } from 'next';

const envName = (...parts: string[]) => parts.join('_');

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi.`);
  return value;
}

function appBaseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

async function telegramPost(botKey: string, method: string, body: unknown) {
  const response = await fetch(`https://api.telegram.org/bot${botKey}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const setupKeyName = envName('TELEGRAM', 'SETUP', 'KEY');
    const botKeyName = envName('TELEGRAM', 'BOT', 'TOKEN');
    const key = String(req.query.key || '');
    if (key !== required(setupKeyName)) return res.status(401).json({ error: 'Invalid key' });

    const botKey = required(botKeyName);
    const appUrl = appBaseUrl(req);
    const webhookUrl = `${appUrl}/api/tg`;
    const menuUrl = `${appUrl}/telegram-admin`;

    const webhook = await telegramPost(botKey, 'setWebhook', { url: webhookUrl });
    const menuButton = await telegramPost(botKey, 'setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: 'Open Dlavie',
        web_app: { url: menuUrl },
      },
    });

    return res.status(webhook.ok && menuButton.ok ? 200 : 500).json({
      ok: webhook.ok && menuButton.ok,
      appUrl,
      webhook: webhookUrl,
      menuButton: menuUrl,
      data: { webhook: webhook.data, menuButton: menuButton.data },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup failed';
    return res.status(500).json({ error: message });
  }
}
