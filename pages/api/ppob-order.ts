import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { requestVipaymentPrepaidOrder } from '@/lib/vipayment';
import { shouldUseVipayment } from '@/lib/vipayment-sync';

type ProductRow = {
  id: string;
  provider: string;
  sku_code: string;
  product_name: string;
  provider_price: number;
  margin: number;
  selling_price: number;
};

type ProfileRow = {
  id: string;
  email?: string | null;
  d_balance: number;
};

function cleanTarget(value: unknown) {
  return String(value || '').trim().replace(/\s+/g, '').slice(0, 80);
}

function normalizeStatus(value?: string) {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'success') return 'success';
  if (status === 'error' || status === 'failed' || status === 'gagal') return 'failed';
  return 'pending';
}

function autoOrderEnabled() {
  return process.env.PPOB_AUTO_ORDER_ENABLED === 'true';
}

async function refundBalance(input: { userId: string; amount: number; reference: string; reason: string; metadata?: Record<string, unknown> }) {
  const supabase = createSupabaseServiceClient();
  const profile = await supabase.from('profiles').select('id,d_balance').eq('id', input.userId).single();
  if (profile.error) throw new Error(profile.error.message);

  const nextBalance = Number(profile.data.d_balance || 0) + input.amount;
  const updated = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', input.userId).select('id,d_balance').single();
  if (updated.error) throw new Error(updated.error.message);

  const wallet = await supabase.from('wallet_transactions').insert({
    user_id: input.userId,
    type: 'refund',
    amount: input.amount,
    status: 'success',
    provider: 'vipayment',
    reference: `${input.reference}-REFUND`,
    metadata: {
      source: 'ppob-vipayment',
      reason: input.reason,
      ...input.metadata
    }
  }).select('*').single();

  if (wallet.error) throw new Error(wallet.error.message);
  return { wallet: wallet.data, balance: updated.data };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!autoOrderEnabled()) {
    return res.status(403).json({ error: 'Order otomatis PPOB masih dikunci. Aktifkan PPOB_AUTO_ORDER_ENABLED=true setelah siap testing saldo kecil.' });
  }

  if (!shouldUseVipayment()) return res.status(503).json({ error: 'Provider VIPayment belum aktif atau env belum lengkap.' });

  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan untuk order PPOB.' });

  const productId = String(req.body?.product_id || '').trim();
  const customerNo = cleanTarget(req.body?.customer_no);
  if (!productId) return res.status(400).json({ error: 'Produk wajib dipilih.' });
  if (customerNo.length < 4) return res.status(400).json({ error: 'Nomor tujuan/User ID wajib diisi dengan benar.' });

  const supabase = createSupabaseServiceClient();
  const productResult = await supabase
    .from('ppob_products')
    .select('id,provider,sku_code,product_name,provider_price,margin,selling_price')
    .eq('id', productId)
    .eq('provider', 'vipayment')
    .eq('is_active', true)
    .single();

  if (productResult.error || !productResult.data) return res.status(404).json({ error: 'Produk VIPayment tidak ditemukan atau belum aktif.' });
  const product = productResult.data as ProductRow;
  const sellingPrice = Math.floor(Number(product.selling_price || 0));
  if (sellingPrice <= 0) return res.status(400).json({ error: 'Harga produk tidak valid.' });

  const profileResult = await supabase.from('profiles').select('id,email,d_balance').eq('id', user.id).single();
  if (profileResult.error || !profileResult.data) return res.status(404).json({ error: 'Profil wallet tidak ditemukan. Buka halaman Wallet dahulu.' });
  const profile = profileResult.data as ProfileRow;

  if (Number(profile.d_balance || 0) < sellingPrice) return res.status(400).json({ error: 'D-Balance tidak cukup untuk order ini.' });

  const localRef = `DLV-VIP-${Date.now()}-${user.id.slice(0, 6)}`;
  const nextBalance = Number(profile.d_balance || 0) - sellingPrice;
  const balanceUpdate = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', user.id).select('id,d_balance').single();
  if (balanceUpdate.error) return res.status(500).json({ error: balanceUpdate.error.message });

  const walletResult = await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'purchase',
    amount: sellingPrice,
    status: 'pending',
    provider: 'vipayment',
    reference: localRef,
    metadata: {
      source: 'ppob-vipayment',
      product_id: product.id,
      sku_code: product.sku_code,
      product_name: product.product_name,
      customer_no: customerNo,
      deducted_balance: sellingPrice,
      created_at: new Date().toISOString()
    }
  }).select('*').single();

  if (walletResult.error) {
    await supabase.from('profiles').update({ d_balance: profile.d_balance }).eq('id', user.id);
    return res.status(500).json({ error: walletResult.error.message });
  }

  try {
    const order = await requestVipaymentPrepaidOrder({ service: product.sku_code, dataNo: customerNo });
    const status = normalizeStatus(order.status);
    const refId = order.trxid || localRef;

    const ppobOrder = await supabase.from('ppob_orders').insert({
      user_id: user.id,
      product_id: product.id,
      ref_id: refId,
      provider: 'vipayment',
      sku_code: product.sku_code,
      product_name: product.product_name,
      customer_no: customerNo,
      provider_price: Math.floor(Number(product.provider_price || 0)),
      margin: Math.floor(Number(product.margin || 0)),
      selling_price: sellingPrice,
      status,
      provider_status: order.status || null,
      provider_message: order.note || null,
      wallet_transaction_id: walletResult.data.id,
      raw_response: order,
      settled_at: status === 'success' || status === 'failed' ? new Date().toISOString() : null
    }).select('*').single();

    if (ppobOrder.error) throw new Error(ppobOrder.error.message);

    await supabase.from('wallet_transactions').update({
      status: status === 'failed' ? 'failed' : 'success',
      reference: refId,
      metadata: {
        ...walletResult.data.metadata,
        provider_response: order,
        ppob_order_id: ppobOrder.data.id
      }
    }).eq('id', walletResult.data.id);

    let refund = null;
    if (status === 'failed') {
      refund = await refundBalance({ userId: user.id, amount: sellingPrice, reference: refId, reason: order.note || 'VIPayment order failed', metadata: { ppob_order_id: ppobOrder.data.id } });
      await supabase.from('ppob_orders').update({ refund_wallet_transaction_id: refund.wallet.id }).eq('id', ppobOrder.data.id);
    }

    return res.status(200).json({ order: ppobOrder.data, provider: order, wallet: balanceUpdate.data, refund });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order VIPayment gagal.';
    await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...walletResult.data.metadata, provider_error: message } }).eq('id', walletResult.data.id);
    const refund = await refundBalance({ userId: user.id, amount: sellingPrice, reference: localRef, reason: message, metadata: { product_id: product.id, sku_code: product.sku_code } });
    return res.status(502).json({ error: message, refund });
  }
}
