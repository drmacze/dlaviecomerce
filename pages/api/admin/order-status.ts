import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdminEmail(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).includes(String(email || '').toLowerCase());
}

function multiplier(level?: string | null) {
  if (level === 'black') return 3;
  if (level === 'platinum') return 2;
  if (level === 'gold') return 1.5;
  if (level === 'silver') return 1.2;
  return 1;
}

async function awardFulfillmentReward(supabase: ReturnType<typeof createSupabaseServiceClient>, order: { id: string; buyer_email: string; total_amount: number }) {
  const existing = await supabase.from('wallet_transactions').select('id').eq('type', 'reward').eq('reference', order.id).maybeSingle();
  if (existing.data) return 0;
  const profile = await supabase.from('profiles').select('id,d_points,l_points,vip_level').eq('email', String(order.buyer_email || '').toLowerCase()).maybeSingle();
  if (!profile.data) return 0;
  const points = Math.max(1, Math.floor((Number(order.total_amount || 0) / 10000) * multiplier(profile.data.vip_level)));
  const nextD = Number(profile.data.d_points || 0) + points;
  const nextL = Number(profile.data.l_points || 0) + points;
  const updated = await supabase.from('profiles').update({ d_points: nextD, l_points: nextL }).eq('id', profile.data.id);
  if (updated.error) throw new Error(updated.error.message);
  await supabase.from('wallet_transactions').insert({ user_id: profile.data.id, type: 'reward', amount: points, status: 'success', provider: 'fulfillment', reference: order.id, metadata: { order_id: order.id, reason: 'order_fulfilled' } });
  return points;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });
  const { orderId, status } = req.body || {};
  if (!orderId || !['pending', 'paid', 'fulfilled', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid order status request' });
  const supabase = createSupabaseServiceClient();
  const updated = await supabase.from('orders').update({ status }).eq('id', orderId).select('*').single();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  let pointsAwarded = 0;
  if (status === 'fulfilled') pointsAwarded = await awardFulfillmentReward(supabase, updated.data);
  return res.status(200).json({ order: updated.data, pointsAwarded });
}
