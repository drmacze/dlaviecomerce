import { Router } from 'express';
import { bearerToken, verifySupabaseUser } from '../lib/auth-server.js';
import { createSupabaseServiceClient } from '../lib/supabase-server.js';

const router = Router();

function isAdminEmail(email?: string | null) {
  const admins = (process.env.VITE_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
  return Boolean(email && admins.includes(email.toLowerCase()));
}

router.get('/ppob/health', async (_req, res) => {
  try {
    const supabase = createSupabaseServiceClient();
    const { count } = await supabase.from('ppob_products').select('id', { count: 'exact', head: true }).eq('is_active', true);
    return res.status(200).json({ ok: true, ppob_products_active: count || 0 });
  } catch (error) {
    return res.status(200).json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/ppob/orders', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('ppob_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ orders: data || [] });
});

router.get('/ppob/check-status', async (req, res) => {
  const orderId = String(req.query.order_id || req.query.public_order_id || '').trim();
  if (!orderId) return res.status(400).json({ error: 'order_id is required' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('ppob_orders').select('*').or(`public_order_id.eq.${orderId},ref_id.eq.${orderId}`).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Order tidak ditemukan.' });
  return res.status(200).json({ order: data });
});

router.get('/deploy-check', (_req, res) => {
  return res.status(200).json({ ok: true, deployed: true, timestamp: new Date().toISOString(), version: process.env.DEPLOY_VERSION || 'unknown' });
});

router.get('/provider/outbound-ip', async (_req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json() as { ip?: string };
    return res.status(200).json({ ok: true, ip: data.ip || null });
  } catch (error) {
    return res.status(200).json({ ok: false, error: error instanceof Error ? error.message : 'IP fetch failed' });
  }
});

router.get('/referral', async (req, res) => {
  const code = String(req.query.code || '').trim();
  if (!code) return res.status(400).json({ error: 'code is required' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('profiles').select('id, display_name, referral_code, vip_level').eq('referral_code', code).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Referral code tidak ditemukan.' });
  return res.status(200).json({ referral: data });
});

router.get('/rewards', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const { data: profile } = await supabase.from('profiles').select('d_points, l_points, vip_level').eq('id', user.id).maybeSingle();
  const { data: transactions } = await supabase.from('wallet_transactions').select('*').eq('user_id', user.id).eq('type', 'reward').order('created_at', { ascending: false }).limit(20);
  return res.status(200).json({ points: profile?.d_points || 0, l_points: profile?.l_points || 0, vip_level: profile?.vip_level || 'free', transactions: transactions || [] });
});

router.get('/security', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from('profiles').select('security_score, last_login_at').eq('id', user.id).maybeSingle();
  return res.status(200).json({ security_score: data?.security_score || 0, last_login_at: data?.last_login_at || null });
});

router.get('/trusted-devices', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('trusted_devices').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ devices: data || [] });
});

router.get('/checkin', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from('checkins').select('*').eq('user_id', user.id).eq('date', today).maybeSingle();
  return res.status(200).json({ checked_in: Boolean(data), checkin: data || null, today });
});

router.post('/checkin', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const existing = await supabase.from('checkins').select('id').eq('user_id', user.id).eq('date', today).maybeSingle();
  if (existing.data) return res.status(409).json({ error: 'Sudah check-in hari ini.', checkin: existing.data });
  const { data, error } = await supabase.from('checkins').insert({ user_id: user.id, date: today, points_earned: 5 }).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  await supabase.rpc('credit_d_balance_atomic', { target_user_id: user.id, credit_amount: 5 }).then(() => null, () => null);
  return res.status(200).json({ checkin: data, points_earned: 5 });
});

router.get('/download/my', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const { data: orders } = await supabase.from('orders').select('id').eq('buyer_email', user.email?.toLowerCase() || '').eq('status', 'fulfilled');
  const ids = (orders || []).map((o) => o.id);
  if (!ids.length) return res.status(200).json({ downloads: [] });
  const { data: items } = await supabase.from('order_items').select('*, products(name, file_path, image_url)').in('order_id', ids);
  return res.status(200).json({ downloads: items || [] });
});

router.get('/affiliate', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();
  const { data: profile } = await supabase.from('profiles').select('referral_code, affiliate_rank, d_points').eq('id', user.id).maybeSingle();
  const { data: referrals } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false }).limit(50);
  return res.status(200).json({ profile: profile || {}, referrals: referrals || [] });
});

