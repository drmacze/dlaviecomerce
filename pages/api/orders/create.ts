import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type OrderItemInput = { product_id: string; qty: number; price: number };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { buyer_email, total_amount, items, coupon_code } = req.body || {};
    const email = String(buyer_email || '').trim().toLowerCase();
    const total = Number(total_amount || 0);
    const orderItems = Array.isArray(items) ? items as OrderItemInput[] : [];
    if (!email || !orderItems.length) return res.status(400).json({ error: 'Email dan items wajib diisi.' });
    const supabase = createSupabaseServiceClient();
    const { data: order, error } = await supabase.from('orders').insert({ buyer_email: email, total_amount: total, status: 'pending' }).select('id').single();
    if (error || !order) return res.status(500).json({ error: error?.message || 'Order gagal dibuat.' });
    const mapped = orderItems.map((item) => ({ order_id: order.id, product_id: item.product_id, qty: item.qty, price: item.price }));
    const itemResult = await supabase.from('order_items').insert(mapped);
    if (itemResult.error) return res.status(500).json({ error: itemResult.error.message });
    if (coupon_code) {
      const { data: coupon } = await supabase.from('coupons').select('id, redeemed_count').eq('code', String(coupon_code).trim().toUpperCase()).maybeSingle();
      if (coupon) await supabase.from('coupons').update({ redeemed_count: Number(coupon.redeemed_count || 0) + 1 }).eq('id', coupon.id);
    }
    return res.status(200).json({ orderId: order.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create order failed';
    return res.status(500).json({ error: message });
  }
}
