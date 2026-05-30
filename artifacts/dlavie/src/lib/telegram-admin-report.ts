import { createSupabaseServiceClient } from '@/lib/supabase-server';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

type CountResult = { count: number | null };
type OrderRow = { total_amount: number | null; status: string | null };
type WalletRow = { amount: number | null; status: string | null; provider: string | null; reference: string | null; user_id: string | null; created_at: string | null };

async function countRows(table: string, apply?: (query: any) => any) {
  const supabase = createSupabaseServiceClient();
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  if (apply) query = apply(query);
  const result = await query as CountResult;
  return Number(result.count || 0);
}

export async function buildDlavieStatsReport(appUrl: string) {
  const supabase = createSupabaseServiceClient();
  const [users, products, activeProducts, coupons, activeCoupons, ordersResult, pendingTopupsResult] = await Promise.all([
    countRows('profiles'),
    countRows('products'),
    countRows('products', (q) => q.eq('is_published', true)),
    countRows('coupons'),
    countRows('coupons', (q) => q.eq('is_active', true)),
    supabase.from('orders').select('total_amount,status').limit(500),
    supabase.from('wallet_transactions').select('amount,status,provider,reference,user_id,created_at').eq('type', 'topup').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
  ]);

  const orders = (ordersResult.data || []) as OrderRow[];
  const pendingTopups = (pendingTopupsResult.data || []) as WalletRow[];
  const totalRevenue = orders.filter((order) => ['paid', 'fulfilled'].includes(String(order.status || ''))).reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const paidOrders = orders.filter((order) => order.status === 'paid').length;
  const fulfilledOrders = orders.filter((order) => order.status === 'fulfilled').length;
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled').length;
  const pendingTopupAmount = pendingTopups.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return [
    '📊 DLAVIE LIVE ADMIN STATS',
    '',
    `👤 User login/profiles: ${users}`,
    `📦 Products: ${activeProducts}/${products} active`,
    `🎟 Coupons: ${activeCoupons}/${coupons} active`,
    '',
    `🛒 Orders total: ${orders.length}`,
    `⏳ Pending manual orders: ${pendingOrders}`,
    `✅ Paid: ${paidOrders}`,
    `📦 Fulfilled: ${fulfilledOrders}`,
    `🚫 Cancelled: ${cancelledOrders}`,
    `💰 Revenue paid/fulfilled: ${rupiah(totalRevenue)}`,
    '',
    `💳 Pending manual topups: ${pendingTopups.length}`,
    `💳 Pending topup amount: ${rupiah(pendingTopupAmount)}`,
    '',
    `Open panel: ${appUrl}/telegram-admin`,
  ].join('\n');
}

export async function buildDlaviePaymentsReport(appUrl: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('wallet_transactions').select('amount,status,provider,reference,user_id,created_at').eq('type', 'topup').order('created_at', { ascending: false }).limit(8);
  if (error) throw new Error(error.message);
  const rows = (data || []) as WalletRow[];
  const pending = rows.filter((row) => row.status === 'pending');
  const pendingAmount = pending.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const lines = rows.map((row) => [`• ${rupiah(row.amount || 0)} · ${String(row.status || '-').toUpperCase()} · ${row.provider || 'manual'}`, `  Ref: ${row.reference || '-'}`, `  User: ${row.user_id || '-'}`].join('\n'));
  return [
    '💳 DLAVIE MANUAL PAYMENT / TOPUP',
    '',
    `Pending queue: ${pending.length}`,
    `Pending amount: ${rupiah(pendingAmount)}`,
    '',
    lines.length ? lines.join('\n\n') : 'Belum ada topup/manual payment.',
    '',
    `Open topups: ${appUrl}/admin/topups`,
  ].join('\n');
}
