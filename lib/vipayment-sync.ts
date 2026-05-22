import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { fetchVipaymentPrepaidServices, hasVipaymentEnv } from '@/lib/vipayment';
import type { VipaymentService } from '@/lib/vipayment';

function toInt(value: unknown) {
  const parsed = Math.floor(Number(value || 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clean(value: unknown, fallback = '') {
  return String(value || fallback).trim();
}

function marginFor(category: string) {
  const key = category.toLowerCase();
  const values: Record<string, number> = {
    pulsa: toInt(process.env.PPOB_MARGIN_PULSA || 1000),
    data: toInt(process.env.PPOB_MARGIN_DATA || 1500),
    game: toInt(process.env.PPOB_MARGIN_GAME || 1500),
    games: toInt(process.env.PPOB_MARGIN_GAME || 1500),
    pln: toInt(process.env.PPOB_MARGIN_PLN || 1500),
    voucher: toInt(process.env.PPOB_MARGIN_VOUCHER || 1500)
  };
  return values[key] ?? toInt(process.env.PPOB_DEFAULT_MARGIN || 1500);
}

function active(item: VipaymentService) {
  if (typeof item.status === 'boolean') return item.status;
  const value = String(item.status ?? '').trim().toLowerCase();
  return !['0', 'false', 'off', 'offline', 'gangguan', 'closed', 'close'].includes(value);
}

function chunk<T>(items: T[], size: number) {
  const parts: T[][] = [];
  for (let i = 0; i < items.length; i += size) parts.push(items.slice(i, i + size));
  return parts;
}

export function shouldUseVipayment() {
  return process.env.PPOB_PROVIDER === 'vipayment' && hasVipaymentEnv();
}

export async function syncVipaymentProducts() {
  const services = await fetchVipaymentPrepaidServices();
  const now = new Date().toISOString();
  const rows = services
    .filter((item) => clean(item.code) && clean(item.name))
    .map((item) => {
      const category = clean(item.category, 'Digital');
      const providerPrice = toInt(item.price);
      const margin = marginFor(category);
      const isActive = active(item);

      return {
        provider: 'vipayment',
        sku_code: clean(item.code),
        product_name: clean(item.name),
        category,
        brand: clean(item.brand) || null,
        product_type: clean(item.type || item.prepost) || null,
        description: clean(item.note) || null,
        provider_price: providerPrice,
        margin,
        selling_price: providerPrice + margin,
        stock: 9999,
        unlimited_stock: true,
        multi: Boolean(item.multi),
        buyer_product_status: isActive,
        seller_product_status: isActive,
        is_active: isActive,
        raw: item,
        synced_at: now,
        updated_at: now
      };
    });

  const supabase = createSupabaseServiceClient();
  let upserted = 0;
  for (const batch of chunk(rows, 500)) {
    const result = await supabase.from('ppob_products').upsert(batch, { onConflict: 'provider,sku_code' });
    if (result.error) throw new Error(result.error.message);
    upserted += batch.length;
  }

  return { ok: true, provider: 'vipayment', fetched: services.length, upserted, syncedAt: now };
}
