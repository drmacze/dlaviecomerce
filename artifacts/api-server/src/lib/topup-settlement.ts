import { createSupabaseServiceClient } from './supabase-server.js';

export async function settleWalletTopup(orderId: string, gatewayPayload: Record<string, unknown>, source: string) {
  const supabase = createSupabaseServiceClient();
  const tx = await supabase.from('wallet_transactions').select('*').eq('reference', orderId).eq('type', 'topup').maybeSingle();
  if (tx.error) throw new Error(tx.error.message);
  if (!tx.data) return { ok: false, reason: 'topup-not-found' };
  if (tx.data.status === 'approved') return { ok: true, duplicate: true, topup: tx.data };

  const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.data.user_id).single();
  if (profile.error) throw new Error(profile.error.message);

  const nextBalance = Number(profile.data.d_balance || 0) + Number(tx.data.amount || 0);
  const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.data.user_id).select('id,d_balance').single();
  if (balance.error) throw new Error(balance.error.message);

  const metadata = { ...(tx.data.metadata || {}), [source]: gatewayPayload, settled_by: source, settled_at: new Date().toISOString() };
  const updated = await supabase.from('wallet_transactions').update({ status: 'approved', provider: 'midtrans', metadata }).eq('id', tx.data.id).select('*').single();
  if (updated.error) throw new Error(updated.error.message);
  return { ok: true, topup: updated.data, wallet: balance.data };
}
