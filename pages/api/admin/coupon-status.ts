import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function admin(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).includes(String(email || '').toLowerCase());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !admin(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const { id, is_active } = req.body || {};
  if (!id || typeof is_active !== 'boolean') return res.status(400).json({ error: 'id and is_active are required' });
  const supabase = createSupabaseServiceClient();
  const updated = await supabase.from('coupons').update({ is_active }).eq('id', id).select('*').single();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  return res.status(200).json({ coupon: updated.data });
}
