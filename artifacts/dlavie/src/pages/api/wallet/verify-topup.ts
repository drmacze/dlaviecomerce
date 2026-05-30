import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { isFailedMidtransStatus, isPaidMidtransStatus, midtransAuthHeader, midtransBaseUrl } from '@/lib/midtrans';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { settleWalletTopup } from '@/lib/topup-settlement';

async function readJson(response: Response) {
  try { return await response.json(); } catch { return {}; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized. Login diperlukan.' });

  const orderId = String(req.body?.order_id || '').trim();
  if (!orderId || !orderId.startsWith('DLV-TOPUP-')) return res.status(400).json({ error: 'Order topup tidak valid.' });

  const supabase = createSupabaseServiceClient();
  const owned = await supabase.from('wallet_transactions').select('id,user_id,status,amount').eq('reference', orderId).eq('type', 'topup').maybeSingle();
  if (owned.error) return res.status(500).json({ error: owned.error.message });
  if (!owned.data) return res.status(404).json({ error: 'Transaksi topup tidak ditemukan.' });
  if (owned.data.user_id !== user.id) return res.status(403).json({ error: 'Transaksi ini bukan milik akun kamu.' });
  if (owned.data.status === 'approved') return res.status(200).json({ ok: true, status: 'approved', duplicate: true });

  const response = await fetch(`${midtransBaseUrl()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Authorization: midtransAuthHeader(), Accept: 'application/json' }
  });
  const data = await readJson(response);
  if (!response.ok) return res.status(response.status).json({ error: data.error_messages?.[0] || data.message || 'Gagal cek status Midtrans.' });

  const gatewayStatus = String(data.transaction_status || '');
  const fraudStatus = String(data.fraud_status || '');

  if (isPaidMidtransStatus(gatewayStatus, fraudStatus)) {
    const settled = await settleWalletTopup(orderId, data, 'midtrans_verify');
    return res.status(200).json({ ok: true, status: 'approved', result: settled });
  }

  if (isFailedMidtransStatus(gatewayStatus)) {
    const updated = await supabase.from('wallet_transactions').update({ status: 'rejected', metadata: { ...(owned.data as any).metadata, midtrans_verify: data } }).eq('id', owned.data.id).select('*').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ ok: true, status: 'rejected', topup: updated.data });
  }

  return res.status(200).json({ ok: true, status: gatewayStatus || 'pending', midtrans: data });
}
