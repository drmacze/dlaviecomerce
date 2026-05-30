import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { sendTelegramMessage } from '@/lib/telegram';

type TopupRow = {
  id: string;
  user_id: string | null;
  amount: number | null;
  status: string | null;
  provider: string | null;
  reference: string | null;
  created_at: string | null;
  metadata?: Record<string, unknown> | null;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function actionKey() {
  return encodeURIComponent(String(import.meta.env.DLAVIE_ADMIN_ACTION_KEY || import.meta.env.TELEGRAM_SETUP_KEY || '').trim());
}

function short(value?: string | null, left = 8) {
  const text = String(value || '-');
  return text.length > left + 4 ? `${text.slice(0, left)}...${text.slice(-4)}` : text;
}

function meta(row: TopupRow) {
  return (row.metadata || {}) as Record<string, unknown>;
}

function queueButtons(appUrl: string, row: TopupRow) {
  const key = actionKey();
  const approveUrl = `${appUrl}/api/admin/topups/action?id=${encodeURIComponent(row.id)}&action=approve&key=${key}`;
  const rejectUrl = `${appUrl}/api/admin/topups/action?id=${encodeURIComponent(row.id)}&action=reject&key=${key}`;
  return {
    inline_keyboard: [
      [{ text: '✅ Approve', url: approveUrl }, { text: '🚫 Reject', url: rejectUrl }],
      [{ text: '💰 Open Topups', url: `${appUrl}/admin/topups` }, { text: '👑 Hub', url: `${appUrl}/admin/hub` }],
    ],
  };
}

export async function sendPendingTopupQueue(chatId: string | number, appUrl: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('type', 'topup')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw new Error(error.message);
  const rows = (data || []) as TopupRow[];
  const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  await sendTelegramMessage(chatId, [
    '💳 DLAVIE PENDING TOPUP QUEUE',
    '',
    `Pending: ${rows.length}`,
    `Total amount: ${rupiah(total)}`,
    '',
    rows.length ? 'Daftar transaksi dikirim di bawah dengan tombol aksi.' : 'Tidak ada topup pending saat ini.',
  ].join('\n'), {
    disableWebPagePreview: true,
    replyMarkup: {
      inline_keyboard: [[{ text: '💰 Open Topups', url: `${appUrl}/admin/topups` }], [{ text: '🚀 Secure Gate', url: `${appUrl}/telegram-admin` }]],
    },
  });

  for (const row of rows) {
    const m = meta(row);
    await sendTelegramMessage(chatId, [
      '🧾 Pending Topup',
      '',
      `Amount: ${rupiah(row.amount || 0)}`,
      `Provider: ${row.provider || '-'}`,
      `User: ${short(row.user_id, 10)}`,
      `Ref: ${short(row.reference, 14)}`,
      `Sender: ${String(m.sender_name || '-')}`,
      `Note: ${String(m.proof_note || '-').slice(0, 160)}`,
      `Created: ${row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-'}`,
    ].join('\n'), {
      disableWebPagePreview: true,
      replyMarkup: queueButtons(appUrl, row),
    });
  }
}
