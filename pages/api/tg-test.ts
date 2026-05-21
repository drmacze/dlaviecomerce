import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = String(req.query.key || '');
    if (key !== process.env.TELEGRAM_SETUP_KEY) return res.status(401).json({ error: 'Invalid key' });

    const result = await sendTelegramMessageToAdmins('Dlavie Telegram test berhasil.');
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Test failed';
    return res.status(500).json({ error: message });
  }
}
