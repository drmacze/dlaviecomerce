import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTelegramMessage } from '@/lib/telegram';

type IncomingMessage = { text?: string; chat?: { id?: string | number } };
type IncomingBody = { message?: IncomingMessage };

function appBaseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

function launcherPath() {
  return '/telegram-admin';
}

function keyboardButtons() {
  return {
    keyboard: [
      [{ text: '🚀 Panel' }, { text: '👑 Hub' }],
      [{ text: '📊 Stats' }, { text: '🛒 Orders' }],
      [{ text: '🛡 Security' }, { text: '🧾 Logs' }],
    ],
    resize_keyboard: true,
    is_persistent: true,
    one_time_keyboard: false,
  };
}

function inlineButtons(appUrl: string) {
  return {
    inline_keyboard: [
      [{ text: '🚀 Panel terbaru', url: `${appUrl}${launcherPath()}` }, { text: '👑 Hub terbaru', url: `${appUrl}/admin/hub` }],
      [{ text: '📊 Stats', url: `${appUrl}/admin/intelligence` }, { text: '🛒 Orders', url: `${appUrl}/admin/order-pulse` }],
      [{ text: '🛡 Security', url: `${appUrl}/admin/security` }, { text: '🧾 Logs', url: `${appUrl}/admin/sec` }],
    ],
  };
}

async function reply(chatId: string | number, text: string, replyMarkup?: unknown) {
  await sendTelegramMessage(chatId, text, { disableWebPagePreview: true, replyMarkup });
}

async function replyMenu(chatId: string | number, appUrl: string) {
  await reply(chatId, [
    '🚀 Dlavie Admin Keyboard aktif',
    '',
    'Tombol kotak admin sudah dipasang di keyboard Telegram bawah.',
    'Gunakan Panel/Hub/Stats/Orders/Security/Logs.',
  ].join('\n'), keyboardButtons());

  await reply(chatId, 'Pilih juga dari tombol cepat ini:', inlineButtons(appUrl));
}

async function replyLink(chatId: string | number, title: string, url: string, description: string, appUrl: string) {
  await reply(chatId, [`✨ ${title}`, '', description].join('\n'), {
    inline_keyboard: [[{ text: `Open ${title}`, url }], [{ text: '🚀 Panel terbaru', url: `${appUrl}${launcherPath()}` }]],
  });
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  try {
    const body = req.body as IncomingBody;
    const chatId = body.message?.chat?.id;
    const text = normalize(String(body.message?.text || ''));
    const appUrl = appBaseUrl(req);
    if (!chatId) return res.status(200).json({ ok: true });

    if (text === '/start' || text === '/menu' || text === '/help' || text === 'menu') await replyMenu(chatId, appUrl);
    else if (text === '/panel' || text === '/p' || text.includes('panel')) await replyLink(chatId, 'Dlavie Panel Terbaru', `${appUrl}${launcherPath()}`, 'Launcher admin Telegram versi terbaru.', appUrl);
    else if (text === '/hub' || text.includes('hub')) await replyLink(chatId, 'Dlavie Admin Hub Terbaru', `${appUrl}/admin/hub`, 'Gerbang utama semua modul admin premium terbaru.', appUrl);
    else if (text === '/stats' || text === '/intelligence' || text.includes('stats')) await replyLink(chatId, 'Dlavie Admin Intelligence', `${appUrl}/admin/intelligence`, 'Stats rinci, system health, revenue view, logs, dan audits.', appUrl);
    else if (text === '/security' || text.includes('security')) await replyLink(chatId, 'Dlavie Security Center', `${appUrl}/admin/security`, 'Security foundation, admin guard, dan health overview.', appUrl);
    else if (text === '/logs' || text.includes('logs')) await replyLink(chatId, 'Dlavie Observability Live', `${appUrl}/admin/sec`, 'Notification logs, audit logs, dan failed delivery.', appUrl);
    else if (text === '/orders' || text.includes('orders')) await replyLink(chatId, 'Dlavie Order Pulse', `${appUrl}/admin/order-pulse`, 'Order dashboard dengan audited status actions.', appUrl);
    else if (text === '/status') await reply(chatId, ['✅ Dlavie Bot aktif', '', 'Mode: Telegram admin keyboard', 'Public website: clean', 'Panel terbaru: ready'].join('\n'), keyboardButtons());

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: false });
  }
}
