import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function cleanQuery(value: unknown, max = 80) {
  return String(value || '').trim().slice(0, max);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createSupabaseServiceClient();
  const category = cleanQuery(req.query.category);
  const brand = cleanQuery(req.query.brand);
  const search = cleanQuery(req.query.search);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 50)));

  let query = supabase
    .from('ppob_products')
    .select('id,sku_code,product_name,category,brand,product_type,description,selling_price,stock,unlimited_stock,multi,buyer_product_status,seller_product_status,synced_at')
    .eq('is_active', true)
    .eq('buyer_product_status', true)
    .eq('seller_product_status', true)
    .order('category', { ascending: true })
    .order('brand', { ascending: true })
    .order('selling_price', { ascending: true })
    .limit(limit);

  if (category) query = query.ilike('category', `%${category}%`);
  if (brand) query = query.ilike('brand', `%${brand}%`);
  if (search) query = query.or(`product_name.ilike.%${search}%,sku_code.ilike.%${search}%,brand.ilike.%${search}%,category.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ products: data || [] });
}
