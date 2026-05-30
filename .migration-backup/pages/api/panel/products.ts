import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createSupabaseServiceClient();
  const result = await supabase
    .from('panel_products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('price', { ascending: true });

  if (result.error) return res.status(500).json({ error: result.error.message });
  return res.status(200).json({ products: result.data || [] });
}
