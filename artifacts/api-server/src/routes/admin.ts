import { Router } from 'express';
import { bearerToken, verifySupabaseUser } from '../lib/auth-server.js';
import { createSupabaseServiceClient } from '../lib/supabase-server.js';
import { sendTelegramMessageToAdmins } from '../lib/telegram.js';
import { auditAndNotifyCommerce } from '../lib/commerce-audit.js';

const router = Router();

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function isAdminEmail(email?: string | null) {
  const admins = (process.env.VITE_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
  return Boolean(email && admins.includes(email.toLowerCase()));
}

function authorized(req: any) {
  const secret = String(process.env.DLAVIE_BOT_AUTH_SECRET || process.env.TELEGRAM_SETUP_KEY || process.env.DLAVIE_ADMIN_ACTION_KEY || '');
  const provided = String(req.headers['x-dlavie-bot-secret'] || req.query.auth || req.query.secret || '');
  return Boolean(secret && provided && provided === secret);
}

function actionKey() {
  return String(process.env.DLAVIE_ADMIN_ACTION_KEY || process.env.TELEGRAM_SETUP_KEY || '').trim();
}

function appBaseUrl(req: any) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

function cleanText(value: unknown, max = 220) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function boolValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1' || value === 'on';
  return fallback;
}

function linesToTitle(description: string) {
  const first = description.split('\n').map((line) => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean)[0];
  return first ? `Update: ${first.slice(0, 80)}` : 'Dlavie update selesai';
}

function validTopupAmount(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) && amount >= 10000 && amount <= 1000000;
}

const allowedKeys = new Set(['maintenance', 'beta', 'demo', 'announcement']);

router.get('/admin/runtime', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized runtime control.' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('dlavie_runtime_settings').select('key,value,updated_at').order('key');
  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, settings: data || [] });
});

router.post('/admin/runtime', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized runtime control.' });
  const supabase = createSupabaseServiceClient();

  const mode = String(req.body?.mode || req.body?.key || req.query.mode || '').trim().toLowerCase();
  if (!allowedKeys.has(mode)) return res.status(400).json({ ok: false, error: 'Invalid runtime key. Gunakan maintenance, beta, demo, atau announcement.' });

  const current = await supabase.from('dlavie_runtime_settings').select('value').eq('key', mode).maybeSingle();
  const oldValue = (current.data?.value || {}) as Record<string, unknown>;
  const wasEnabled = Boolean(oldValue.enabled);
  const enabled = boolValue(req.body?.enabled ?? req.query.enabled, Boolean(oldValue.enabled));
  const description = cleanText(req.body?.description ?? req.body?.reason ?? oldValue.description ?? oldValue.reason ?? '', 1400);
  const nextValue = { ...oldValue, ...(req.body?.value || {}), enabled, description, reason: description, updated_by: 'runtime-control' };

  if ((mode === 'maintenance' || mode === 'beta') && enabled && description.length < 3) {
    return res.status(400).json({ ok: false, error: 'Deskripsi wajib diisi saat mode diaktifkan.' });
  }

  const { error } = await supabase.from('dlavie_runtime_settings').upsert({ key: mode, value: nextValue, updated_at: new Date().toISOString() });
  if (error) return res.status(500).json({ ok: false, error: error.message });

  let announcement = null;
  if (mode === 'maintenance' && wasEnabled && !enabled && description) {
    const annValue = { enabled: true, title: linesToTitle(description), description, body: description, source: 'maintenance_release', created_at: new Date().toISOString() };
    const ann = await supabase.from('dlavie_runtime_settings').upsert({ key: 'announcement', value: annValue, updated_at: new Date().toISOString() }).select('key,value,updated_at').single();
    announcement = ann.data || null;
  }

  return res.status(200).json({ ok: true, key: mode, value: nextValue, announcement });
});

