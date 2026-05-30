import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const profile = await supabase.from('profiles').select('id,email,affiliate_enabled,affiliate_rank,vip_level,d_balance').eq('id', user.id).single();
    if (profile.error) return res.status(500).json({ error: profile.error.message });
    const clicks = await supabase.from('affiliate_clicks').select('*').eq('affiliate_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (clicks.error) return res.status(500).json({ error: clicks.error.message });
    const commissions = await supabase.from('affiliate_commissions').select('*').eq('affiliate_id', user.id).order('created_at', { ascending: false }).limit(50);
    if (commissions.error) return res.status(500).json({ error: commissions.error.message });
    return res.status(200).json({ profile: profile.data, clicks: clicks.data || [], commissions: commissions.data || [] });
  }

  if (req.method === 'POST') {
    const updated = await supabase.from('profiles').update({ affiliate_enabled: true, affiliate_rank: 'starter' }).eq('id', user.id).select('id,email,affiliate_enabled,affiliate_rank,vip_level').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ profile: updated.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
