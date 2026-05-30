import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminChatIds, sendTelegramMessageToAdmins } from '@/lib/telegram';

function testKey() {
  return String(process.env.DLAVIE_ADMIN_ACTION_KEY || process.env.TELEGRAM_SETUP_KEY || '').trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = String(req.query.key || '').trim();
    const secret = testKey();
    if (!secret || key !== secret) return res.status(401).json({ error: 'Invalid key' });

    const ids = getAdminChatIds();
    const result = await sendTelegramMessageToAdmins([
      '✅ Dlavie Telegram Test',
      '',
      'Jika pesan ini masuk, TELEGRAM_BOT_TOKEN dan DLAVIE_ADMIN_IDS sudah benar.',
      `Admin targets: ${ids.length}`,
      `Time: ${new Date().toISOString()}`,
    ].join('\n'));

    return res.status(200).json({ ok: result.ok, adminTargets: ids.length, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram test failed';
    return res.status(500).json({ error: message });
  }
}
