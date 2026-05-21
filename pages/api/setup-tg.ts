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
    const appUrl = required('NEXT_PUBLIC_APP_URL').replace(/\/$/, '');
    const endpoint = ['https://api.telegram.org', `bot${botKey}`, 'setWebhook'].join('/');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `${appUrl}/api/tg` }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json({ ok: response.ok, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup failed';
    return res.status(500).json({ error: message });
  }
}
