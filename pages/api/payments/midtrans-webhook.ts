import type { NextApiRequest, NextApiResponse } from 'next';
import { isFailedMidtransStatus, isPaidMidtransStatus, verifyMidtransSignature } from '@/lib/midtrans';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

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

  // Midtrans dashboard URL tests can send empty/dummy payloads. Keep this public health path 200 OK
  // while still requiring signature for real DLAVIE topup notifications.
  if (!orderId || !orderId.startsWith('DLV-TOPUP-')) {
    return res.status(200).json({ ok: true, ignored: true, reason: 'dashboard-test-or-non-dlavie-order' });
  }

  if (!verifyMidtransSignature(payload)) return res.status(401).json({ error: 'Invalid signature' });

  const supabase = createSupabaseServiceClient();
  const tx = await supabase.from('wallet_transactions').select('*').eq('reference', orderId).eq('type', 'topup').maybeSingle();
  if (tx.error) return res.status(500).json({ error: tx.error.message });
  if (!tx.data) return res.status(200).json({ ok: true, ignored: true, reason: 'topup-not-found' });

  const metadata = { ...(tx.data.metadata || {}), midtrans: payload };
  const gatewayStatus = payload.transaction_status;

  if (isPaidMidtransStatus(gatewayStatus, payload.fraud_status)) {
    if (tx.data.status === 'approved') return res.status(200).json({ ok: true, duplicate: true });
    const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.data.user_id).single();
    if (profile.error) return res.status(500).json({ error: profile.error.message });
    const nextBalance = Number(profile.data.d_balance || 0) + Number(tx.data.amount || 0);
    const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.data.user_id).select('id,d_balance').single();
    if (balance.error) return res.status(500).json({ error: balance.error.message });
    const updated = await supabase.from('wallet_transactions').update({ status: 'approved', provider: 'midtrans', metadata }).eq('id', tx.data.id).select('*').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ ok: true, topup: updated.data, wallet: balance.data });
  }

  if (isFailedMidtransStatus(gatewayStatus)) {
    const updated = await supabase.from('wallet_transactions').update({ status: 'rejected', provider: 'midtrans', metadata }).eq('id', tx.data.id).select('*').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ ok: true, topup: updated.data });
  }

  const updated = await supabase.from('wallet_transactions').update({ metadata }).eq('id', tx.data.id).select('*').single();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  return res.status(200).json({ ok: true, status: gatewayStatus });
}
