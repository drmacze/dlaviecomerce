import type { NextApiRequest, NextApiResponse } from 'next';

type PpobProduct = {
  code: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  status: 'available' | 'offline';
  source: 'vipayment' | 'demo';
};

const categoryMap: Record<string, string[]> = {
  pulsa: ['pulsa', 'regular', 'telkomsel', 'indosat', 'xl', 'axis', 'tri', 'smartfren'],
  data: ['data', 'internet', 'kuota'],
  pln: ['pln', 'listrik'],
  game: ['game', 'mobile legends', 'free fire', 'pubg', 'genshin'],
  voucher: ['voucher', 'digital'],
  wallet: ['wallet', 'dana', 'gopay', 'ovo', 'shopeepay']
};

const demoProducts: Record<string, PpobProduct[]> = {
  pulsa: [
    { code: 'PULSA5', name: 'Pulsa Reguler 5.000', category: 'pulsa', brand: 'All Operator', price: 6500, status: 'available', source: 'demo' },
    { code: 'PULSA10', name: 'Pulsa Reguler 10.000', category: 'pulsa', brand: 'All Operator', price: 11500, status: 'available', source: 'demo' },
    { code: 'PULSA25', name: 'Pulsa Reguler 25.000', category: 'pulsa', brand: 'All Operator', price: 26500, status: 'available', source: 'demo' }
  ],
  data: [
    { code: 'DATA1GB', name: 'Paket Data 1GB', category: 'data', brand: 'All Operator', price: 12000, status: 'available', source: 'demo' },
    { code: 'DATA3GB', name: 'Paket Data 3GB', category: 'data', brand: 'All Operator', price: 26000, status: 'available', source: 'demo' },
    { code: 'DATA8GB', name: 'Paket Data 8GB', category: 'data', brand: 'All Operator', price: 52000, status: 'available', source: 'demo' }
  ],
  pln: [
    { code: 'PLN20', name: 'Token PLN 20.000', category: 'pln', brand: 'PLN', price: 21500, status: 'available', source: 'demo' },
    { code: 'PLN50', name: 'Token PLN 50.000', category: 'pln', brand: 'PLN', price: 51500, status: 'available', source: 'demo' },
    { code: 'PLN100', name: 'Token PLN 100.000', category: 'pln', brand: 'PLN', price: 101500, status: 'available', source: 'demo' }
  ],
  game: [
    { code: 'ML86', name: 'Mobile Legends 86 Diamonds', category: 'game', brand: 'Mobile Legends', price: 22000, status: 'available', source: 'demo' },
    { code: 'FF70', name: 'Free Fire 70 Diamonds', category: 'game', brand: 'Free Fire', price: 11000, status: 'available', source: 'demo' },
    { code: 'PUBG60', name: 'PUBG 60 UC', category: 'game', brand: 'PUBG Mobile', price: 15000, status: 'available', source: 'demo' }
  ],
  voucher: [
    { code: 'VCH10', name: 'Voucher Digital 10.000', category: 'voucher', brand: 'Digital', price: 11000, status: 'available', source: 'demo' },
    { code: 'VCH25', name: 'Voucher Digital 25.000', category: 'voucher', brand: 'Digital', price: 26000, status: 'available', source: 'demo' },
    { code: 'VCH50', name: 'Voucher Digital 50.000', category: 'voucher', brand: 'Digital', price: 51000, status: 'available', source: 'demo' }
  ],
  wallet: [
    { code: 'DANA25', name: 'DANA 25.000', category: 'wallet', brand: 'DANA', price: 26000, status: 'available', source: 'demo' },
    { code: 'GOPAY25', name: 'GoPay 25.000', category: 'wallet', brand: 'GoPay', price: 26000, status: 'available', source: 'demo' },
    { code: 'OVO25', name: 'OVO 25.000', category: 'wallet', brand: 'OVO', price: 26000, status: 'available', source: 'demo' }
  ]
};

function normalizeCategory(raw: unknown) {
  const value = String(raw || 'pulsa').toLowerCase();
  if (value === 'paket-data') return 'data';
  if (value === 'token-pln') return 'pln';
  if (value === 'e-wallet') return 'wallet';
  return demoProducts[value] ? value : 'pulsa';
}

function matchesCategory(product: PpobProduct, type: string) {
  const terms = categoryMap[type] || [type];
  const haystack = `${product.category} ${product.brand || ''} ${product.name}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function normalizeVipaymentProduct(item: Record<string, unknown>): PpobProduct {
  const code = String(item.code || item.kode || item.service || item.id || item.sku || 'PRODUCT');
  const name = String(item.name || item.nama || item.service_name || item.product || code);
  const category = String(item.category || item.kategori || item.type || 'produk').toLowerCase();
  const brand = String(item.brand || item.operator || item.provider || '');
  const rawPrice = item.price || item.harga || item.basic_price || item.seller_price || 0;
  const price = Number(String(rawPrice).replace(/[^0-9]/g, '')) || 0;
  const rawStatus = String(item.status || item.available || item.gangguan || '').toLowerCase();
  const status = rawStatus.includes('off') || rawStatus.includes('gangguan') || rawStatus === '0' ? 'offline' : 'available';
  return { code, name, category, brand, price, status, source: 'vipayment' };
}

async function fetchVipaymentProducts(type: string): Promise<PpobProduct[]> {
  const endpoint = process.env.VIPAYMENT_API_URL || process.env.VIP_RESELLER_API_URL || process.env.VI_PAYMENT_API_URL;
  const key = process.env.VIPAYMENT_API_KEY || process.env.VIP_RESELLER_API_KEY || process.env.VI_PAYMENT_API_KEY;
  const sign = process.env.VIPAYMENT_SIGN || process.env.VIP_RESELLER_SIGN || process.env.VI_PAYMENT_SIGN;
  if (!endpoint || !key || !sign) return [];

  const body = new URLSearchParams();
  body.set('key', key);
  body.set('sign', sign);
  body.set('type', 'services');
  body.set('category', type);
  body.set('filter_type', type);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!response.ok) return [];

  const json = await response.json().catch(() => null) as Record<string, unknown> | null;
  const raw = (json?.data || json?.products || json?.services || []) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeVipaymentProduct(item as Record<string, unknown>)).filter((product) => matchesCategory(product, type));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const type = normalizeCategory(req.query.type);
  try {
    const vipaymentProducts = await fetchVipaymentProducts(type);
    const products = vipaymentProducts.length ? vipaymentProducts : demoProducts[type];
    return res.status(200).json({ ok: true, type, source: vipaymentProducts.length ? 'vipayment' : 'demo', products });
  } catch {
    return res.status(200).json({ ok: true, type, source: 'demo', products: demoProducts[type] });
  }
}
