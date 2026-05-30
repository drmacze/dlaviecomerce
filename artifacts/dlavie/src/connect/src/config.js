import 'dotenv/config';

function text(name, fallback = '') {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function number(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  port: number('PORT', 8787),
  appUrl: text('DLAVIE_APP_URL', 'https://dlaviecomerce.vercel.app').replace(/\/$/, ''),
  botKey: text('BOT_GATE_KEY', ''),
  telegramToken: text('TELEGRAM_BOT_TOKEN', ''),
  telegramMode: text('TELEGRAM_MODE', 'off'),
  whatsappMode: text('WHATSAPP_MODE', 'manual'),
  whatsappOwner: text('WHATSAPP_OWNER_NUMBER', '')
};

export function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