router.get('/admin/topups', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('wallet_transactions').select('*').eq('type', 'topup').order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  const rows = data || [];
  return res.status(200).json({ topups: rows, pending: rows.filter((tx) => tx.status === 'pending'), history: rows.filter((tx) => tx.status !== 'pending'), serverTime: new Date().toISOString() });
});

router.post('/admin/topups', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  const { id, action } = req.body || {};
  const reviewNote = cleanText(req.body?.review_note);
  if (!id || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'id and action are required' });

  const txResult = await supabase.from('wallet_transactions').select('*').eq('id', id).eq('type', 'topup').single();
  if (txResult.error || !txResult.data) return res.status(404).json({ error: txResult.error?.message || 'Topup not found' });
  const tx = txResult.data;
  if (tx.status !== 'pending') return res.status(409).json({ error: `Topup sudah diproses dengan status ${tx.status}.`, topup: tx });
  if (!validTopupAmount(tx.amount)) return res.status(400).json({ error: 'Nominal topup tidak valid. Minimal Rp 10.000 dan maksimal Rp 1.000.000.' });

  const metadata = { ...(tx.metadata || {}), reviewed_by: admin.email, reviewed_at: new Date().toISOString(), review_note: reviewNote, admin_action: action };

  if (action === 'reject') {
    const rejected = await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...metadata, rejected_at: new Date().toISOString() } }).eq('id', id).eq('type', 'topup').eq('status', 'pending').select('*').single();
    if (rejected.error || !rejected.data) {
      const latest = await supabase.from('wallet_transactions').select('*').eq('id', id).single();
      return res.status(409).json({ error: `Topup gagal ditolak. Status terbaru: ${latest.data?.status || 'unknown'}.`, topup: latest.data || null });
    }
    await auditAndNotifyCommerce({ action: 'topup_rejected', actor: admin.email, targetType: 'wallet_transaction', targetId: String(rejected.data.id), status: 'success', amount: Number(rejected.data.amount || 0), userId: rejected.data.user_id, reference: rejected.data.reference });
    return res.status(200).json({ topup: rejected.data });
  }

  const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.user_id).single();
  if (profile.error || !profile.data) return res.status(500).json({ error: profile.error?.message || 'Profile tidak ditemukan.' });
  const currentBalance = Number(profile.data.d_balance || 0);
  const nextBalance = currentBalance + Number(tx.amount || 0);
  const successMeta = { ...metadata, balance_before: currentBalance, balance_after: nextBalance, approved_at: new Date().toISOString() };

  const claimed = await supabase.from('wallet_transactions').update({ status: 'success', metadata: successMeta }).eq('id', id).eq('type', 'topup').eq('status', 'pending').select('*').single();
  if (claimed.error || !claimed.data) {
    const latest = await supabase.from('wallet_transactions').select('*').eq('id', id).single();
    return res.status(409).json({ error: `Topup gagal di-approve. Status terbaru: ${latest.data?.status || 'unknown'}.`, topup: latest.data || null });
  }

  const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.user_id).eq('d_balance', currentBalance).select('id,d_balance').single();
  if (balance.error || !balance.data) {
    await supabase.from('wallet_transactions').update({ status: 'pending', metadata: { ...metadata, rollback_reason: 'balance_update_failed_after_claim', rollback_at: new Date().toISOString() } }).eq('id', id).eq('status', 'success');
    return res.status(409).json({ error: 'Saldo user berubah saat approve. Transaksi dikembalikan ke pending, refresh lalu coba lagi.' });
  }

  await auditAndNotifyCommerce({ action: 'topup_approved', actor: admin.email, targetType: 'wallet_transaction', targetId: String(claimed.data.id), status: 'success', amount: Number(claimed.data.amount || 0), userId: claimed.data.user_id, reference: claimed.data.reference });
  return res.status(200).json({ topup: claimed.data, wallet: balance.data });
});

