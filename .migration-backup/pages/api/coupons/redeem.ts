import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import type { Coupon } from '@/lib/types';

function discount(coupon: Coupon, subtotal: number) {
  if (coupon.discount_type === 'percent') return Math.min(subtotal, Math.floor(subtotal * coupon.amount / 100));
  return Math.min(subtotal, coupon.amount);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();
    const subtotal = Number(req.body?.subtotal || 0);
    if (!code || subtotal <= 0) return res.status(400).json({ error: 'Code and subtotal are required' });
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).single();
    if (error || !data) return res.status(404).json({ error: 'Coupon tidak ditemukan.' });
    const coupon = data as Coupon;
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'Coupon sudah expired.' });
    if (coupon.usage_limit !== null && coupon.redeemed_count >= coupon.usage_limit) return res.status(400).json({ error: 'Coupon sudah habis.' });
    if (subtotal < coupon.min_amount) return res.status(400).json({ error: `Minimum belanja Rp ${coupon.min_amount.toLocaleString('id-ID')}.` });
    const discountAmount = discount(coupon, subtotal);
    return res.status(200).json({ coupon, discountAmount, finalTotal: Math.max(0, subtotal - discountAmount) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Redeem failed';
    return res.status(500).json({ error: message });
  }
}
