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

function cleanTarget(value: unknown) {
  return String(value || '').trim().replace(/\s+/g, '').slice(0, 80);
}

function normalizeStatus(value?: string) {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'success' || status === 'sukses') return 'success';
  if (status === 'error' || status === 'failed' || status === 'gagal') return 'failed';
  return 'pending';
}

function autoOrderEnabled() {
  return process.env.PPOB_AUTO_ORDER_ENABLED === 'true';
}

function friendlyDbError(message: string) {
  if (message.includes('INSUFFICIENT_BALANCE')) return 'D-Balance tidak cukup untuk order ini.';
  if (message.includes('INVALID_AMOUNT')) return 'Nominal transaksi tidak valid.';
  if (message.includes('PROFILE_NOT_FOUND')) return 'Profil wallet tidak ditemukan.';
  if (message.includes('ORDER_NOT_FOUND')) return 'Order PPOB tidak ditemukan.';
  return message;
}

async function debitBalance(supabase: ReturnType<typeof createSupabaseServiceClient>, userId: string, amount: number) {
  const result = await supabase.rpc('debit_d_balance_atomic', {
    target_user_id: userId,
    debit_amount: Math.floor(Number(amount || 0))
  });
  if (result.error) throw new Error(friendlyDbError(result.error.message));
  return Number(result.data || 0);
}

async function refundOrder(supabase: ReturnType<typeof createSupabaseServiceClient>, input: { orderId: string; reference: string; reason: string; metadata?: Record<string, unknown> }) {
  const result = await supabase.rpc('refund_ppob_order_atomic', {
    target_order_id: input.orderId,
    refund_reference: input.reference,
    refund_reason: input.reason,
    refund_metadata: input.metadata || {}
  });
  if (result.error) throw new Error(friendlyDbError(result.error.message));
  return result.data;
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

  let nextBalance = 0;
  try {
    nextBalance = await debitBalance(supabase, user.id, sellingPrice);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Debit D-Balance gagal.';
    return res.status(400).json({ error: message });
  }

  const localRef = `DLV-VIP-${Date.now()}-${user.id.slice(0, 6)}`;
  const walletResult = await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'purchase',
    amount: sellingPrice,
    status: 'success',
    provider: 'vipayment',
    reference: localRef,
    metadata: {
      source: 'ppob-vipayment',
      product_id: product.id,
      sku_code: product.sku_code,
      product_name: product.product_name,
      customer_no: customerNo,
      deducted_balance: sellingPrice,
      balance_after: nextBalance,
      created_at: new Date().toISOString()
    }
  }).select('*').single();

  if (walletResult.error) {
    await supabase.rpc('credit_d_balance_atomic', { target_user_id: user.id, credit_amount: sellingPrice });
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
      reference: refId,
      metadata: {
        ...walletResult.data.metadata,
        provider_response: order,
        ppob_order_id: ppobOrder.data.id
      }
    }).eq('id', walletResult.data.id);

    let refund = null;
    if (status === 'failed') {
      refund = await refundOrder(supabase, {
        orderId: ppobOrder.data.id,
        reference: refId,
        reason: order.note || 'VIPayment order failed',
        metadata: { provider_response: order }
      });
      await supabase.from('wallet_transactions').update({ status: 'failed' }).eq('id', walletResult.data.id);
    }

    return res.status(200).json({ order: ppobOrder.data, provider: order, wallet: { d_balance: nextBalance }, refund });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order VIPayment gagal.';
    await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...walletResult.data.metadata, provider_error: message } }).eq('id', walletResult.data.id);
    await supabase.rpc('credit_d_balance_atomic', { target_user_id: user.id, credit_amount: sellingPrice });
    return res.status(502).json({ error: message, refund: { refunded: true } });
  }
}
