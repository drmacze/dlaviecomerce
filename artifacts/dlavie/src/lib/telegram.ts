type TelegramParseMode = 'HTML' | 'MarkdownV2' | 'Markdown';

type SendTelegramOptions = {
  parseMode?: TelegramParseMode;
  disableWebPagePreview?: boolean;
  replyMarkup?: unknown;
};

function getBotToken() {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN belum diisi.');
  return token;
}

export function getAdminChatIds() {
  return String(import.meta.env.DLAVIE_ADMIN_IDS || import.meta.env.TELEGRAM_ADMIN_IDS || import.meta.env.TELEGRAM_ADMIN_CHAT_IDS || '')
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

  const payloadText = await response.text();
  let payload: unknown = payloadText;
  try { payload = JSON.parse(payloadText); } catch {}

  if (!response.ok) {
    throw new Error(`Telegram sendMessage gagal untuk chat ${chatId}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }

  return payload;
}

export async function sendTelegramMessageToAdmins(text: string, options: SendTelegramOptions = {}) {
  const chatIds = getAdminChatIds();
  if (!chatIds.length) return { ok: false, sent: 0, failed: 0, reason: 'DLAVIE_ADMIN_IDS / TELEGRAM_ADMIN_IDS belum diisi.', details: [] as string[] };

  const results = await Promise.allSettled(chatIds.map((chatId) => sendTelegramMessage(chatId, text, options)));
  const details = results.map((result, index) => result.status === 'fulfilled'
    ? `sent:${chatIds[index]}`
    : `failed:${chatIds[index]}:${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);

  return {
    ok: results.every((result) => result.status === 'fulfilled'),
    sent: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
    details,
  };
}
