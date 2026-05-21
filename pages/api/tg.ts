import type { NextApiRequest, NextApiResponse } from 'next';
import { sendTelegramMessage } from '@/lib/telegram';

type IncomingMessage = {
  text?: string;
  chat?: { id?: string | number };
};

type IncomingBody = {
  message?: IncomingMessage;
};

async function replyWithPanel(chatId: string | number) {
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce.vercel.app').replace(/\/$/, '');
  await sendTelegramMessage(chatId, `🚀 Dlavie Mobile Panel\n\nBuka panel di sini:\n${appUrl}/p\n\nCommand lain:\n/menu\n/panel`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  try {
    const body = req.body as IncomingBody;
    const chatId = body.message?.chat?.id;
    const text = String(body.message?.text || '').trim().toLowerCase();

    if (chatId && (text === '/start' || text === '/menu' || text === '/panel')) {
      await replyWithPanel(chatId);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ ok: false });
  }
}
