import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type SupabaseService = ReturnType<typeof createSupabaseServiceClient>;

type PanelOrderRow = {
  id: string;
  user_id: string;
  public_order_id: string;
  status: string;
  amount: number;
  product_snapshot?: Record<string, unknown> | null;
  raw_response?: Record<string, unknown> | null;
  refund_wallet_transaction_id?: string | null;
};

type AdminContext = {
  user: NonNullable<Awaited<ReturnType<typeof verifySupabaseUser>>>;
  profile: { id: string; email?: string | null; role?: string | null };
  supabase: SupabaseService;
};

function cleanText(value: unknown, max = 300) {
  return String(value || '')
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

function cleanUrl(value: unknown) {
  const raw = cleanText(value, 300);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

function friendlyDbError(message: string) {
  if (message.includes('ORDER_NOT_FOUND')) return 'Order panel tidak ditemukan.';
  if (message.includes('INVALID_AMOUNT')) return 'Nominal refund tidak valid.';
  if (message.includes('PROFILE_NOT_FOUND')) return 'Profil wallet user tidak ditemukan.';
  return message;
}

async function requireAdmin(req: NextApiRequest): Promise<AdminContext> {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) throw Object.assign(new Error('Login diperlukan.'), { statusCode: 401 });

  const supabase = createSupabaseServiceClient();
  const profile = await supabase.from('profiles').select('id,email,role').eq('id', user.id).single();
  if (profile.error) throw Object.assign(new Error(profile.error.message), { statusCode: 500 });

  const role = String(profile.data?.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'owner') throw Object.assign(new Error('Akses admin diperlukan.'), { statusCode: 403 });
  return { user, profile: profile.data, supabase };
}

function adminError(res: NextApiResponse, error: unknown) {
  const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number((error as { statusCode?: number }).statusCode) : 500;
  const message = error instanceof Error ? error.message : 'Akses admin gagal.';
  return res.status(statusCode || 500).json({ error: message });
}

async function recordEvent(
  supabase: SupabaseService,
  input: { orderId?: string | null; userId?: string | null; eventType: string; message?: string; metadata?: Record<string, unknown> }
) {
  try {
    await supabase.from('panel_order_events').insert({
      order_id: input.orderId || null,
      user_id: input.userId || null,
      event_type: input.eventType,
      message: input.message || null,
      metadata: input.metadata || {}
    });
  } catch {
    // Event logging should never break admin fulfillment.
  }
}

async function listOrders(req: NextApiRequest, res: NextApiResponse) {
  let admin: AdminContext;
  try {
    admin = await requireAdmin(req);
  } catch (error) {
    return adminError(res, error);
  }
  const { supabase } = admin;

  const status = cleanText(req.query.status, 60);
  let query = supabase
    .from('panel_orders')
    .select('*, panel_products(name, slug, badge, ram_mb, cpu_percent, disk_mb, duration_days)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status && status !== 'all') query = query.eq('status', status);

  const ordersResult = await query;
  if (ordersResult.error) return res.status(500).json({ error: ordersResult.error.message });

  const orders = ordersResult.data || [];
  const userIds = Array.from(new Set(orders.map((order) => order.user_id).filter(Boolean)));
  const profilesResult = userIds.length
    ? await supabase.from('profiles').select('id,email,display_name,role,d_balance').in('id', userIds)
    : { data: [], error: null };

  if (profilesResult.error) return res.status(500).json({ error: profilesResult.error.message });
  const profilesById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));

  return res.status(200).json({
    orders: orders.map((order) => ({ ...order, customer: profilesById.get(order.user_id) || null }))
  });
}

async function getOrder(supabase: SupabaseService, orderId: string) {
  const result = await supabase.from('panel_orders').select('*').eq('id', orderId).single();
  if (result.error) throw new Error(result.error.message);
  return result.data as PanelOrderRow;
}

function calculateExpiry(order: PanelOrderRow) {
  const snapshot = order.product_snapshot || {};
  const days = Number(snapshot.duration_days || 30);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 30;
  const expiry = new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);
  return expiry.toISOString();
}

