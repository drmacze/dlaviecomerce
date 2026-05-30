import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createSupabaseServiceClient();
  const profile = await supabase.from('profiles').select('id,email,referral_code,d_points,vip_level').eq('id', user.id).single();
  if (profile.error) return res.status(500).json({ error: profile.error.message });

  const referrals = await supabase.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(50);
  if (referrals.error) return res.status(500).json({ error: referrals.error.message });

  return res.status(200).json({ profile: profile.data, referrals: referrals.data || [] });
}
