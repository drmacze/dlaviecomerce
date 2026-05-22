import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { vipaymentSign } from '@/lib/vipayment';

type VipaymentWebhookBody = {
  trxid?: string;
  data?: string;
  service?: string;
  status?: string;
  note?: string;
  price?: number | string;
};

function normalizeStatus(value?: string) {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'success' || status === 'sukses') return 'success';
  if (status === 'error' || status === 'failed' || status === 'gagal') return 'failed';
  return 'pending';
}

function headerValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function clientIp(req: NextApiRequest) {
  const forwarded = headerValue(req.headers['x-forwarded-for']);
  return String(forwarded || req.socket.remoteAddress || '').split(',')[0].trim();
}

function callbackIpAllowed(req: NextApiRequest) {
  const allowed = String(process.env.VIPAYMENT_CALLBACK_IP || '178.248.73.218')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!allowed.length) return true;
  return allowed.includes(clientIp(req));
}

async function refundIfNeeded(input: {
  orderId: string;
  userId: string;
  amount: number;
  reference: string;
  reason: string;
  existingRefundId?: string | null;
  payload: VipaymentWebhookBody;
}) {
  if (input.existingRefundId) return null;

  const supabase = createSupabaseServiceClient();
  const profile = await supabase.from('profiles').select('id,d_balance').eq('id', input.userId).single();
  if (profile.error) throw new Error(profile.error.message);

  const nextBalance = Number(profile.data.d_balance || 0) + input.amount;
  const updatedBalance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', input.userId).select('id,d_balance').single();
  if (updatedBalance.error) throw new Error(updatedBalance.error.message);

  const wallet = await supabase.from('wallet_transactions').insert({
    user_id: input.userId,
    type: 'refund',
    amount: input.amount,
    status: 'success',
    provider: 'vipayment',
    reference: `${input.reference}-REFUND`,
    metadata: {
      source: 'vipayment-webhook',
      ppob_order_id: input.orderId,
      reason: input.reason,
      provider_payload: input.payload
    }
  }).select('*').single();

  if (wallet.error) throw new Error(wallet.error.message);

  await supabase.from('ppob_orders').update({
    refund_wallet_transaction_id: wallet.data.id,
    updated_at: new Date().toISOString()
  }).eq('id', input.orderId);

  return { wallet: wallet.data, balance: updatedBalance.data };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const signature = headerValue(req.headers['x-client-signature']);
  if (signature !== vipaymentSign()) return res.status(401).json({ error: 'Invalid callback signature' });
  if (!callbackIpAllowed(req)) return res.status(403).json({ error: 'Callback IP not allowed' });

  const payload = (req.body || {}) as VipaymentWebhookBody;
  const trxid = String(payload.trxid || '').trim();
  if (!trxid) return res.status(400).json({ error: 'Missing trxid' });

  const supabase = createSupabaseServiceClient();
  const found = await supabase.from('ppob_orders').select('*').eq('ref_id', trxid).maybeSingle();
  if (found.error) return res.status(500).json({ error: found.error.message });
  if (!found.data) return res.status(404).json({ error: 'Order not found' });

  const status = normalizeStatus(payload.status);
  const now = new Date().toISOString();
  const order = found.data as {
    id: string;
    user_id: string;
    selling_price: number;
    wallet_transaction_id?: string | null;
    refund_wallet_transaction_id?: string | null;
    raw_callback?: Record<string, unknown> | null;
  };

  const update = await supabase.from('ppob_orders').update({
    status,
    provider_status: payload.status || null,
    provider_message: payload.note || null,
    raw_callback: {
      ...(order.raw_callback || {}),
      vipayment: payload,
      last_source: 'vipayment-webhook',
      updated_at: now
    },
    updated_at: now,
    settled_at: status === 'success' || status === 'failed' ? now : null
  }).eq('id', order.id).select('*').single();

  if (update.error) return res.status(500).json({ error: update.error.message });

  if (order.wallet_transaction_id) {
    await supabase.from('wallet_transactions').update({
      status: status === 'failed' ? 'failed' : status === 'success' ? 'success' : 'pending',
      metadata: {
        source: 'vipayment-webhook',
        ppob_order_id: order.id,
        provider_payload: payload,
        updated_at: now
      }
    }).eq('id', order.wallet_transaction_id);
  }

  let refund = null;
  if (status === 'failed') {
    refund = await refundIfNeeded({
      orderId: order.id,
      userId: order.user_id,
      amount: Number(order.selling_price || 0),
      reference: trxid,
      reason: payload.note || 'VIPayment transaction failed',
      existingRefundId: order.refund_wallet_transaction_id,
      payload
    });
  }

  return res.status(200).json({ ok: true, order: update.data, refund });
}
