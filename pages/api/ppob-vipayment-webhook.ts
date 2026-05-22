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
  reference: string;
  reason: string;
  existingRefundId?: string | null;
  payload: VipaymentWebhookBody;
}) {
  if (input.existingRefundId) return { refunded: false, already_refunded: true, refund_wallet_transaction_id: input.existingRefundId };

  const supabase = createSupabaseServiceClient();
  const result = await supabase.rpc('refund_ppob_order_atomic', {
    target_order_id: input.orderId,
    refund_reference: input.reference,
    refund_reason: input.reason,
    refund_metadata: { provider_payload: input.payload, source: 'vipayment-webhook' }
  });

  if (result.error) throw new Error(result.error.message);
  return result.data;
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
      reference: trxid,
      reason: payload.note || 'VIPayment transaction failed',
      existingRefundId: order.refund_wallet_transaction_id,
      payload
    });
  }

  return res.status(200).json({ ok: true, order: update.data, refund });
}
