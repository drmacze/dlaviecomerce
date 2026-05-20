import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const profile = await supabase.from('profiles').select('id,email,d_balance,d_points,vip_level,security_score').eq('id', user.id).single();
    if (profile.error) return res.status(500).json({ error: profile.error.message });
    const transactions = await supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (transactions.error) return res.status(500).json({ error: transactions.error.message });
    return res.status(200).json({ wallet: profile.data, transactions: transactions.data || [] });
  }

  if (req.method === 'POST') {
    const amount = Number(req.body?.amount || 0);
    if (!Number.isFinite(amount) || amount < 5000) return res.status(400).json({ error: 'Minimum topup Rp 5.000' });
    const created = await supabase.from('wallet_transactions').insert({ user_id: user.id, type: 'topup', amount, status: 'pending', provider: req.body?.provider || 'manual-preview', metadata: { source: 'dlavie-wallet' } }).select('*').single();
    if (created.error) return res.status(500).json({ error: created.error.message });
    return res.status(200).json({ transaction: created.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
