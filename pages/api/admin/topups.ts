import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdminEmail(email?: string | null) {
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('wallet_transactions').select('*').eq('type', 'topup').order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ topups: data || [] });
  }

  if (req.method === 'POST') {
    const { id, action } = req.body || {};
    if (!id || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'id and action are required' });
    const tx = await supabase.from('wallet_transactions').select('*').eq('id', id).eq('type', 'topup').single();
    if (tx.error || !tx.data) return res.status(404).json({ error: tx.error?.message || 'Topup not found' });
    if (tx.data.status !== 'pending') return res.status(400).json({ error: 'Topup sudah diproses.' });

    if (action === 'reject') {
      const rejected = await supabase.from('wallet_transactions').update({ status: 'rejected', metadata: { ...(tx.data.metadata || {}), reviewed_by: admin.email } }).eq('id', id).select('*').single();
      if (rejected.error) return res.status(500).json({ error: rejected.error.message });
      return res.status(200).json({ topup: rejected.data });
    }

    const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.data.user_id).single();
    if (profile.error) return res.status(500).json({ error: profile.error.message });
    const nextBalance = Number(profile.data.d_balance || 0) + Number(tx.data.amount || 0);
    const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.data.user_id).select('id,d_balance').single();
    if (balance.error) return res.status(500).json({ error: balance.error.message });
    const approved = await supabase.from('wallet_transactions').update({ status: 'approved', metadata: { ...(tx.data.metadata || {}), reviewed_by: admin.email } }).eq('id', id).select('*').single();
    if (approved.error) return res.status(500).json({ error: approved.error.message });
    return res.status(200).json({ topup: approved.data, wallet: balance.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
