import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { notifyAdminsNewOrder } from '@/lib/order-telegram';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type OrderItemInput = { product_id?: string; qty?: number };
type CouponRow = { id: string; discount_type: string; amount: number; min_amount: number; usage_limit: number | null; redeemed_count: number; expires_at: string | null };

type ProfileWallet = { id: string; d_balance: number; d_points: number; vip_level: string | null };

function normalizeItems(items: unknown) {
  const rows = Array.isArray(items) ? (items as OrderItemInput[]) : [];
  const grouped = new Map<string, number>();
  for (const item of rows) {
    const id = String(item.product_id || '').trim();
    const qty = Math.min(99, Math.max(1, Math.floor(Number(item.qty || 1))));
    if (id) grouped.set(id, (grouped.get(id) || 0) + qty);
  }
  return Array.from(grouped.entries()).map(([product_id, qty]) => ({ product_id, qty }));
}

function couponDiscount(coupon: CouponRow, subtotal: number) {
  const amount = Number(coupon.amount || 0);
  const raw = coupon.discount_type === 'percent' ? Math.floor(subtotal * amount / 100) : amount;
  return Math.min(subtotal, Math.max(0, raw));
}

function pointsMultiplier(level?: string | null) {
  if (level === 'black') return 3;
  if (level === 'platinum') return 2;
  if (level === 'gold') return 1.5;
  if (level === 'silver') return 1.2;
  return 1;
}

function appBaseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.email) return res.status(401).json({ error: 'Login diperlukan untuk membuat order.' });

    const email = user.email.toLowerCase();
    const orderItems = normalizeItems(req.body?.items);
    const paymentMethod = String(req.body?.payment_method || 'manual');
    if (!orderItems.length) return res.status(400).json({ error: 'Items wajib diisi.' });

    const supabase = createSupabaseServiceClient();
    const ids = orderItems.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase.from('products').select('id, name, price').in('id', ids).eq('is_published', true);
    if (productsError || !products || products.length !== ids.length) return res.status(400).json({ error: 'Produk tidak valid.' });

    const productMap = new Map(products.map((p) => [String(p.id), { price: Number(p.price || 0), name: String((p as { name?: string }).name || 'Unknown Product') }]));
    const mapped = orderItems.map((item) => ({ product_id: item.product_id, qty: item.qty, price: productMap.get(item.product_id)?.price || 0, name: productMap.get(item.product_id)?.name || item.product_id })).filter((item) => item.price > 0);
    if (mapped.length !== orderItems.length) return res.status(400).json({ error: 'Produk tidak valid.' });
    const subtotal = mapped.reduce((sum, item) => sum + item.price * item.qty, 0);

    let discount = 0;
    const couponCode = String(req.body?.coupon_code || '').trim().toUpperCase();
    let couponId = '';
    if (couponCode) {
      const { data: coupon } = await supabase.from('coupons').select('id, discount_type, amount, min_amount, usage_limit, redeemed_count, expires_at').eq('code', couponCode).eq('is_active', true).maybeSingle();
      if (!coupon) return res.status(400).json({ error: 'Coupon tidak valid.' });
      const row = coupon as CouponRow;
      if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'Coupon sudah expired.' });
      if (row.usage_limit !== null && Number(row.redeemed_count || 0) >= Number(row.usage_limit)) return res.status(400).json({ error: 'Coupon sudah habis.' });
      if (subtotal < Number(row.min_amount || 0)) return res.status(400).json({ error: 'Subtotal belum memenuhi minimum coupon.' });
      discount = couponDiscount(row, subtotal);
      couponId = row.id;
    }

    const total = Math.max(0, subtotal - discount);
    let userProfile: ProfileWallet | null = null;
    if (paymentMethod === 'd_balance') {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('id, d_balance, d_points, vip_level').eq('id', user.id).single();
      if (profileError || !profile) return res.status(401).json({ error: 'Profile wallet tidak ditemukan.' });
      userProfile = profile as ProfileWallet;
      if (Number(userProfile.d_balance || 0) < total) return res.status(400).json({ error: 'D-Balance tidak cukup. Silakan topup dulu.' });
    }

    const orderStatus = paymentMethod === 'd_balance' ? 'paid' : 'pending';
    const { data: order, error } = await supabase.from('orders').insert({ buyer_email: email, total_amount: total, status: orderStatus }).select('id').single();
    if (error || !order) return res.status(500).json({ error: error?.message || 'Order gagal dibuat.' });

    const itemResult = await supabase.from('order_items').insert(mapped.map((item) => ({ product_id: item.product_id, qty: item.qty, price: item.price, order_id: order.id })));
    if (itemResult.error) return res.status(500).json({ error: itemResult.error.message });

    let pointsEarned = 0;
    if (paymentMethod === 'd_balance' && userProfile) {
      pointsEarned = Math.floor((total / 10000) * pointsMultiplier(userProfile.vip_level));
      const nextBalance = Number(userProfile.d_balance || 0) - total;
      const nextPoints = Number(userProfile.d_points || 0) + pointsEarned;
      const walletUpdate = await supabase.from('profiles').update({ d_balance: nextBalance, d_points: nextPoints, l_points: nextPoints }).eq('id', userProfile.id);
      if (walletUpdate.error) return res.status(500).json({ error: walletUpdate.error.message });
      await supabase.from('wallet_transactions').insert({ user_id: userProfile.id, type: 'purchase', amount: -total, status: 'success', provider: 'd_balance', reference: order.id, metadata: { order_id: order.id, points_earned: pointsEarned } });
      if (pointsEarned > 0) await supabase.from('wallet_transactions').insert({ user_id: userProfile.id, type: 'reward', amount: pointsEarned, status: 'success', provider: 'd_points', reference: order.id, metadata: { order_id: order.id } });
    }

    if (couponId && discount > 0) {
      const { data: coupon } = await supabase.from('coupons').select('redeemed_count').eq('id', couponId).maybeSingle();
      await supabase.from('coupons').update({ redeemed_count: Number(coupon?.redeemed_count || 0) + 1 }).eq('id', couponId);
    }

    notifyAdminsNewOrder({
      appUrl: appBaseUrl(req),
      orderId: String(order.id),
      buyerEmail: email,
      total,
      subtotal,
      discount,
      status: orderStatus,
      paymentMethod,
      couponCode: couponCode || null,
      items: mapped,
    }).catch((telegramError) => console.error('Telegram order notification failed:', telegramError));

    return res.status(200).json({ orderId: order.id, subtotal, discount, total, paymentMethod, status: orderStatus, pointsEarned });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create order failed';
    return res.status(500).json({ error: message });
  }
}
