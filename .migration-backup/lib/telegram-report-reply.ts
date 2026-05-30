import { buildDlaviePaymentsReport, buildDlavieStatsReport } from '@/lib/telegram-admin-report';
import { sendTelegramMessage } from '@/lib/telegram';

function reportButtons(appUrl: string) {
  return {
    inline_keyboard: [
      [{ text: '🚀 Secure Gate', url: `${appUrl}/telegram-admin` }],
      [{ text: '🛒 Orders', url: `${appUrl}/admin/order-pulse` }, { text: '💳 Topups', url: `${appUrl}/admin/topups` }],
      [{ text: '📊 Stats Panel', url: `${appUrl}/admin/intelligence` }, { text: '👑 Admin Hub', url: `${appUrl}/admin/hub` }],
    ],
  };
}

export async function replyDlavieStats(chatId: string | number, appUrl: string) {
  try {
    await sendTelegramMessage(chatId, await buildDlavieStatsReport(appUrl), { disableWebPagePreview: true, replyMarkup: reportButtons(appUrl) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stats report failed';
    await sendTelegramMessage(chatId, `⚠️ Gagal mengambil live stats: ${message}`, { disableWebPagePreview: true, replyMarkup: reportButtons(appUrl) });
  }
}

export async function replyDlaviePayments(chatId: string | number, appUrl: string) {
  try {
    await sendTelegramMessage(chatId, await buildDlaviePaymentsReport(appUrl), { disableWebPagePreview: true, replyMarkup: reportButtons(appUrl) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment report failed';
    await sendTelegramMessage(chatId, `⚠️ Gagal mengambil payment report: ${message}`, { disableWebPagePreview: true, replyMarkup: reportButtons(appUrl) });
  }
}