router.get('/gift', async (req, res) => {
  const code = String(req.query.code || '').trim();
  if (!code) return res.status(400).json({ error: 'code is required' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('gift_codes').select('id, code, amount, status, expires_at').eq('code', code).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Gift code tidak ditemukan.' });
  return res.status(200).json({ gift: data });
});

router.post('/gift', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const code = String(req.body?.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code is required' });
  const supabase = createSupabaseServiceClient();
  const { data: gift, error } = await supabase.from('gift_codes').select('*').eq('code', code).eq('status', 'unused').maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!gift) return res.status(404).json({ error: 'Gift code tidak valid atau sudah digunakan.' });
  if (gift.expires_at && new Date(gift.expires_at).getTime() < Date.now()) return res.status(410).json({ error: 'Gift code sudah expired.' });
  const claimed = await supabase.from('gift_codes').update({ status: 'used', used_by: user.id, used_at: new Date().toISOString() }).eq('id', gift.id).eq('status', 'unused').select('*').single();
  if (claimed.error || !claimed.data) return res.status(409).json({ error: 'Gift code sudah digunakan.' });
  await supabase.rpc('credit_d_balance_atomic', { target_user_id: user.id, credit_amount: Number(gift.amount || 0) }).then(() => null, () => null);
  return res.status(200).json({ ok: true, amount: gift.amount, gift: claimed.data });
});

router.get('/coupons/track', async (req, res) => {
  const code = String(req.query.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code is required' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('coupons').select('id, code, discount_type, amount, min_amount, usage_limit, redeemed_count, expires_at, is_active').eq('code', code).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Coupon tidak ditemukan.' });
  return res.status(200).json({ coupon: data });
});

router.get('/admin/telegram/test', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const { sendTelegramMessageToAdmins } = await import('../lib/telegram.js');
  try {
    const result = await sendTelegramMessageToAdmins('🔔 DLAVIE Admin Telegram Test - OK!');
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : 'Telegram test failed' });
  }
});

router.get('/admin/coupons', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ coupons: data || [] });
});

router.post('/admin/coupons', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const body = req.body || {};
  const code = String(body.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code is required' });
  const { data, error } = await supabase.from('coupons').insert({ code, discount_type: body.discount_type || 'fixed', amount: Number(body.amount || 0), min_amount: Number(body.min_amount || 0), usage_limit: body.usage_limit ? Number(body.usage_limit) : null, expires_at: body.expires_at || null, is_active: Boolean(body.is_active) }).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ coupon: data });
});

router.get('/admin/referrals', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('referrals').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ referrals: data || [] });
});

router.get('/admin/order-status', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('orders').select('status, count:status.count()').order('status');
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ status_counts: data || [] });
});

router.get('/admin/panel-orders', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('panel_orders').select('*, panel_products(name, slug), profiles(email, display_name)').order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ orders: data || [] });
});

router.get('/admin-gate/status', async (req, res) => {
  const secret = String(process.env.DLAVIE_ADMIN_ACTION_KEY || process.env.TELEGRAM_SETUP_KEY || '');
  const provided = String(req.headers['x-dlavie-bot-secret'] || req.query.auth || '');
  if (!secret || provided !== secret) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

router.post('/admin-gate/unlock', async (req, res) => {
  const secret = String(process.env.DLAVIE_ADMIN_ACTION_KEY || process.env.TELEGRAM_SETUP_KEY || '');
  const provided = String(req.body?.key || req.headers['x-dlavie-bot-secret'] || '');
  if (!secret || provided !== secret) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  return res.status(200).json({ ok: true, unlocked: true, timestamp: new Date().toISOString() });
});

router.post('/bot/ppob/products', async (req, res) => {
  const type = String(req.query.type || req.body?.type || 'pulsa').toLowerCase();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('ppob_products').select('id, sku_code, product_name, category, brand, selling_price').eq('is_active', true).ilike('category', `%${type}%`).order('selling_price', { ascending: true }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, type, products: data || [] });
});

router.post('/bot/ppob/orders', async (req, res) => {
  const supabase = createSupabaseServiceClient();
  const userId = String(req.body?.user_id || '').trim();
  if (!userId) return res.status(400).json({ error: 'user_id is required' });
  const { data, error } = await supabase.from('ppob_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true, orders: data || [] });
});

router.get('/bot/health', (_req, res) => res.status(200).json({ ok: true, service: 'dlavie-bot-api' }));
router.get('/bot/features', (_req, res) => res.status(200).json({ ok: true, features: ['ppob', 'wallet', 'orders', 'referral'] }));
router.get('/bot/faqs', async (_req, res) => {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from('faqs').select('*').eq('is_active', true).order('sort_order', { ascending: true }).limit(20);
  return res.status(200).json({ faqs: data || [] });
});

export default router;
