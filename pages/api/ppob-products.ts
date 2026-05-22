import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { hasDigiflazzEnv, syncDigiflazzPrepaidProducts } from '@/lib/ppob-sync';
import { shouldUseVipayment, syncVipaymentProducts } from '@/lib/vipayment-sync';

async function listProducts() {
  const supabase = createSupabaseServiceClient();
  return supabase
    .from('ppob_products')
    .select('id,sku_code,product_name,category,brand,selling_price')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('brand', { ascending: true })
    .order('selling_price', { ascending: true })
    .limit(100);
}

async function syncConfiguredProvider() {
  if (shouldUseVipayment()) return syncVipaymentProducts();
  if (hasDigiflazzEnv()) return syncDigiflazzPrepaidProducts();
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let result = await listProducts();
  if (result.error) return res.status(500).json({ error: result.error.message });

  let sync = null;
  if (!result.data || result.data.length === 0) {
    try {
      sync = await syncConfiguredProvider();
      result = await listProducts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'PPOB sync failed';
      return res.status(200).json({ products: result.data || [], sync: null, warning: message });
    }
  }

  return res.status(200).json({ products: result.data || [], sync });
}
