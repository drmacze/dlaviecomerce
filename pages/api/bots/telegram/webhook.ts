import type { NextApiRequest, NextApiResponse } from 'next';

function getBaseUrl(req: NextApiRequest) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = req.headers.host || 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

function parseNext(text: string) {
  if (text.includes('wallet')) return '/wallet';
  if (text.includes('orders')) return '/orders';
  if (text.includes('checkout')) return '/checkout';
  return '/dashboard';
}

function getTelegramAuthBotToken() {
  return process.env.DLAVIE_TELEGRAM_AUTH_BOT_TOKEN || process.env.DLAVIE_TELEGRAM_OTP_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
}

async function sendTelegramMessage(chatId: number | string, text: string) {
  const token = getTelegramAuthBotToken();
  if (!token) throw new Error('Telegram auth bot token belum diset. Pakai DLAVIE_TELEGRAM_AUTH_BOT_TOKEN atau DLAVIE_TELEGRAM_OTP_BOT_TOKEN.');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${body}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, service: 'DLAVIE Telegram OTP webhook' });
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const message = req.body?.message || req.body?.edited_message;
    const chatId = message?.chat?.id;
    const from = message?.from;
    const text = String(message?.text || '').trim();

    if (!chatId || !from) return res.status(200).json({ ok: true, ignored: true });

    const shouldCreateCode = text.startsWith('/start') || text.startsWith('/login') || text.toLowerCase().includes('login');
    if (!shouldCreateCode) {
      await sendTelegramMessage(chatId, 'Ketik <b>/login</b> untuk membuat kode masuk DLAVIE.');
      return res.status(200).json({ ok: true });
    }

    const baseUrl = getBaseUrl(req);
    const createResponse = await fetch(`${baseUrl}/api/auth/pairing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dlavie-bot-secret': String(process.env.DLAVIE_BOT_AUTH_SECRET || '')
      },
      body: JSON.stringify({
        channel: 'telegram',
        externalId: String(from.id),
        displayName: [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Telegram User',
        next: parseNext(text)
      })
    });

    const data = await createResponse.json().catch(() => ({}));
    if (!createResponse.ok || !data.code) {
      await sendTelegramMessage(chatId, `Gagal membuat kode login DLAVIE. ${data.error || 'Coba lagi nanti.'}`);
      return res.status(200).json({ ok: true, pairing: false });
    }

    await sendTelegramMessage(chatId, `Kode login DLAVIE kamu:\n\n<code>${data.code}</code>\n\nMasukkan kode ini di halaman login DLAVIE. Kode berlaku 5 menit.`);
    return res.status(200).json({ ok: true, pairing: true });
  } catch (error) {
    return res.status(200).json({ ok: false, error: error instanceof Error ? error.message : 'Telegram webhook failed' });
  }
}
