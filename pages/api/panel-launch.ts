import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';

const envName = (...parts: string[]) => parts.join('_');

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi.`);
  return value;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = String(req.query.key || '');
    if (key !== required(envName('TELEGRAM', 'SETUP', 'KEY'))) return res.status(401).json({ error: 'Invalid key' });

    const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce.vercel.app').replace(/\/$/, '');
    const message = [
      '🚀 <b>DLAVIE Mobile Panel</b>',
      '',
      'Panel command sudah siap dibuka dari Telegram.',
      '',
      `🔗 ${appUrl}/p`,
      '',
      'Gunakan panel ini untuk akses cepat ke Admin Hub, Order Pulse, dan signal dashboard.',
    ].join('\n');

    const result = await sendTelegramMessageToAdmins(message, { parseMode: 'HTML' });
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Panel launch failed';
    return res.status(500).json({ error: message });
  }
}
