import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdminEmail(email?: string | null) {
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const supabase = createSupabaseServiceClient();
  const orders = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(150);
  if (orders.error) return res.status(500).json({ error: orders.error.message });
  const ids = (orders.data || []).map((order) => order.id);
  const items = ids.length ? await supabase.from('order_items').select('*').in('order_id', ids) : { data: [], error: null };
  if (items.error) return res.status(500).json({ error: items.error.message });
  return res.status(200).json({ orders: orders.data || [], items: items.data || [] });
}
