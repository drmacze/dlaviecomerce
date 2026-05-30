import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { midtransAuthHeader, midtransBaseUrl } from '@/lib/midtrans';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function sanitizeAmount(value: unknown) {
  const amount = Math.floor(Number(value || 0));
  if (!Number.isFinite(amount)) return 0;
  return amount;
}

async function readMidtransJson(response: Response) {
  try { return await response.json(); } catch { return {}; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized. Login dulu untuk topup otomatis.' });

  const amount = sanitizeAmount(req.body?.amount);
  if (amount < 10000) return res.status(400).json({ error: 'Minimum topup Rp 10.000' });
  if (amount > 1000000) return res.status(400).json({ error: 'Maximum topup otomatis Rp 1.000.000' });

  if (!process.env.MIDTRANS_SERVER_KEY) {
    return res.status(503).json({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi di Vercel.' });
  }

  const supabase = createSupabaseServiceClient();
  const topupId = `DLV-TOPUP-${Date.now()}-${user.id.slice(0, 6)}`;
  const inserted = await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'topup',
    amount,
    status: 'pending',
    provider: 'midtrans',
    reference: topupId,
    metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId }
  }).select('*').single();

  if (inserted.error) return res.status(500).json({ error: inserted.error.message });

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.origin || 'https://dlaviecomerce.vercel.app';
    const response = await fetch(`${midtransBaseUrl()}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        Authorization: midtransAuthHeader(),
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        transaction_details: { order_id: topupId, gross_amount: amount },
        customer_details: { email: user.email },
        item_details: [{ id: 'DLAVIE_TOPUP', price: amount, quantity: 1, name: `DLAVIE Topup ${amount}` }],
        callbacks: { finish: `${siteUrl}/wallet/finish?order_id=${encodeURIComponent(topupId)}&amount=${amount}` }
      })
    });

    const data = await readMidtransJson(response);
    if (!response.ok) {
      const errorMessage = data.error_messages?.[0] || data.message || 'Midtrans transaction failed';
      await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, error: errorMessage } }).eq('id', inserted.data.id);
      return res.status(response.status).json({ error: errorMessage });
    }

    if (!data.redirect_url || !data.token) {
      await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, error: 'Midtrans tidak mengirim redirect_url/token' } }).eq('id', inserted.data.id);
      return res.status(502).json({ error: 'Midtrans tidak mengirim link pembayaran. Coba lagi.' });
    }

    await supabase.from('wallet_transactions').update({ metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, snap_token: data.token, redirect_url: data.redirect_url } }).eq('id', inserted.data.id);
    return res.status(200).json({ transaction: inserted.data, token: data.token, redirect_url: data.redirect_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Topup otomatis gagal dibuat.';
    await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, error: message } }).eq('id', inserted.data.id);
    return res.status(500).json({ error: message });
  }
}
