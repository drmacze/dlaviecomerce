import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { requestDigiflazzTopup } from '@/lib/digiflazz';
import { settlePpobOrder } from '@/lib/ppob-settlement';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type PpobProduct = {
  id: string;
  sku_code: string;
  product_name: string;
  category: string;
  brand?: string | null;
  provider_price: number;
  margin: number;
  selling_price: number;
};

type ProfileWallet = {
  id: string;
  email?: string | null;
  d_balance: number;
};

function toInt(value: unknown) {
  const parsed = Math.floor(Number(value || 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanCustomerNo(value: unknown) {
  return String(value || '').trim().replace(/\s+/g, '').slice(0, 80);
}

function isValidCustomerNo(value: string) {
  return /^[a-zA-Z0-9._-]{3,80}$/.test(value);
}

function generateRefId() {
  return `DLV-PPOB-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function ensureProfile(userId: string, email?: string | null) {
  const supabase = createSupabaseServiceClient();
  const profile = await supabase.from('profiles').select('id,email,d_balance').eq('id', userId).maybeSingle();
  if (profile.error) throw new Error(profile.error.message);
  if (profile.data) return profile.data as ProfileWallet;

  const created = await supabase.from('profiles').insert({ id: userId, email, d_balance: 0, d_points: 0, l_points: 0, vip_level: 'free' }).select('id,email,d_balance').single();
  if (created.error) throw new Error(created.error.message);
  return created.data as ProfileWallet;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan untuk memakai PPOB.' });

  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const orders = await supabase
      .from('ppob_orders')
      .select('id,ref_id,sku_code,product_name,customer_no,selling_price,status,provider_status,provider_message,serial_number,created_at,updated_at,settled_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (orders.error) return res.status(500).json({ error: orders.error.message });
    return res.status(200).json({ orders: orders.data || [] });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const productId = String(req.body?.product_id || '').trim();
  const customerNo = cleanCustomerNo(req.body?.customer_no);
  if (!productId) return res.status(400).json({ error: 'Produk PPOB wajib dipilih.' });
  if (!isValidCustomerNo(customerNo)) return res.status(400).json({ error: 'Nomor tujuan/User ID tidak valid.' });

  try {
    const productQuery = await supabase
      .from('ppob_products')
      .select('id,sku_code,product_name,category,brand,provider_price,margin,selling_price')
      .eq('id', productId)
      .eq('is_active', true)
      .eq('buyer_product_status', true)
      .eq('seller_product_status', true)
      .single();

    if (productQuery.error || !productQuery.data) return res.status(404).json({ error: 'Produk PPOB tidak ditemukan atau sedang nonaktif.' });
    const product = productQuery.data as PpobProduct;
    const sellingPrice = toInt(product.selling_price);
    if (sellingPrice <= 0) return res.status(400).json({ error: 'Harga produk PPOB tidak valid.' });

    const profile = await ensureProfile(user.id, user.email);
    if (toInt(profile.d_balance) < sellingPrice) return res.status(400).json({ error: 'D-Balance tidak cukup untuk transaksi PPOB ini.' });

    const refId = generateRefId();
    const nextBalance = toInt(profile.d_balance) - sellingPrice;
    const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', user.id).select('id,d_balance').single();
    if (balance.error) return res.status(500).json({ error: balance.error.message });

    const walletTx = await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'purchase',
      amount: -sellingPrice,
      status: 'success',
      provider: 'ppob-digiflazz',
      reference: refId,
      metadata: {
        source: 'dlavie-ppob',
        product_id: product.id,
        sku_code: product.sku_code,
        product_name: product.product_name,
        customer_no: customerNo,
        charged_at: new Date().toISOString()
      }
    }).select('*').single();

    if (walletTx.error) return res.status(500).json({ error: walletTx.error.message });

    const order = await supabase.from('ppob_orders').insert({
      user_id: user.id,
      product_id: product.id,
      ref_id: refId,
      provider: 'digiflazz',
      sku_code: product.sku_code,
      product_name: product.product_name,
      customer_no: customerNo,
      provider_price: toInt(product.provider_price),
      margin: toInt(product.margin),
      selling_price: sellingPrice,
      status: 'pending',
      wallet_transaction_id: walletTx.data.id,
      raw_response: {}
    }).select('*').single();

    if (order.error) return res.status(500).json({ error: order.error.message });

    try {
      const provider = await requestDigiflazzTopup({ skuCode: product.sku_code, customerNo, refId });
      const settled = await settlePpobOrder(refId, provider, 'initial_response');
      return res.status(200).json({ order: settled.order || order.data, status: settled.status, refId, wallet: balance.data, provider });
    } catch (providerError) {
      const message = providerError instanceof Error ? providerError.message : 'Provider request failed';
      const updated = await supabase.from('ppob_orders').update({
        status: 'pending',
        provider_message: message,
        raw_response: { provider_error: message, recorded_at: new Date().toISOString() },
        updated_at: new Date().toISOString()
      }).eq('ref_id', refId).select('*').single();
      if (updated.error) return res.status(500).json({ error: updated.error.message });
      return res.status(202).json({ order: updated.data, status: 'pending', refId, warning: 'Transaksi tersimpan sebagai pending karena provider belum memberi respons final.' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PPOB order failed';
    return res.status(500).json({ error: message });
  }
}
