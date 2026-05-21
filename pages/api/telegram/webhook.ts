import type { NextApiRequest, NextApiResponse } from 'next';
import {
  escapeTelegramHtml,
  getAdminChatIds,
  sendTelegramMessage,
  sendTelegramMessageToAdmins,
} from '@/lib/telegram';

type TelegramMessage = {
  message_id?: number;
  text?: string;
  chat?: { id?: number | string; type?: string };
  from?: { id?: number; first_name?: string; username?: string };
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

function isAdmin(chatId: string | number) {
  const adminIds = getAdminChatIds();
  return adminIds.includes(String(chatId));
}

function appUrl() {
  return String(process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
}

async function handleCommand(message: TelegramMessage) {
  const chatId = message.chat?.id;
  const text = String(message.text || '').trim();
  if (!chatId || !text.startsWith('/')) return;

  const command = text.split(/\s+/)[0].replace(/@.+$/, '').toLowerCase();

  if (command === '/start') {
    await sendTelegramMessage(
      chatId,
      [
        '👋 <b>Selamat datang di Dlavie Bot</b>',
        '',
        'Bot ini dipakai untuk notifikasi dan kontrol ringan project Dlavie.',
        '',
        'Perintah:',
        '/help - bantuan',
        '/myid - lihat chat ID',
        '/status - cek status bot',
      ].join('\n'),
      { parseMode: 'HTML' },
    );
    return;
  }

  if (command === '/help') {
    await sendTelegramMessage(
      chatId,
      [
        '📌 <b>Bantuan Dlavie Bot</b>',
        '',
        '/start - mulai bot',
        '/myid - lihat chat ID kamu',
        '/status - cek status bot',
        '/ping - test koneksi',
        '/admin_stats - ringkasan admin',
        '/test_order - simulasi notifikasi order',
      ].join('\n'),
      { parseMode: 'HTML' },
    );
    return;
  }

  if (command === '/myid') {
    await sendTelegramMessage(
      chatId,
      [
        '🆔 <b>Telegram Chat ID</b>',
        '',
        `<code>${escapeTelegramHtml(chatId)}</code>`,
        '',
        'Masukkan ID ini ke environment variable:',
        '<code>DLAVIE_ADMIN_IDS</code>',
      ].join('\n'),
      { parseMode: 'HTML' },
    );
    return;
  }

  if (command === '/status') {
    await sendTelegramMessage(
      chatId,
      [
        '✅ <b>Dlavie Bot aktif</b>',
        '',
        'Mode: Webhook',
        `App: ${escapeTelegramHtml(appUrl() || 'NEXT_PUBLIC_APP_URL belum diisi')}`,
      ].join('\n'),
      { parseMode: 'HTML' },
    );
    return;
  }

  if (command === '/ping') {
    await sendTelegramMessage(chatId, 'pong 🟢');
    return;
  }

  if (command === '/admin_stats') {
    if (!isAdmin(chatId)) {
      await sendTelegramMessage(chatId, '⛔ Perintah ini hanya untuk admin Dlavie.');
      return;
    }

    await sendTelegramMessage(
      chatId,
      [
        '📊 <b>DLAVIE Admin Stats</b>',
        '',
        'Bot: Online',
        'Mode: Webhook',
        'Database stats: belum dihubungkan ke endpoint ini',
      ].join('\n'),
      { parseMode: 'HTML' },
    );
    return;
  }

  if (command === '/test_order') {
    if (!isAdmin(chatId)) {
      await sendTelegramMessage(chatId, '⛔ Perintah ini hanya untuk admin Dlavie.');
      return;
    }

    await sendTelegramMessageToAdmins(
      [
        '🧪 <b>Test Order - DLAVIE</b>',
        '',
        '<b>Order ID:</b> TEST-ORDER',
        '<b>Email:</b> customer@example.com',
        '<b>Total:</b> Rp99.000',
        '',
        'Jika pesan ini masuk, notifikasi Telegram sudah aktif.',
      ].join('\n'),
      { parseMode: 'HTML' },
    );
    return;
  }

  await sendTelegramMessage(chatId, 'Perintah belum dikenal. Ketik /help untuk melihat bantuan.');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const actualSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (actualSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Invalid Telegram webhook secret.' });
    }
  }

  try {
    const update = req.body as TelegramUpdate;
    if (update.message) await handleCommand(update.message);
    return res.status(200).json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram webhook failed';
    console.error(message);
    return res.status(200).json({ ok: false, error: message });
  }
}
