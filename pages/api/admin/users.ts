import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdminEmail(email?: string | null) {
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data || [] });
  }

  if (req.method === 'POST') {
    const { userId, isVip } = req.body || {};
    if (!userId || typeof isVip !== 'boolean') return res.status(400).json({ error: 'userId and isVip are required' });
    const { data, error } = await supabase.from('profiles').update({ is_vip: isVip }).eq('id', userId).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
