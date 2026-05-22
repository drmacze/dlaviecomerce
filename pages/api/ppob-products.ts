import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('ppob_products')
    .select('id,sku_code,product_name,category,brand,selling_price')
    .eq('is_active', true)
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ products: data || [] });
}