router.get('/admin/topups/action', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const key = String(req.query.key || '').trim();
    const id = String(req.query.id || '').trim();
    const action = String(req.query.action || '').trim().toLowerCase();
    const secret = actionKey();

    if (!secret || key !== secret) return res.status(401).json({ error: 'Invalid action key' });
    if (!id) return res.status(400).json({ error: 'id wajib diisi' });
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action tidak valid' });

    const supabase = createSupabaseServiceClient();
    const txResult = await supabase.from('wallet_transactions').select('*').eq('id', id).eq('type', 'topup').single();
    if (txResult.error || !txResult.data) return res.status(404).json({ error: txResult.error?.message || 'Topup tidak ditemukan' });

    const tx = txResult.data;
    if (tx.status !== 'pending') return res.status(409).json({ error: `Topup sudah diproses dengan status ${tx.status}.`, topup: tx });
    if (!validTopupAmount(tx.amount)) return res.status(400).json({ error: 'Nominal topup tidak valid.' });

    const metadata = { ...(tx.metadata || {}), reviewed_by: 'telegram-action', reviewed_at: new Date().toISOString(), admin_action: action };

    if (action === 'reject') {
      await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...metadata, rejected_at: new Date().toISOString() } }).eq('id', id).eq('type', 'topup').eq('status', 'pending');
      await sendTelegramMessageToAdmins(['🚫 Topup rejected', '', `Amount: ${rupiah(tx.amount)}`, `User: ${tx.user_id}`].join('\n'));
      res.writeHead(302, { Location: '/admin/topups' });
      return res.end();
    }

    const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.user_id).single();
    if (profile.error || !profile.data) return res.status(500).json({ error: 'Profile tidak ditemukan' });
    const currentBalance = Number(profile.data.d_balance || 0);
    const nextBalance = currentBalance + Number(tx.amount || 0);

    await supabase.from('wallet_transactions').update({ status: 'success', metadata: { ...metadata, balance_before: currentBalance, balance_after: nextBalance, approved_at: new Date().toISOString() } }).eq('id', id).eq('type', 'topup').eq('status', 'pending');
    await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.user_id);

    await sendTelegramMessageToAdmins(['✅ Topup approved', '', `Amount: ${rupiah(tx.amount)}`, `New Balance: ${rupiah(nextBalance)}`, `User: ${tx.user_id}`].join('\n'), {
      replyMarkup: { inline_keyboard: [[{ text: '💰 Open Topups', url: `${appBaseUrl(req)}/admin/topups` }]] }
    });
    res.writeHead(302, { Location: '/admin/topups' });
    return res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Topup action failed';
    return res.status(500).json({ error: message });
  }
});

router.get('/admin/orders', async (req, res) => {
  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const orders = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(150);
  if (orders.error) return res.status(500).json({ error: orders.error.message });
  const ids = (orders.data || []).map((order) => order.id);
  const items = ids.length ? await supabase.from('order_items').select('*').in('order_id', ids) : { data: [], error: null };
  if (items.error) return res.status(500).json({ error: items.error.message });
  return res.status(200).json({ orders: orders.data || [], items: items.data || [] });
});

router.get('/admin/orders/action', async (req, res) => {
  const allowed = ['paid', 'fulfilled', 'cancelled'];
  try {
    const key = String(req.query.key || '').trim();
    const orderId = String(req.query.orderId || '').trim();
    const status = String(req.query.status || '').trim().toLowerCase();
    const secret = actionKey();

    if (!secret || key !== secret) return res.status(401).json({ error: 'Invalid action key' });
    if (!orderId) return res.status(400).json({ error: 'orderId wajib diisi' });
    if (!allowed.includes(status)) return res.status(400).json({ error: 'status tidak valid' });

    const supabase = createSupabaseServiceClient();
    const { data: order, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select('id, buyer_email, total_amount, status').single();
    if (error || !order) return res.status(404).json({ error: error?.message || 'Order tidak ditemukan' });

    await sendTelegramMessageToAdmins(['✅ Order status updated', '', `Order: ${String(order.id).slice(0, 8)}...`, `Email: ${order.buyer_email}`, `Total: ${rupiah(order.total_amount)}`, `Status: ${String(order.status).toUpperCase()}`].join('\n'));
    res.writeHead(302, { Location: `/admin/order-pulse?orderId=${encodeURIComponent(String(order.id))}` });
    return res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order action failed';
    return res.status(500).json({ error: message });
  }
});

router.get('/admin/users', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ users: data || [] });
});

