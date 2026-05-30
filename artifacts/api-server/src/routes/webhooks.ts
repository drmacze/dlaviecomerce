import { Router } from 'express';
import { verifyMidtransSignature, isPaidMidtransStatus, isFailedMidtransStatus } from '../lib/midtrans.js';
import { createSupabaseServiceClient } from '../lib/supabase-server.js';
import { settleWalletTopup } from '../lib/topup-settlement.js';

const router = Router();

type MidtransPayload = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  payment_type?: string;
  transaction_id?: string;
};

router.get('/payments/midtrans-webhook', (_req, res) => {
  res.status(200).json({ ok: true, service: 'dlavie-midtrans-webhook' });
});

router.post('/payments/midtrans-webhook', async (req, res) => {
  const payload = req.body as MidtransPayload;
  const orderId = String(payload.order_id || '');
  if (!orderId || !orderId.startsWith('DLV-TOPUP-')) return res.status(200).json({ ok: true, ignored: true });
  if (!verifyMidtransSignature(payload)) return res.status(401).json({ error: 'Invalid signature' });

  const gatewayStatus = payload.transaction_status;
  if (isPaidMidtransStatus(gatewayStatus, payload.fraud_status)) {
    const settled = await settleWalletTopup(orderId, payload as Record<string, unknown>, 'midtrans_webhook');
    return res.status(200).json({ ok: true, result: settled });
  }

  const supabase = createSupabaseServiceClient();
  const tx = await supabase.from('wallet_transactions').select('*').eq('reference', orderId).eq('type', 'topup').maybeSingle();
  if (tx.error) return res.status(500).json({ error: tx.error.message });
  if (!tx.data) return res.status(200).json({ ok: true, ignored: true, reason: 'topup-not-found' });

  const nextMetadata = { ...(tx.data.metadata || {}), midtrans_webhook: payload };
  if (isFailedMidtransStatus(gatewayStatus)) {
    const updated = await supabase.from('wallet_transactions').update({ status: 'rejected', provider: 'midtrans', metadata: nextMetadata }).eq('id', tx.data.id).select('*').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ ok: true, topup: updated.data });
  }

  const updated = await supabase.from('wallet_transactions').update({ metadata: nextMetadata }).eq('id', tx.data.id).select('*').single();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  return res.status(200).json({ ok: true, status: gatewayStatus });
});

router.post('/digiflazz/webhook', async (req, res) => {
  console.log('[digiflazz-webhook]', { body: req.body });
  return res.status(200).json({ ok: true });
});

router.get('/ppob-vipayment-webhook', (_req, res) => res.status(200).json({ ok: true, service: 'vipayment-webhook' }));

router.post('/ppob-vipayment-webhook', async (req, res) => {
  try {
    const payload = req.body || {};
    const trxId = String(payload.trxid || payload.trx_id || payload.transaction_id || '');
    if (!trxId) return res.status(200).json({ ok: true, ignored: true, reason: 'no-trxid' });

    const supabase = createSupabaseServiceClient();
    const order = await supabase.from('ppob_orders').select('*').or(`ref_id.eq.${trxId},public_order_id.eq.${trxId}`).maybeSingle();
    if (order.error || !order.data) return res.status(200).json({ ok: true, ignored: true, reason: 'order-not-found' });

    const status = String(payload.status || '').toLowerCase();
    const normalizedStatus = (status === 'success' || status === 'sukses') ? 'success' : (status === 'error' || status === 'failed' || status === 'gagal') ? 'failed' : 'pending';

    const update = await supabase.from('ppob_orders').update({
      status: normalizedStatus,
      provider_status: status,
      provider_message: payload.note || null,
      raw_response: { ...((order.data.raw_response || {}) as object), webhook: payload },
      updated_at: new Date().toISOString(),
      settled_at: normalizedStatus !== 'pending' ? new Date().toISOString() : null
    }).eq('id', order.data.id).select('*').single();

    if (update.error) return res.status(500).json({ error: update.error.message });
    return res.status(200).json({ ok: true, order: update.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    return res.status(500).json({ error: message });
  }
});

export default router;
