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
    const profiles = await supabase.from('profiles').select('id,email,referral_code,referral_earnings,affiliate_enabled,affiliate_rank,vip_level,is_vip').order('created_at', { ascending: false }).limit(200);
    if (profiles.error) return res.status(500).json({ error: profiles.error.message });
    const referrals = await supabase.from('referrals').select('*').order('created_at', { ascending: false }).limit(200);
    if (referrals.error) return res.status(500).json({ error: referrals.error.message });
    return res.status(200).json({ profiles: profiles.data || [], referrals: referrals.data || [] });
  }

  if (req.method === 'POST') {
    const { referralId, action } = req.body || {};
    if (!referralId || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'referralId and action are required' });
    const status = action === 'approve' ? 'approved' : 'rejected';
    const updated = await supabase.from('referrals').update({ status }).eq('id', referralId).select('*').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ referral: updated.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
