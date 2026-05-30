import type { NextApiRequest, NextApiResponse } from 'next';
import { replyDlavieStats } from '@/lib/telegram-report-reply';
import { sendPendingTopupQueue } from '@/lib/telegram-topup-queue';
import { sendTelegramMessage } from '@/lib/telegram';

type TgUser = { id?: string | number; username?: string };
type TgMessage = { text?: string; from?: TgUser; chat?: { id?: string | number } };
type TgBody = { message?: TgMessage };

function appBaseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

function adminIds() {
  return String(process.env.DLAVIE_ADMIN_IDS || process.env.TELEGRAM_ADMIN_IDS || process.env.TELEGRAM_ADMIN_CHAT_IDS || '').split(',').map((v) => v.trim()).filter(Boolean);
}

function isAdmin(message?: TgMessage) {
  const fromId = String(message?.from?.id || '');
  const chatId = String(message?.chat?.id || '');
  const username = String(message?.from?.username || '').replace(/^@/, '').toLowerCase();
  return adminIds().some((item) => {
    const value = item.replace(/^@/, '').toLowerCase();
    return value === fromId || value === chatId || (!!username && value === username);
  });
}

function buttons(appUrl: string) {
  return { inline_keyboard: [
    [{ text: '💳 Topups', url: `${appUrl}/admin/topups` }, { text: '🛒 Orders', url: `${appUrl}/admin/order-pulse` }],
    [{ text: '📊 Stats', url: `${appUrl}/admin/intelligence` }, { text: '👑 Hub', url: `${appUrl}/admin/hub` }],
    [{ text: '🚀 Secure Gate', url: `${appUrl}/telegram-admin` }],
  ] };
}

function keyboard() {
  return { keyboard: [[{ text: '📊 Stats' }, { text: '💳 Topups' }], [{ text: '🛒 Orders' }, { text: '✅ Status' }], [{ text: '🚀 Panel' }, { text: '🪪 ID' }]], resize_keyboard: true, is_persistent: true };
}

async function reply(chatId: string | number, text: string, replyMarkup?: unknown) {
  await sendTelegramMessage(chatId, text, { disableWebPagePreview: true, replyMarkup });
}

function idText(message?: TgMessage) {
  return [`Telegram User ID: ${message?.from?.id || '-'}`, `Chat ID: ${message?.chat?.id || '-'}`, `Username: ${message?.from?.username ? `@${message.from.username}` : '-'}`].join('\n');
}

async function replyTopups(chatId: string | number, appUrl: string) {
  try {
    await sendPendingTopupQueue(chatId, appUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Topup queue failed';
    await reply(chatId, `⚠️ Gagal mengambil pending topup: ${message}`, buttons(appUrl));
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true, endpoint: 'tg-core' });
  try {
    const body = req.body as TgBody;
    const message = body.message;
    const chatId = message?.chat?.id;
    const text = String(message?.text || '').trim().toLowerCase();
    const appUrl = appBaseUrl(req);
    if (!chatId) return res.status(200).json({ ok: true });

    if (text === '/id' || text === 'id' || text.includes('🪪')) {
      await reply(chatId, ['🪪 Dlavie Telegram Identity', '', idText(message), '', 'Masukkan Telegram User ID ke env DLAVIE_ADMIN_IDS.'].join('\n'));
      return res.status(200).json({ ok: true });
    }

    if (!isAdmin(message)) {
      await reply(chatId, ['⛔ Access denied', '', 'Bot ini hanya untuk admin Dlavie.', 'Gunakan /id untuk melihat Telegram User ID kamu.'].join('\n'));
      return res.status(200).json({ ok: true, denied: true });
    }

    if (text === '/stats' || text.includes('📊')) await replyDlavieStats(chatId, appUrl);
    else if (text === '/topup' || text === '/topups' || text === '/payments' || text === '/payment' || text === '/manual' || text.includes('topup') || text.includes('payment') || text.includes('💳')) await replyTopups(chatId, appUrl);
    else if (text === '/orders' || text === '/order' || text.includes('order') || text.includes('🛒')) await reply(chatId, '🛒 Dlavie Orders Center siap.', buttons(appUrl));
    else if (text === '/panel' || text.includes('panel') || text.includes('🚀')) await reply(chatId, '🚀 Dlavie Secure Admin Panel.', buttons(appUrl));
    else if (text === '/status' || text.includes('status') || text.includes('✅')) await reply(chatId, ['✅ Dlavie Bot Core Active', '', 'Webhook: tg-core', 'Stats: active', 'Topup queue: actionable', `Admin IDs: ${adminIds().length}`].join('\n'), buttons(appUrl));
    else await reply(chatId, '🚀 Dlavie Commerce Command Center aktif.', keyboard());

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: false });
  }
}
