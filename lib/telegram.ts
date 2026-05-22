type TelegramParseMode = 'HTML' | 'MarkdownV2' | 'Markdown';

type SendTelegramOptions = {
  parseMode?: TelegramParseMode;
  disableWebPagePreview?: boolean;
  replyMarkup?: unknown;
};

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN belum diisi.');
  return token;
}

export function getAdminChatIds() {
  return String(process.env.DLAVIE_ADMIN_IDS || process.env.TELEGRAM_ADMIN_CHAT_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: SendTelegramOptions = {},
) {
  const token = getBotToken();
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options.parseMode,
      disable_web_page_preview: options.disableWebPagePreview ?? true,
      reply_markup: options.replyMarkup,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram sendMessage gagal: ${errorText}`);
  }

  return response.json();
}

export async function sendTelegramMessageToAdmins(text: string, options: SendTelegramOptions = {}) {
  const chatIds = getAdminChatIds();
  if (!chatIds.length) return { ok: false, sent: 0, failed: 0, reason: 'DLAVIE_ADMIN_IDS belum diisi.' };

  const results = await Promise.allSettled(chatIds.map((chatId) => sendTelegramMessage(chatId, text, options)));

  return {
    ok: results.every((result) => result.status === 'fulfilled'),
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  };
}
