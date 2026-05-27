import type { NextApiRequest, NextApiResponse } from 'next';
import { replyDlaviePayments, replyDlavieStats } from '@/lib/telegram-report-reply';
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
  const allowed = adminIds();
  const fromId = String(message?.from?.id || '');
  const chatId = String(message?.chat?.id || '');
  const username = String(message?.from?.username || '').replace(/^@/, '').toLowerCase();
  return allowed.some((item) => {
    const value = item.replace(/^@/, '').toLowerCase();
    return value === fromId || value === chatId || (!!username && value === username);
  });
}

function idText(message?: TgMessage) {
  return [`Telegram User ID: ${message?.from?.id || '-'}`, `Chat ID: ${message?.chat?.id || '-'}`, `Username: ${message?.from?.username ? `@${message.from.username}` : '-'}`].join('\n');
}

function keyboard() {
  return {
    keyboard: [
      [{ text: '📊 Stats' }, { text: '💳 Payments' }],
      [{ text: '🛒 Orders' }, { text: '👑 Hub' }],
      [{ text: '🚀 Panel' }, { text: '🛡 Security' }],
      [{ text: '✅ Status' }, { text: '🪪 ID' }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function buttons(appUrl: string) {
  return {
    inline_keyboard: [
      [{ text: '🚀 Secure Gate', url: `${appUrl}/telegram-admin` }],
      [{ text: '🛒 Orders', url: `${appUrl}/admin/order-pulse` }, { text: '💳 Topups', url: `${appUrl}/admin/topups` }],
      [{ text: '📊 Stats Panel', url: `${appUrl}/admin/intelligence` }, { text: '👑 Admin Hub', url: `${appUrl}/admin/hub` }],
    ],
  };
}

async function reply(chatId: string | number, text: string, markup?: unknown) {
  await sendTelegramMessage(chatId, text, { disableWebPagePreview: true, replyMarkup: markup });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true, endpoint: 'tg-live' });
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

    if (text === '/stats' || text === 'stats' || text.includes('📊')) await replyDlavieStats(chatId, appUrl);
    else if (text === '/payments' || text === '/payment' || text === '/topups' || text === '/topup' || text === '/manual' || text.includes('payment') || text.includes('topup') || text.includes('💳')) await replyDlaviePayments(chatId, appUrl);
    else if (text === '/orders' || text === '/order' || text.includes('orders') || text.includes('order') || text.includes('🛒')) await reply(chatId, '🛒 Dlavie Orders Center', buttons(appUrl));
    else if (text === '/panel' || text.includes('panel') || text.includes('🚀')) await reply(chatId, '🚀 Dlavie Secure Admin Panel', buttons(appUrl));
    else if (text === '/hub' || text.includes('hub') || text.includes('👑')) await reply(chatId, '👑 Dlavie Admin Hub', buttons(appUrl));
    else if (text === '/security' || text.includes('security') || text.includes('🛡')) await reply(chatId, ['🛡 Dlavie Security', '', `Admin IDs: ${adminIds().length}`, `Panel: ${appUrl}/telegram-admin`].join('\n'), buttons(appUrl));
    else if (text === '/status' || text.includes('status') || text.includes('✅')) await reply(chatId, ['✅ Dlavie Bot Live', '', 'Webhook: tg-live', 'Reports: stats/payments active', 'Security: admin allowlist active'].join('\n'), buttons(appUrl));
    else await reply(chatId, '🚀 Dlavie Live Command Center aktif. Pilih menu di bawah.', keyboard());

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: false });
  }
}
