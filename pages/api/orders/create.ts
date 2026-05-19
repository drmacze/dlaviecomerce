import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type OrderItemInput = { product_id: string; qty: number };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { buyer_email, items, coupon_code } = req.body || {};
    const email = String(buyer_email || '').trim().toLowerCase();
    const orderItems = Array.isArray(items) ? items as OrderItemInput[] : [];
    if (!email || !orderItems.length) return res.status(400).json({ error: 'Email dan items wajib diisi.' });

    const supabase = createSupabaseServiceClient();
    const ids = orderItems.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase.from('products').select('id, price').in('id', ids).eq('is_published', true);
    if (productsError || !products?.length) return res.status(400).json({ error: 'Produk tidak valid.' });

    const priceMap = new Map(products.map((p) => [p.id, Number(p.price || 0)]));
    const mapped = orderItems.map((item) => ({ product_id: item.product_id, qty: Math.max(1, Number(item.qty || 1)), price: priceMap.get(item.product_id) || 0 })).filter((item) => item.price > 0);
    const subtotal = mapped.reduce((sum, item) => sum + item.price * item.qty, 0);

    let discount = 0;
    const couponCode = String(coupon_code || '').trim().toUpperCase();
    if (couponCode) {
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode).eq('is_active', true).maybeSingle();
      if (coupon && subtotal >= Number(coupon.min_amount || 0)) {
        discount = coupon.discount_type === 'percent' ? Math.floor(subtotal * Number(coupon.amount || 0) / 100) : Number(coupon.amount || 0);
        discount = Math.min(subtotal, Math.max(0, discount));
      }
    }

    const total = Math.max(0, subtotal - discount);
    const { data: order, error } = await supabase.from('orders').insert({ buyer_email: email, total_amount: total, status: 'pending' }).select('id').single();
    if (error || !order) return res.status(500).json({ error: error?.message || 'Order gagal dibuat.' });
    const itemResult = await supabase.from('order_items').insert(mapped.map((item) => ({ ...item, order_id: order.id })));
    if (itemResult.error) return res.status(500).json({ error: itemResult.error.message });
    if (couponCode && discount > 0) {
      const { data: coupon } = await supabase.from('coupons').select('id, redeemed_count').eq('code', couponCode).maybeSingle();
      if (coupon) await supabase.from('coupons').update({ redeemed_count: Number(coupon.redeemed_count || 0) + 1 }).eq('id', coupon.id);
    }
    return res.status(200).json({ orderId: order.id, subtotal, discount, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create order failed';
    return res.status(500).json({ error: message });
  }
}
