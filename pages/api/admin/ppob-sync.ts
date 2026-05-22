import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { fetchDigiflazzPriceList } from '@/lib/digiflazz';
import type { DigiflazzPriceProduct } from '@/lib/digiflazz';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdminEmail(email?: string | null) {
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && admins.includes(email.toLowerCase()));
}

function toInt(value: unknown) {
  const parsed = Math.floor(Number(value || 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clean(value: unknown, fallback = '') {
  return String(value || fallback).trim();
}

function defaultMargin(product: DigiflazzPriceProduct) {
  const byCategory: Record<string, number> = {
    pulsa: toInt(process.env.PPOB_MARGIN_PULSA || 1000),
    data: toInt(process.env.PPOB_MARGIN_DATA || 1500),
    games: toInt(process.env.PPOB_MARGIN_GAME || 1500),
    game: toInt(process.env.PPOB_MARGIN_GAME || 1500),
    pln: toInt(process.env.PPOB_MARGIN_PLN || 1500),
    voucher: toInt(process.env.PPOB_MARGIN_VOUCHER || 1500)
  };

  const category = clean(product.category).toLowerCase();
  return byCategory[category] ?? toInt(process.env.PPOB_DEFAULT_MARGIN || 1500);
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const products = await fetchDigiflazzPriceList('prepaid');
    const now = new Date().toISOString();
    const rows = products
      .filter((item) => clean(item.buyer_sku_code) && clean(item.product_name))
      .map((item) => {
        const providerPrice = toInt(item.price);
        const margin = defaultMargin(item);
        return {
          provider: 'digiflazz',
          sku_code: clean(item.buyer_sku_code),
          product_name: clean(item.product_name),
          category: clean(item.category, 'Digital'),
          brand: clean(item.brand) || null,
          product_type: clean(item.type) || null,
          description: clean(item.desc) || null,
          provider_price: providerPrice,
          margin,
          selling_price: providerPrice + margin,
          stock: toInt(item.stock),
          unlimited_stock: Boolean(item.unlimited_stock),
          multi: Boolean(item.multi),
          buyer_product_status: item.buyer_product_status !== false,
          seller_product_status: item.seller_product_status !== false,
          is_active: item.buyer_product_status !== false && item.seller_product_status !== false,
          raw: item,
          synced_at: now,
          updated_at: now
        };
      });

    const supabase = createSupabaseServiceClient();
    let upserted = 0;
    for (const batch of chunk(rows, 500)) {
      const result = await supabase.from('ppob_products').upsert(batch, { onConflict: 'provider,sku_code' });
      if (result.error) return res.status(500).json({ error: result.error.message, upserted });
      upserted += batch.length;
    }

    return res.status(200).json({ ok: true, fetched: products.length, upserted, syncedAt: now });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PPOB sync failed';
    return res.status(500).json({ error: message });
  }
}
