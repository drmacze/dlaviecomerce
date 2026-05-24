import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function text(value: unknown) {
  return String(value || '').trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.id || !user.email) return res.status(401).json({ ok: false, error: 'Login dulu untuk membeli produk.' });

    const productCode = text(req.body?.productCode || req.body?.code);
    const target = text(req.body?.target);
    const type = text(req.body?.type || 'produk');
    if (!productCode) return res.status(400).json({ ok: false, error: 'Kode produk belum dipilih.' });
    if (!target) return res.status(400).json({ ok: false, error: 'Tujuan transaksi wajib diisi.' });

    const supabase = createSupabaseServiceClient();
    const { data: product, error: productError } = await supabase
      .from('ppob_products')
      .select('id, provider, sku_code, product_name, category, brand, provider_price, margin, selling_price, buyer_product_status, seller_product_status, is_active')
      .eq('sku_code', productCode)
      .eq('is_active', true)
      .maybeSingle();

    if (productError) return res.status(500).json({ ok: false, error: productError.message });
    if (!product) return res.status(404).json({ ok: false, error: 'Produk PPOB tidak ditemukan atau sedang nonaktif.' });
    if (!product.buyer_product_status || !product.seller_product_status) return res.status(409).json({ ok: false, error: 'Produk sedang gangguan/offline.' });

    const sellingPrice = Number(product.selling_price || 0) || Number(product.provider_price || 0) + Number(product.margin || 0);
    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) return res.status(400).json({ ok: false, error: 'Harga produk tidak valid.' });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, d_balance')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) return res.status(500).json({ ok: false, error: profileError.message });
    if (!profile) return res.status(404).json({ ok: false, error: 'Profil akun tidak ditemukan.' });

    const currentBalance = Number(profile.d_balance || 0);
    if (currentBalance < sellingPrice) {
      return res.status(402).json({ ok: false, error: `Saldo D-Balance kurang. Butuh Rp ${sellingPrice.toLocaleString('id-ID')}.`, balance: currentBalance, required: sellingPrice });
    }

    const refId = makeId('PPOB');
    const idempotencyKey = `${user.id}:${product.sku_code}:${target}:${sellingPrice}:${Date.now()}`;

    const { data: walletTx, error: walletError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: -sellingPrice,
        status: 'success',
        provider: 'dlavie-ppob',
        reference: refId,
        metadata: { product_code: product.sku_code, product_name: product.product_name, target, category: type }
      })
      .select('id')
      .single();

    if (walletError) return res.status(500).json({ ok: false, error: walletError.message });

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ d_balance: currentBalance - sellingPrice })
      .eq('id', user.id)
      .eq('d_balance', currentBalance);

    if (balanceError) return res.status(500).json({ ok: false, error: balanceError.message });

    const { data: order, error: orderError } = await supabase
      .from('ppob_orders')
      .insert({
        user_id: user.id,
        product_id: product.id,
        ref_id: refId,
        provider: product.provider || 'database',
        sku_code: product.sku_code,
        product_name: product.product_name,
        customer_no: target,
        provider_price: Number(product.provider_price || 0),
        margin: Number(product.margin || 0),
        selling_price: sellingPrice,
        status: 'pending',
        provider_status: 'queued',
        provider_message: 'Order dibuat dan menunggu eksekusi provider.',
        wallet_transaction_id: walletTx?.id || null,
        public_order_id: refId,
        idempotency_key: idempotencyKey,
        raw_request: { type, target, productCode }
      })
      .select('*')
      .single();

    if (orderError) return res.status(500).json({ ok: false, error: orderError.message });

    await supabase.from('ppob_order_events').insert({
      order_id: order.id,
      user_id: user.id,
      event_type: 'created',
      message: 'Order PPOB dibuat dari web DLAVIE.',
      metadata: { ref_id: refId, wallet_transaction_id: walletTx?.id || null, balance_after: currentBalance - sellingPrice }
    });

    return res.status(201).json({
      ok: true,
      orderNumber: refId,
      order,
      balanceAfter: currentBalance - sellingPrice,
      message: 'Order PPOB berhasil dibuat dan saldo D-Balance sudah dipotong.'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal membuat order PPOB.';
    return res.status(500).json({ ok: false, error: message });
  }
}
