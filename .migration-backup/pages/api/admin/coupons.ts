import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function admin(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).includes(String(email || '').toLowerCase());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !admin(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ coupons: data || [] });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const { data, error } = await supabase.from('coupons').insert({
      code: String(body.code || '').trim().toUpperCase(),
      discount_type: body.discount_type,
      amount: Number(body.amount || 0),
      min_amount: Number(body.min_amount || 0),
      usage_limit: body.usage_limit ?? null,
      redeemed_count: 0,
      is_active: true,
      expires_at: body.expires_at || null
    }).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ coupon: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
