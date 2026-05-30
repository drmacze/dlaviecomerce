import { config } from './config.js';

async function telegramApi(method, payload) {
  if (!config.telegramToken) {
    throw new Error('TELEGRAM_BOT_TOKEN belum diatur.');
  }

  const response = await fetch(`https://api.telegram.org/bot${config.telegramToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error: ${response.status}`);
  }
  return data.result;
}

async function runWebhook() {
  const url = process.env.TELEGRAM_WEBHOOK_URL;
  if (!url) throw new Error('TELEGRAM_WEBHOOK_URL belum diatur.');
  const result = await telegramApi('setWebhook', { url });
  console.log('[telegram] webhook configured:', result);
}

async function runPoll() {
  console.log('[telegram] polling mode placeholder aktif. Token:', config.telegramToken ? 'set' : 'empty');
  console.log('[telegram] Untuk bot Telegram production, sambungkan handler command setelah WhatsApp adapter stabil.');
}

const mode = process.argv[2] || 'poll';

if (mode === 'webhook') {
  runWebhook().catch((error) => {
    console.error('[telegram:webhook]', error.message);
    process.exit(1);
  });
} else {
  runPoll().catch((error) => {
    console.error('[telegram:poll]', error.message);
    process.exit(1);
  });
}