async function fulfillOrder(req: NextApiRequest, res: NextApiResponse, admin: AdminContext) {
  const { supabase } = admin;
  const orderId = cleanText(req.body?.order_id, 80);
  const panelUrl = cleanUrl(req.body?.panel_url || req.body?.provisioned_panel_url);
  const panelUsername = cleanText(req.body?.panel_username || req.body?.provisioned_username, 80);
  const panelPassword = cleanText(req.body?.panel_password || req.body?.provisioned_password, 160);
  const serverId = cleanText(req.body?.server_id || req.body?.provisioned_server_id, 120);
  const adminNotes = cleanText(req.body?.admin_notes, 500);

  if (!orderId) return res.status(400).json({ error: 'Order ID wajib diisi.' });
  if (!panelUrl) return res.status(400).json({ error: 'URL panel valid wajib diisi.' });
  if (panelUsername.length < 3) return res.status(400).json({ error: 'Username panel wajib diisi.' });
  if (panelPassword.length < 4) return res.status(400).json({ error: 'Password panel wajib diisi.' });

  const order = await getOrder(supabase, orderId);
  const now = new Date().toISOString();
  const expiresAt = calculateExpiry(order);

  const rawResponse = {
    ...(order.raw_response || {}),
    fulfillment: {
      mode: 'manual-admin',
      admin_user_id: admin.user.id,
      panel_url: panelUrl,
      panel_username: panelUsername,
      server_id: serverId || null,
      fulfilled_at: now,
      expires_at: expiresAt
    }
  };

  const update = await supabase
    .from('panel_orders')
    .update({
      status: 'fulfilled',
      provisioned_panel_url: panelUrl,
      provisioned_username: panelUsername,
      provisioned_password: panelPassword,
      provisioned_server_id: serverId || null,
      admin_notes: adminNotes || null,
      fulfilled_at: now,
      expires_at: expiresAt,
      updated_at: now,
      raw_response: rawResponse
    })
    .eq('id', orderId)
    .select('*')
    .single();

  if (update.error) return res.status(500).json({ error: update.error.message });

  await recordEvent(supabase, {
    orderId,
    userId: order.user_id,
    eventType: 'fulfilled',
    message: 'Panel berhasil dibuat dan credential dikirim ke dashboard user.',
    metadata: { admin_user_id: admin.user.id, panel_url: panelUrl, server_id: serverId || null, expires_at: expiresAt }
  });

  return res.status(200).json({ order: update.data, message: 'Order panel berhasil difulfill. Detail sudah tampil di dashboard user.' });
}

async function markStatus(req: NextApiRequest, res: NextApiResponse, admin: AdminContext) {
  const { supabase } = admin;
  const orderId = cleanText(req.body?.order_id, 80);
  const targetStatus = cleanText(req.body?.status, 60);
  const adminNotes = cleanText(req.body?.admin_notes, 500);
  const allowed = new Set(['pending_fulfillment', 'processing', 'cancelled', 'failed']);

  if (!orderId) return res.status(400).json({ error: 'Order ID wajib diisi.' });
  if (!allowed.has(targetStatus)) return res.status(400).json({ error: 'Status tidak valid.' });

  const order = await getOrder(supabase, orderId);
  if (order.status === 'fulfilled' && targetStatus !== 'failed') return res.status(409).json({ error: 'Order fulfilled tidak boleh diubah sembarangan.' });

  const now = new Date().toISOString();
  const update = await supabase
    .from('panel_orders')
    .update({ status: targetStatus, admin_notes: adminNotes || null, updated_at: now })
    .eq('id', orderId)
    .select('*')
    .single();

  if (update.error) return res.status(500).json({ error: update.error.message });

  await recordEvent(supabase, {
    orderId,
    userId: order.user_id,
    eventType: `status_${targetStatus}`,
    message: adminNotes || `Status order panel diubah menjadi ${targetStatus}.`,
    metadata: { admin_user_id: admin.user.id, status: targetStatus }
  });

  return res.status(200).json({ order: update.data, message: 'Status order panel berhasil diperbarui.' });
}

async function refundOrder(req: NextApiRequest, res: NextApiResponse, admin: AdminContext) {
  const { supabase } = admin;
  const orderId = cleanText(req.body?.order_id, 80);
  const reason = cleanText(req.body?.reason || req.body?.admin_notes || 'Refund order panel oleh admin.', 500);

  if (!orderId) return res.status(400).json({ error: 'Order ID wajib diisi.' });
  const order = await getOrder(supabase, orderId);
  if (order.refund_wallet_transaction_id) return res.status(409).json({ error: 'Order ini sudah pernah direfund.' });

  const refund = await supabase.rpc('refund_panel_order_atomic', {
    target_order_id: orderId,
    refund_reference: order.public_order_id,
    refund_reason: reason,
    refund_metadata: { admin_user_id: admin.user.id, reason }
  });

  if (refund.error) return res.status(500).json({ error: friendlyDbError(refund.error.message) });

  await recordEvent(supabase, {
    orderId,
    userId: order.user_id,
    eventType: 'refunded',
    message: reason,
    metadata: { admin_user_id: admin.user.id, refund: refund.data as Record<string, unknown> }
  });

  const updated = await getOrder(supabase, orderId);
  return res.status(200).json({ order: updated, refund: refund.data, message: 'Refund panel berhasil diproses.' });
}

async function updateOrder(req: NextApiRequest, res: NextApiResponse) {
  let admin: AdminContext;
  try {
    admin = await requireAdmin(req);
  } catch (error) {
    return adminError(res, error);
  }

  const action = cleanText(req.body?.action, 40);
  try {
    if (action === 'fulfill') return fulfillOrder(req, res, admin);
    if (action === 'refund') return refundOrder(req, res, admin);
    if (action === 'status') return markStatus(req, res, admin);
    return res.status(400).json({ error: 'Action tidak valid.' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Admin action gagal.' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return listOrders(req, res);
  if (req.method === 'PATCH' || req.method === 'POST') return updateOrder(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
