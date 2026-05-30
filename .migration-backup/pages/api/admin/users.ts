import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const levels = ['free', 'silver', 'gold', 'platinum', 'black'] as const;
const ranks: Record<string, string> = { free: 'starter', silver: 'silver', gold: 'gold', platinum: 'platinum', black: 'black' };

function isAdminEmail(email?: string | null) {
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data || [] });
  }

  if (req.method === 'POST') {
    const { userId, vipLevel, bonusPoints } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const nextLevel = levels.includes(vipLevel) ? vipLevel : 'free';
    const bonus = Number(bonusPoints || 0);
    const current = await supabase.from('profiles').select('id,l_points,d_points').eq('id', userId).single();
    if (current.error) return res.status(500).json({ error: current.error.message });
    const updated = await supabase.from('profiles').update({
      is_vip: nextLevel !== 'free',
      vip_level: nextLevel,
      affiliate_rank: ranks[nextLevel],
      l_points: Number(current.data.l_points || 0) + (Number.isFinite(bonus) ? bonus : 0),
      d_points: Number(current.data.d_points || 0) + (Number.isFinite(bonus) ? bonus : 0)
    }).eq('id', userId).select('*').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ profile: updated.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
