import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const vipLevels = ['free', 'silver', 'gold', 'platinum', 'black'] as const;
const tierConfig: Record<string, { isVip: boolean; cashback: number; rank: string }> = {
  free: { isVip: false, cashback: 0, rank: 'starter' },
  silver: { isVip: true, cashback: 2, rank: 'silver' },
  gold: { isVip: true, cashback: 5, rank: 'gold' },
  platinum: { isVip: true, cashback: 8, rank: 'platinum' },
  black: { isVip: true, cashback: 12, rank: 'black' }
};

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
    const nextLevel = vipLevels.includes(vipLevel) ? vipLevel : 'free';
    const config = tierConfig[nextLevel];
    const bonus = Number(bonusPoints || 0);

    const current = await supabase.from('profiles').select('id,l_points,d_points').eq('id', userId).single();
    if (current.error) return res.status(500).json({ error: current.error.message });

    const updatePayload = {
      is_vip: config.isVip,
      vip_level: nextLevel,
      vip_tier: nextLevel,
      cashback_rate: config.cashback,
      affiliate_rank: config.rank,
      l_points: Number(current.data.l_points || 0) + (Number.isFinite(bonus) ? bonus : 0),
      d_points: Number(current.data.d_points || 0) + (Number.isFinite(bonus) ? bonus : 0)
    };

    const { data, error } = await supabase.from('profiles').update(updatePayload).eq('id', userId).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
