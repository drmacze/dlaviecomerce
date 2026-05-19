import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });
    const email = user.email.toLowerCase();
    const supabase = createSupabaseServiceClient();
    const { data: orders, error } = await supabase.from('orders').select('*').eq('buyer_email', email).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const ids = (orders || []).map((order) => order.id);
    let items: unknown[] = [];
    if (ids.length) {
      const itemResult = await supabase.from('order_items').select('*').in('order_id', ids);
      if (itemResult.error) return res.status(500).json({ error: itemResult.error.message });
      items = itemResult.data || [];
    }
    return res.status(200).json({ email, orders: orders || [], items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Load orders failed';
    return res.status(500).json({ error: message });
  }
}
