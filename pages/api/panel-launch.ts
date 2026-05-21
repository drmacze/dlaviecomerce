import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';
import { writeNotificationLog } from '@/lib/observability';

const envName = (...parts: string[]) => parts.join('_');

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} belum diisi.`);
  return value;
}

function launcherButtons(appUrl: string) {
  return {
    inline_keyboard: [
      [
        { text: '🚀 Panel', url: `${appUrl}/p` },
        { text: '👑 Hub', url: `${appUrl}/admin/hub` },
      ],
      [
        { text: '📊 Stats', url: `${appUrl}/admin/intelligence` },
        { text: '🛒 Orders', url: `${appUrl}/admin/order-pulse` },
      ],
      [
        { text: '🛡 Security', url: `${appUrl}/admin/security` },
        { text: '🧾 Logs', url: `${appUrl}/admin/sec` },
      ],
    ],
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce.vercel.app').replace(/\/$/, '');
  const message = [
    '🚀 <b>DLAVIE Admin Launcher</b>',
    '',
    'Pilih tombol admin di bawah. Website publik tetap bersih, admin masuk dari Telegram.',
  ].join('\n');

  try {
    const key = String(req.query.key || '');
    if (key !== required(envName('TELEGRAM', 'SETUP', 'KEY'))) return res.status(401).json({ error: 'Invalid key' });

    const result = await sendTelegramMessageToAdmins(message, { parseMode: 'HTML', replyMarkup: launcherButtons(appUrl) });
    await writeNotificationLog({
      type: 'panel.launch',
      status: result.ok ? 'sent' : 'failed',
      title: 'Dlavie panel launcher buttons',
      message,
      payload: { result, panelUrl: `${appUrl}/p`, buttons: true },
      sentAt: result.ok ? new Date().toISOString() : undefined,
      errorMessage: result.ok ? undefined : 'Panel launch delivery failed',
    });

    return res.status(200).json({ ok: true, result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Panel launch failed';
    await writeNotificationLog({
      type: 'panel.launch',
      status: 'failed',
      title: 'Dlavie panel launcher buttons',
      message,
      payload: { panelUrl: `${appUrl}/p`, buttons: true },
      errorMessage,
    });
    return res.status(500).json({ error: errorMessage });
  }
}
