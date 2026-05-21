import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createSupabaseServiceClient();
  const orders = await supabase.from('orders').select('id,buyer_email,status,created_at').eq('buyer_email', user.email.toLowerCase()).eq('status', 'fulfilled').order('created_at', { ascending: false }).limit(50);
  if (orders.error) return res.status(500).json({ error: orders.error.message });

  const orderIds = (orders.data || []).map((order) => order.id);
  if (!orderIds.length) return res.status(200).json({ downloads: [] });

  const items = await supabase.from('order_items').select('id,order_id,product_id,qty,price').in('order_id', orderIds);
  if (items.error) return res.status(500).json({ error: items.error.message });

  const productIds = Array.from(new Set((items.data || []).map((item) => item.product_id)));
  const products = productIds.length ? await supabase.from('products').select('id,name,slug,image_url,file_path').in('id', productIds) : { data: [], error: null };
  if (products.error) return res.status(500).json({ error: products.error.message });

  const productMap = new Map((products.data || []).map((product) => [product.id, product]));
  const orderMap = new Map((orders.data || []).map((order) => [order.id, order]));
  const downloads = (items.data || []).map((item) => ({
    order: orderMap.get(item.order_id),
    item,
    product: productMap.get(item.product_id) || null,
    ready: Boolean(productMap.get(item.product_id)?.file_path)
  }));

  return res.status(200).json({ downloads });
}