router.post('/admin/users', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const levels = ['free', 'silver', 'gold', 'platinum', 'black'] as const;
  const ranks: Record<string, string> = { free: 'starter', silver: 'silver', gold: 'gold', platinum: 'platinum', black: 'black' };
  const { userId, vipLevel, bonusPoints } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const nextLevel = (levels as readonly string[]).includes(vipLevel) ? vipLevel : 'free';
  const bonus = Number(bonusPoints || 0);
  const current = await supabase.from('profiles').select('id,l_points,d_points').eq('id', userId).single();
  if (current.error) return res.status(500).json({ error: current.error.message });
  const updated = await supabase.from('profiles').update({
    is_vip: nextLevel !== 'free', vip_level: nextLevel, affiliate_rank: ranks[nextLevel],
    l_points: Number(current.data.l_points || 0) + (Number.isFinite(bonus) ? bonus : 0),
    d_points: Number(current.data.d_points || 0) + (Number.isFinite(bonus) ? bonus : 0)
  }).eq('id', userId).select('*').single();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  return res.status(200).json({ profile: updated.data });
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

router.get('/admin/products', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ products: data || [] });
});

router.post('/admin/products', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const body = (req.body || {}) as Record<string, unknown>;
  const name = String(body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Product name is required' });
  const payload = { name, description: body.description ? String(body.description) : null, price: Number(body.price || 0), category: String(body.category || 'digital').trim() || 'digital', image_url: body.image_url ? String(body.image_url) : null, file_path: body.file_path ? String(body.file_path) : null, is_published: Boolean(body.is_published), release_date: body.release_date ? String(body.release_date) : null, stock: Number.isFinite(Number(body.stock)) ? Number(body.stock) : 99, badge: body.badge ? String(body.badge) : 'DLAVIE', mood_color: body.mood_color ? String(body.mood_color) : '#2467c9', slug: slugify(name) };
  const { data, error } = await supabase.from('products').insert(payload).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ product: data });
});

router.patch('/admin/products', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const body = (req.body || {}) as Record<string, unknown>;
  const id = String(body.id || '');
  if (!id) return res.status(400).json({ error: 'Product id is required' });
  const payload: Record<string, unknown> = {};
  if ('name' in body) { payload.name = String(body.name || '').trim(); payload.slug = slugify(payload.name as string); }
  if ('description' in body) payload.description = body.description ? String(body.description) : null;
  if ('price' in body) payload.price = Number(body.price || 0);
  if ('category' in body) payload.category = String(body.category || 'digital').trim() || 'digital';
  if ('image_url' in body) payload.image_url = body.image_url ? String(body.image_url) : null;
  if ('file_path' in body) payload.file_path = body.file_path ? String(body.file_path) : null;
  if ('is_published' in body) payload.is_published = Boolean(body.is_published);
  if ('stock' in body) payload.stock = Number.isFinite(Number(body.stock)) ? Number(body.stock) : 99;
  if (!Object.keys(payload).length) return res.status(400).json({ error: 'No valid fields to update' });
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ product: data });
});

router.delete('/admin/products', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !isAdminEmail(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();
  const id = String(req.query.id || (req.body as { id?: string } | undefined)?.id || '');
  if (!id) return res.status(400).json({ error: 'Product id is required' });
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
});

export default router;
