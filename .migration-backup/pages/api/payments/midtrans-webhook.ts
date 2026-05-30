import type { NextApiRequest, NextApiResponse } from 'next';
import { isFailedMidtransStatus, isPaidMidtransStatus, verifyMidtransSignature } from '@/lib/midtrans';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { settleWalletTopup } from '@/lib/topup-settlement';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, service: 'dlavie-midtrans-webhook' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
}
