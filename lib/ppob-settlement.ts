import type { DigiflazzTransactionData } from '@/lib/digiflazz';
import { normalizeDigiflazzStatus } from '@/lib/digiflazz';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type PpobOrderRow = {
  id: string;
  user_id: string;
  ref_id: string;
  selling_price: number;
  status: string;
  refund_wallet_transaction_id?: string | null;
  raw_callback?: Record<string, unknown> | null;
};

function toInt(value: unknown) {
  const parsed = Math.floor(Number(value || 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function refundPpobOrder(order: PpobOrderRow, source: string, payload: DigiflazzTransactionData) {
  if (order.refund_wallet_transaction_id) return { refunded: false, reason: 'already-refunded' };

  const supabase = createSupabaseServiceClient();
  const profile = await supabase.from('profiles').select('id,d_balance').eq('id', order.user_id).single();
  if (profile.error) throw new Error(profile.error.message);

  const refundAmount = toInt(order.selling_price);
  const nextBalance = Number(profile.data.d_balance || 0) + refundAmount;
  const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', order.user_id).select('id,d_balance').single();
  if (balance.error) throw new Error(balance.error.message);

  const wallet = await supabase.from('wallet_transactions').insert({
    user_id: order.user_id,
    type: 'refund',
    amount: refundAmount,
    status: 'success',
    provider: 'ppob-digiflazz',
    reference: `${order.ref_id}-REFUND`,
    metadata: {
      order_id: order.id,
      ref_id: order.ref_id,
      source,
      provider_payload: payload,
      refunded_at: new Date().toISOString()
    }
  }).select('*').single();

  if (wallet.error) throw new Error(wallet.error.message);

  const updated = await supabase.from('ppob_orders').update({
    refund_wallet_transaction_id: wallet.data.id,
    updated_at: new Date().toISOString()
  }).eq('id', order.id).select('*').single();

  if (updated.error) throw new Error(updated.error.message);
  return { refunded: true, wallet: wallet.data, balance: balance.data, order: updated.data };
}

export async function settlePpobOrder(refId: string, payload: DigiflazzTransactionData, source: string) {
  const supabase = createSupabaseServiceClient();
  const order = await supabase.from('ppob_orders').select('*').eq('ref_id', refId).maybeSingle();
  if (order.error) throw new Error(order.error.message);
  if (!order.data) return { ok: false, reason: 'ppob-order-not-found' };

  const row = order.data as PpobOrderRow;
  const normalized = normalizeDigiflazzStatus(payload.status);
  const now = new Date().toISOString();
  const previousCallback = (row.raw_callback || {}) as Record<string, unknown>;
  const nextStatus = normalized === 'success' ? 'success' : normalized === 'failed' ? 'failed' : 'pending';

  const updated = await supabase.from('ppob_orders').update({
    status: nextStatus,
    provider_status: payload.status || null,
    provider_rc: payload.rc || null,
    provider_message: payload.message || null,
    serial_number: payload.sn || null,
    raw_callback: { ...previousCallback, [source]: payload, last_source: source, updated_at: now },
    updated_at: now,
    settled_at: normalized === 'success' || normalized === 'failed' ? now : null
  }).eq('id', row.id).select('*').single();

  if (updated.error) throw new Error(updated.error.message);

  if (normalized === 'failed') {
    const refund = await refundPpobOrder({ ...row, status: nextStatus }, source, payload);
    return { ok: true, status: nextStatus, order: updated.data, refund };
  }

  return { ok: true, status: nextStatus, order: updated.data };
}
