import type { NextApiRequest, NextApiResponse } from 'next';

const join = (...parts: string[]) => parts.join('_');

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi.`);
  return value;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = String(req.query.key || '');
    if (key !== required(join('TELEGRAM', 'SETUP', 'KEY'))) return res.status(401).json({ error: 'Invalid key' });

    const botKey = required(join('TELEGRAM', 'BOT', 'TOKEN'));
    const appUrl = required('NEXT_PUBLIC_APP_URL').replace(/\/$/, '');
    const endpoint = ['https://api.telegram.org', `bot${botKey}`, 'setChatMenuButton'].join('/');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Open Dlavie',
          web_app: { url: `${appUrl}/p` },
        },
      }),
    });

    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json({ ok: response.ok, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Setup panel failed';
    return res.status(500).json({ error: message });
  }
}
