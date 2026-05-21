import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { midtransAuthHeader, midtransBaseUrl } from '@/lib/midtrans';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized. Login dulu.' });

  const amount = Number(req.body?.amount || 0);
  if (!Number.isFinite(amount) || amount < 5000) return res.status(400).json({ error: 'Minimum topup Rp 5.000' });

  const supabase = createSupabaseServiceClient();
  const reference = `DLV-TOPUP-${Date.now()}-${user.id.slice(0, 6)}`;
  const inserted = await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'topup',
    amount,
    status: 'pending',
    provider: 'midtrans',
    reference,
    metadata: { gateway: 'midtrans', source: 'production-wallet-test', order_id: reference }
  }).select('*').single();

  if (inserted.error) return res.status(500).json({ error: inserted.error.message });

  const response = await fetch(`${midtransBaseUrl()}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      Authorization: midtransAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      transaction_details: { order_id: reference, gross_amount: amount },
      customer_details: { email: user.email },
      item_details: [{ id: 'DLAVIE_TOPUP', price: amount, quantity: 1, name: `DLAVIE Topup ${amount}` }],
      callbacks: { finish: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.origin || 'https://dlaviecomerce.vercel.app'}/wallet` }
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json({ error: data.error_messages?.[0] || data.message || 'Midtrans transaction failed' });

  await supabase.from('wallet_transactions').update({ metadata: { gateway: 'midtrans', source: 'production-wallet-test', order_id: reference, snap_token: data.token, redirect_url: data.redirect_url } }).eq('id', inserted.data.id);
  return res.status(200).json({ transaction: inserted.data, token: data.token, redirect_url: data.redirect_url });
}
