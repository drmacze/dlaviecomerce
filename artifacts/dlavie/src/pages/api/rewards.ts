import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const rewards = [
  { title: 'Scratch Coupon Bonus', amount: 250 },
  { title: 'Mystery Capsule Drop', amount: 500 },
  { title: 'VIP Orbit Spark', amount: 750 }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const claims = await supabase.from('reward_vault_claims').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
    if (claims.error) return res.status(500).json({ error: claims.error.message });
    return res.status(200).json({ claims: claims.data || [] });
  }

  if (req.method === 'POST') {
    const pick = rewards[Math.floor(Math.random() * rewards.length)];
    const created = await supabase.from('reward_vault_claims').insert({ user_id: user.id, reward_type: req.body?.reward_type || 'mystery', title: pick.title, amount: pick.amount, status: 'revealed', metadata: { source: 'dlavie-reward-vault' } }).select('*').single();
    if (created.error) return res.status(500).json({ error: created.error.message });
    return res.status(200).json({ claim: created.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
