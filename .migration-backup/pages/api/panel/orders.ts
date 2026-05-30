import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type SupabaseService = ReturnType<typeof createSupabaseServiceClient>;

type PanelProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category: string;
  ram_mb: number;
  cpu_percent: number;
  disk_mb: number;
  backup_limit: number;
  database_limit: number;
  allocation_limit: number;
  duration_days: number;
  stock?: number | null;
  price: number;
  badge?: string | null;
  metadata?: Record<string, unknown> | null;
};

function cleanText(value: unknown, max = 80) {
  return String(value || '')
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

function cleanIdempotencyKey(value: unknown) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9._:-]/g, '')
    .slice(0, 120);
}

function friendlyDbError(message: string) {
  if (message.includes('INSUFFICIENT_BALANCE')) return 'D-Balance tidak cukup untuk membeli paket ini.';
  if (message.includes('INVALID_AMOUNT')) return 'Nominal transaksi tidak valid.';
  if (message.includes('PROFILE_NOT_FOUND')) return 'Profil wallet tidak ditemukan.';
  return message;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function createPublicOrderId() {
  const date = new Date();
  const stamp = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DLV-PANEL-${stamp}-${suffix}`;
}

function getIdempotencyKey(req: NextApiRequest, productId: string, requestedUsername: string) {
  const headerKey = Array.isArray(req.headers['x-idempotency-key']) ? req.headers['x-idempotency-key'][0] : req.headers['x-idempotency-key'];
  const explicitKey = cleanIdempotencyKey(headerKey || req.body?.idempotency_key || req.body?.client_order_key);
  if (explicitKey) return `client:${explicitKey}`;
  return `auto:${productId}:${requestedUsername}:${Math.floor(Date.now() / 30000)}`;
}

async function debitBalance(supabase: SupabaseService, userId: string, amount: number) {
  const result = await supabase.rpc('debit_d_balance_atomic', {
    target_user_id: userId,
    debit_amount: Math.floor(Number(amount || 0))
  });
  if (result.error) throw new Error(friendlyDbError(result.error.message));
  return Number(result.data || 0);
}

async function creditBalance(supabase: SupabaseService, userId: string, amount: number) {
  const result = await supabase.rpc('credit_d_balance_atomic', {
    target_user_id: userId,
    credit_amount: Math.floor(Number(amount || 0))
  });
  if (result.error) throw new Error(friendlyDbError(result.error.message));
  return Number(result.data || 0);
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
    // Audit logging must not break order flow.
  }
}

async function getOrders(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan.' });

  const supabase = createSupabaseServiceClient();
  const result = await supabase
    .from('panel_orders')
    .select('*, panel_products(name, slug, badge)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (result.error) return res.status(500).json({ error: result.error.message });
  return res.status(200).json({ orders: result.data || [] });
}

async function createOrder(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan untuk membeli panel.' });

  const productId = cleanText(req.body?.product_id, 80);
  const requestedUsername = cleanText(req.body?.requested_username, 40).toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const serverName = cleanText(req.body?.server_name, 60);
  const notes = cleanText(req.body?.notes, 200);

  if (!productId) return res.status(400).json({ error: 'Paket panel wajib dipilih.' });
  if (requestedUsername.length < 4) return res.status(400).json({ error: 'Username panel minimal 4 karakter.' });
  if (serverName.length < 3) return res.status(400).json({ error: 'Nama server minimal 3 karakter.' });

  const supabase = createSupabaseServiceClient();
  const idempotencyKey = getIdempotencyKey(req, productId, requestedUsername);

  const existingOrder = await supabase
    .from('panel_orders')
    .select('*')
    .eq('user_id', user.id)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existingOrder.error) return res.status(500).json({ error: existingOrder.error.message });
  if (existingOrder.data) return res.status(200).json({ duplicate: true, order: existingOrder.data, message: 'Order yang sama sudah pernah dibuat.' });

  const productResult = await supabase
    .from('panel_products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (productResult.error || !productResult.data) return res.status(404).json({ error: 'Paket panel tidak ditemukan atau sedang nonaktif.' });
  const product = productResult.data as PanelProduct;
  const amount = Math.floor(Number(product.price || 0));
  if (amount <= 0) return res.status(400).json({ error: 'Harga paket tidak valid.' });
  if (product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0) return res.status(409).json({ error: 'Stok paket sedang habis.' });

  const publicOrderId = createPublicOrderId();
  const now = new Date().toISOString();
  let nextBalance = 0;

  try {
    nextBalance = await debitBalance(supabase, user.id, amount);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'D-Balance gagal dipotong.';
    return res.status(400).json({ error: message });
  }

  const walletResult = await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'purchase',
    amount,
    status: 'success',
    provider: 'panel-manual',
    reference: publicOrderId,
    metadata: {
      source: 'panel-order',
      public_order_id: publicOrderId,
      product_id: product.id,
      product_slug: product.slug,
      product_name: product.name,
      requested_username: requestedUsername,
      server_name: serverName,
      deducted_balance: amount,
      balance_after: nextBalance,
      idempotency_key: idempotencyKey,
      created_at: now
    }
  }).select('*').single();

  if (walletResult.error) {
    await creditBalance(supabase, user.id, amount).catch(() => null);
    return res.status(500).json({ error: walletResult.error.message, message: 'Wallet transaction gagal dibuat. Saldo sudah dikembalikan.' });
  }

  const orderResult = await supabase.from('panel_orders').insert({
    user_id: user.id,
    product_id: product.id,
    public_order_id: publicOrderId,
    service_type: 'pterodactyl_panel',
    status: 'pending_fulfillment',
    product_snapshot: product,
    requested_username: requestedUsername,
    server_name: serverName,
    notes: notes || null,
    amount,
    wallet_transaction_id: walletResult.data.id,
    idempotency_key: idempotencyKey,
    raw_response: { mode: 'manual_fulfillment', created_at: now }
  }).select('*').single();

  if (orderResult.error) {
    await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...walletResult.data.metadata, panel_order_error: orderResult.error.message } }).eq('id', walletResult.data.id);
    await creditBalance(supabase, user.id, amount).catch(() => null);
    return res.status(409).json({ error: orderResult.error.message, message: 'Order panel gagal dibuat. Saldo sudah dikembalikan.' });
  }

  if (product.stock !== null && product.stock !== undefined) {
    await supabase.from('panel_products').update({ stock: Math.max(0, Number(product.stock) - 1), updated_at: new Date().toISOString() }).eq('id', product.id);
  }

  await recordEvent(supabase, {
    orderId: orderResult.data.id,
    userId: user.id,
    eventType: 'order_created',
    message: 'Order panel dibuat dan menunggu proses admin.',
    metadata: { public_order_id: publicOrderId, product_slug: product.slug, amount, balance_after: nextBalance }
  });

  await recordEvent(supabase, {
    orderId: orderResult.data.id,
    userId: user.id,
    eventType: 'balance_debited',
    message: 'D-Balance dipotong untuk pembelian panel.',
    metadata: { amount, balance_after: nextBalance, wallet_transaction_id: walletResult.data.id }
  });

  return res.status(201).json({
    order: orderResult.data,
    wallet: { d_balance: nextBalance },
    message: 'Order panel berhasil dibuat. Admin akan memproses dan mengirim detail panel ke dashboard kamu.'
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getOrders(req, res);
  if (req.method === 'POST') return createOrder(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
