import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';
import { writeNotificationLog } from '@/lib/observability';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = String(req.query.key || '');
    if (key !== process.env.TELEGRAM_SETUP_KEY) return res.status(401).json({ error: 'Invalid key' });

    const result = await sendTelegramMessageToAdmins('Dlavie Telegram test berhasil.');
    await writeNotificationLog({
      type: 'telegram.test',
      status: result.ok ? 'sent' : 'failed',
      title: 'Telegram test delivery',
      message: 'Dlavie Telegram test berhasil.',
      payload: { result },
      sentAt: result.ok ? new Date().toISOString() : undefined,
      errorMessage: result.ok ? undefined : 'Telegram test delivery failed',
    });

    return res.status(200).json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Test failed';
    await writeNotificationLog({
      type: 'telegram.test',
      status: 'failed',
      title: 'Telegram test delivery',
      message: 'Dlavie Telegram test berhasil.',
      errorMessage: message,
    });
    return res.status(500).json({ error: message });
  }
}
