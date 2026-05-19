import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function admin(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).includes(String(email || '').toLowerCase());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !admin(user.email)) return res.status(403).json({ error: 'Forbidden' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const supabase = createSupabaseServiceClient();
  const payload = req.body || {};
  const slug = String(payload.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase.from('products').insert({ ...payload, slug }).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ product: data });
}
