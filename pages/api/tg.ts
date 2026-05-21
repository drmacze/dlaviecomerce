import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTelegramMessage } from '@/lib/telegram';

type IncomingMessage = {
  text?: string;
  chat?: { id?: string | number };
};

type IncomingBody = {
  message?: IncomingMessage;
};

function appBaseUrl() {
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce.vercel.app').replace(/\/$/, '');
}

async function reply(chatId: string | number, text: string) {
  await sendTelegramMessage(chatId, text, { disableWebPagePreview: true });
}

async function replyMenu(chatId: string | number) {
  const appUrl = appBaseUrl();
  await reply(chatId, [
    '🚀 Dlavie Command Center',
    '',
    'Pilih command:',
    '',
    `/panel - Mobile panel ringkas`,
    `/hub - Premium admin hub`,
    `/orders - Order pulse dashboard`,
    `/signal - Signal center`,
    `/status - Status bot`,
    '',
    `Mobile Panel: ${appUrl}/p`,
  ].join('\n'));
}

async function replyLink(chatId: string | number, title: string, url: string, description: string) {
  await reply(chatId, [`✨ ${title}`, '', description, '', url].join('\n'));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  try {
    const body = req.body as IncomingBody;
    const chatId = body.message?.chat?.id;
    const text = String(body.message?.text || '').trim().toLowerCase();
    const appUrl = appBaseUrl();

    if (!chatId) return res.status(200).json({ ok: true });

    if (text === '/start' || text === '/menu') {
      await replyMenu(chatId);
    } else if (text === '/panel' || text === '/p') {
      await replyLink(chatId, 'Dlavie Mobile Panel', `${appUrl}/p`, 'Panel ringkas untuk akses cepat dari Telegram.');
    } else if (text === '/hub') {
      await replyLink(chatId, 'Dlavie Admin Hub', `${appUrl}/admin/hub`, 'Gerbang utama ke semua modul admin premium.');
    } else if (text === '/orders') {
      await replyLink(chatId, 'Dlavie Order Pulse', `${appUrl}/admin/order-pulse`, 'Pantau order, revenue, pending, dan cleared order.');
    } else if (text === '/signal') {
      await replyLink(chatId, 'Dlavie Signal Center', `${appUrl}/admin/signal`, 'Pantau signal flow, priority routing, dan aktivitas penting.');
    } else if (text === '/status') {
      await reply(chatId, ['✅ Dlavie Bot aktif', '', 'Mode: command center', 'Panel: ready', 'Admin delivery: configured'].join('\n'));
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: false });
  }
}
