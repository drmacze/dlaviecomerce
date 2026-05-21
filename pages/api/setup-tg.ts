import type { NextApiRequest, NextApiResponse } from 'next';

const envName = (...parts: string[]) => parts.join('_');

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi.`);
  return value;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const setupKeyName = envName('TELEGRAM', 'SETUP', 'KEY');
    const botKeyName = envName('TELEGRAM', 'BOT', 'TOKEN');
    const key = String(req.query.key || '');
    if (key !== required(setupKeyName)) return res.status(401).json({ error: 'Invalid key' });

    const botKey = required(botKeyName);
    const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce.vercel.app').replace(/\/$/, '');
    const response = await fetch(`https://api.telegram.org/bot${botKey}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `${appUrl}/api/tg` }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json({ ok: response.ok, webhook: `${appUrl}/api/tg`, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup failed';
    return res.status(500).json({ error: message });
  }
}
