import type { NextApiRequest, NextApiResponse } from 'next';
import { replyDlavieStats } from '@/lib/telegram-report-reply';
import { sendPendingTopupQueue } from '@/lib/telegram-topup-queue';
import { sendTelegramMessage } from '@/lib/telegram';

type TgUser = { id?: string | number; username?: string };
type TgMessage = { text?: string; from?: TgUser; chat?: { id?: string | number } };

type TgBody = { message?: TgMessage };

function baseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  return host ? `${proto}://${host}` : String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app');
}

function adminIds() {
  return String(process.env.DLAVIE_ADMIN_IDS || process.env.TELEGRAM_ADMIN_IDS || process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
}

function isAdmin(message?: TgMessage) {
  const fromId = String(message?.from?.id || '');
  const chatId = String(message?.chat?.id || '');
  const username = String(message?.from?.username || '').replace(/^@/, '').toLowerCase();
  return adminIds().some((id) => {
    const value = id.replace(/^@/, '').toLowerCase();
    return value === fromId || value === chatId || (!!username && value === username);
  });
}

function adminLinks(appUrl: string) {
  return { inline_keyboard: [[{ text: 'Topups', url: `${appUrl}/admin/topups` }, { text: 'Orders', url: `${appUrl}/admin/order-pulse` }], [{ text: 'Hub', url: `${appUrl}/admin/hub` }, { text: 'Gate', url: `${appUrl}/telegram-admin` }]] };
}

async function reply(chatId: string | number, text: string, replyMarkup?: unknown) {
  return sendTelegramMessage(chatId, text, { disableWebPagePreview: true, replyMarkup });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true, endpoint: 'tg-live' });
  try {
    const body = req.body as TgBody;
    const message = body.message;
    const chatId = message?.chat?.id;
    const text = String(message?.text || '').trim().toLowerCase();
    const appUrl = baseUrl(req).replace(/\/$/, '');
    if (!chatId) return res.status(200).json({ ok: true });

    if (text === '/id' || text.includes('id')) {
      await reply(chatId, [`Telegram User ID: ${message?.from?.id || '-'}`, `Chat ID: ${message?.chat?.id || '-'}`, `Username: ${message?.from?.username ? '@' + message.from.username : '-'}`].join('\n'));
      return res.status(200).json({ ok: true });
    }

    if (!isAdmin(message)) {
      await reply(chatId, 'Access denied. Bot ini hanya untuk admin Dlavie. Gunakan /id untuk melihat ID kamu.');
      return res.status(200).json({ ok: true, denied: true });
    }

    if (text === '/stats' || text.includes('stats')) await replyDlavieStats(chatId, appUrl);
    else if (text === '/topup' || text === '/topups' || text === '/payments' || text === '/manual' || text.includes('topup') || text.includes('payment')) await sendPendingTopupQueue(chatId, appUrl);
    else if (text === '/status' || text.includes('status')) await reply(chatId, ['Dlavie Bot Live OK', 'Webhook: tg-live', 'Topup queue: actionable', `Admin IDs: ${adminIds().length}`].join('\n'), adminLinks(appUrl));
    else await reply(chatId, 'Dlavie Telegram Commerce Center aktif. Command: /stats, /topup, /payments, /status', adminLinks(appUrl));

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: false });
  }
}
