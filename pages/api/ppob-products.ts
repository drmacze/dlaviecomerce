import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { hasDigiflazzEnv, syncDigiflazzPrepaidProducts } from '@/lib/ppob-sync';
import { shouldUseVipayment, syncVipaymentProducts } from '@/lib/vipayment-sync';

function selectedProvider() {
  return String(process.env.PPOB_PROVIDER || '').toLowerCase();
}

async function listProducts(provider?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from('ppob_products')
    .select('id,sku_code,product_name,category,brand,selling_price')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('brand', { ascending: true })
    .order('selling_price', { ascending: true })
    .limit(100);

  if (provider) query = query.eq('provider', provider);
  return query;
}

async function syncConfiguredProvider() {
  if (shouldUseVipayment()) return syncVipaymentProducts();
  if (hasDigiflazzEnv()) return syncDigiflazzPrepaidProducts();
  return null;
}

async function preferredProducts() {
  const provider = selectedProvider();
  if (provider === 'vipayment') return listProducts('vipayment');
  if (provider === 'digiflazz') return listProducts('digiflazz');
  return listProducts();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let result = await preferredProducts();
  if (result.error) return res.status(500).json({ error: result.error.message });

  let sync = null;
  let warning = null;

  if (!result.data || result.data.length === 0) {
    try {
      sync = await syncConfiguredProvider();
      result = await preferredProducts();
    } catch (error) {
      warning = error instanceof Error ? error.message : 'PPOB sync failed';
    }
  }

  if (!result.data || result.data.length === 0) {
    result = await listProducts('manual');
    if (!warning) warning = 'Manual fallback catalog is active.';
  }

  if (result.error) return res.status(500).json({ error: result.error.message });
  return res.status(200).json({ products: result.data || [], sync, warning });
}
