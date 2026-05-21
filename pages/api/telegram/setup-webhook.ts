import type { NextApiRequest, NextApiResponse } from 'next';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi.`);
  return value;
}

function appUrl() {
  return getRequiredEnv('NEXT_PUBLIC_APP_URL').replace(/\/$/, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const setupKey = getRequiredEnv('TELEGRAM_SETUP_KEY');
    const key = String(req.query.key || req.headers['x-setup-key'] || '');
    if (key !== setupKey) return res.status(401).json({ error: 'Invalid setup key.' });

    const token = getRequiredEnv('TELEGRAM_BOT_TOKEN');
    const webhookUrl = `${appUrl()}/api/telegram/webhook`;
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: secretToken || undefined,
        allowed_updates: ['message'],
      }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json({
      ok: response.ok,
      webhookUrl,
      telegram: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup webhook failed';
    return res.status(500).json({ error: message });
  }
}
