import { Router } from 'express';
import { bearerToken, verifySupabaseUser } from '../lib/auth-server.js';
import { createSupabaseServiceClient } from '../lib/supabase-server.js';
import { fetchVipaymentProfile, requestVipaymentPrepaidOrder } from '../lib/vipayment.js';
import { shouldUseVipayment, syncVipaymentProducts } from '../lib/vipayment-sync.js';
import { hasDigiflazzEnv, syncDigiflazzPrepaidProducts } from '../lib/ppob-sync.js';
import { isProviderAddressBlocked, providerAddressBlockedPayload } from '../lib/provider-errors.js';

const router = Router();

type SupabaseService = ReturnType<typeof createSupabaseServiceClient>;

function selectedProvider() {
  return String(process.env.PPOB_PROVIDER || '').toLowerCase();
}

function autoOrderEnabled() {
  return process.env.PPOB_AUTO_ORDER_ENABLED === 'true';
}

function providerBalanceCheckEnabled() {
  return process.env.PPOB_PROVIDER_BALANCE_CHECK_ENABLED !== 'false';
}

function minimumProviderBalance() {
  const value = Number(process.env.PPOB_PROVIDER_MIN_BALANCE || 25000);
  return Number.isFinite(value) && value > 0 ? value : 25000;
}

function numeric(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function friendlyDbError(message: string) {
  if (message.includes('INSUFFICIENT_BALANCE')) return 'D-Balance tidak cukup untuk order ini.';
  if (message.includes('INVALID_AMOUNT')) return 'Nominal transaksi tidak valid.';
  if (message.includes('PROFILE_NOT_FOUND')) return 'Profil wallet tidak ditemukan.';
  if (message.includes('ORDER_NOT_FOUND')) return 'Order PPOB tidak ditemukan.';
  return message;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function createPublicOrderId() {
  const date = new Date();
  const stamp = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DLV-PPOB-${stamp}-${suffix}`;
}

function cleanIdempotencyKey(value: unknown) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9._:-]/g, '').slice(0, 120);
}

function cleanTarget(value: unknown) {
  return String(value || '').trim().replace(/\s+/g, '').slice(0, 80);
}

function normalizeStatus(value?: string) {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'success' || status === 'sukses') return 'success';
  if (status === 'error' || status === 'failed' || status === 'gagal') return 'failed';
  return 'pending';
}

async function recordEvent(supabase: SupabaseService, input: { orderId?: string | null; userId?: string | null; eventType: string; message?: string; metadata?: Record<string, unknown> }) {
  try {
    await supabase.from('ppob_order_events').insert({
      order_id: input.orderId || null,
      user_id: input.userId || null,
      event_type: input.eventType,
      message: input.message || null,
      metadata: input.metadata || {}
    });
  } catch {}
}

async function debitBalance(supabase: SupabaseService, userId: string, amount: number) {
  const result = await supabase.rpc('debit_d_balance_atomic', { target_user_id: userId, debit_amount: Math.floor(Number(amount || 0)) });
  if (result.error) throw new Error(friendlyDbError(result.error.message));
  return Number(result.data || 0);
}

async function creditBalance(supabase: SupabaseService, userId: string, amount: number) {
  const result = await supabase.rpc('credit_d_balance_atomic', { target_user_id: userId, credit_amount: Math.floor(Number(amount || 0)) });
  if (result.error) throw new Error(friendlyDbError(result.error.message));
  return Number(result.data || 0);
}

async function refundOrder(supabase: SupabaseService, input: { orderId: string; reference: string; reason: string; metadata?: Record<string, unknown> }) {
  const result = await supabase.rpc('refund_ppob_order_atomic', {
    target_order_id: input.orderId,
    refund_reference: input.reference,
    refund_reason: input.reason,
    refund_metadata: input.metadata || {}
  });
  if (result.error) throw new Error(friendlyDbError(result.error.message));
  return result.data;
}

async function listProducts(provider?: string) {
  const supabase = createSupabaseServiceClient();
  let query = supabase
    .from('ppob_products')
    .select('id,sku_code,product_name,category,brand,selling_price')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('brand', { ascending: true })
    .order('selling_price', { ascending: true })
    .limit(100);
  if (provider) query = query.eq('provider', provider);
  return query;
}

async function syncConfiguredProvider() {
  if (shouldUseVipayment()) return syncVipaymentProducts();
  if (hasDigiflazzEnv()) return syncDigiflazzPrepaidProducts();
  return null;
}

async function preferredProducts() {
  const provider = selectedProvider();
  if (provider === 'vipayment') return listProducts('vipayment');
  if (provider === 'digiflazz') return listProducts('digiflazz');
  return listProducts();
}

router.get('/ppob-products', async (_req, res) => {
  let result = await preferredProducts();
  if (result.error) return res.status(500).json({ error: result.error.message });

  let sync = null;
  let warning = null;

  if (!result.data || result.data.length === 0) {
    try {
      sync = await syncConfiguredProvider();
      result = await preferredProducts();
    } catch (error) {
      warning = error instanceof Error ? error.message : 'PPOB sync failed';
    }
  }

  if (!result.data || result.data.length === 0) {
    result = await listProducts('manual');
    if (!warning) warning = 'Manual fallback catalog is active.';
  }

  if (result.error) return res.status(500).json({ error: result.error.message });
  return res.status(200).json({ products: result.data || [], sync, warning });
});

router.post('/ppob-order', async (req, res) => {
  if (!autoOrderEnabled()) return res.status(403).json({ error: 'Order otomatis PPOB masih dikunci. Aktifkan PPOB_AUTO_ORDER_ENABLED=true setelah siap testing saldo kecil.' });
  if (!shouldUseVipayment()) return res.status(503).json({ error: 'Provider VIPayment belum aktif atau env belum lengkap.' });

  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan untuk order PPOB.' });

  const productId = String(req.body?.product_id || '').trim();
  const customerNo = cleanTarget(req.body?.customer_no);
  if (!productId) return res.status(400).json({ error: 'Produk wajib dipilih.' });
  if (customerNo.length < 4) return res.status(400).json({ error: 'Nomor tujuan/User ID wajib diisi dengan benar.' });

  const supabase = createSupabaseServiceClient();
  const headerKey = Array.isArray(req.headers['x-idempotency-key']) ? req.headers['x-idempotency-key'][0] : req.headers['x-idempotency-key'];
  const explicitKey = cleanIdempotencyKey(headerKey || req.body?.idempotency_key || req.body?.client_order_key);
  const idempotencyKey = explicitKey ? `client:${explicitKey}` : `auto:${productId}:${customerNo}:${Math.floor(Date.now() / 30000)}`;

  const existingOrder = await supabase.from('ppob_orders').select('*').eq('user_id', user.id).eq('idempotency_key', idempotencyKey).maybeSingle();
  if (existingOrder.error) return res.status(500).json({ error: existingOrder.error.message });
  if (existingOrder.data) return res.status(200).json({ duplicate: true, order: existingOrder.data, message: 'Order yang sama sudah pernah dibuat. Sistem mencegah order ganda.' });

  type ProductRow = { id: string; sku_code: string; product_name: string; provider_price: number; margin: number; selling_price: number };
  const productResult = await supabase.from('ppob_products').select('id,sku_code,product_name,provider_price,margin,selling_price').eq('id', productId).eq('provider', 'vipayment').eq('is_active', true).single();
  if (productResult.error || !productResult.data) return res.status(404).json({ error: 'Produk VIPayment tidak ditemukan atau belum aktif.' });
  const product = productResult.data as ProductRow;
  const sellingPrice = Math.floor(Number(product.selling_price || 0));
  if (sellingPrice <= 0) return res.status(400).json({ error: 'Harga produk tidak valid.' });

  if (providerBalanceCheckEnabled()) {
    try {
      const providerProfile = await fetchVipaymentProfile();
      const providerBalance = numeric(providerProfile.balance);
      const minimumRequired = Math.max(minimumProviderBalance(), sellingPrice);
      if (providerBalance < minimumRequired) {
        return res.status(503).json({
          code: 'PROVIDER_LOW_BALANCE',
          error: 'Saldo provider VIPayment sedang tidak mencukupi. Silakan coba lagi nanti.',
          provider: { balance: providerBalance, minimum_required: minimumRequired, product_price: sellingPrice }
        });
      }
    } catch (error) {
      const message = errorMessage(error, 'Gagal cek saldo provider VIPayment.');
      if (isProviderAddressBlocked(message)) return res.status(503).json(providerAddressBlockedPayload(message));
      return res.status(503).json({ code: 'PROVIDER_BALANCE_CHECK_FAILED', error: `Cek saldo provider gagal: ${message}` });
    }
  }

  const publicOrderId = createPublicOrderId();
  const localRef = `DLV-VIP-${Date.now()}-${user.id.slice(0, 6)}`;
  const rawRequest = { product_id: product.id, sku_code: product.sku_code, product_name: product.product_name, customer_no: customerNo, idempotency_key: idempotencyKey, public_order_id: publicOrderId, created_at: new Date().toISOString() };
  let nextBalance = 0;

  try {
    nextBalance = await debitBalance(supabase, user.id, sellingPrice);
  } catch (error) {
    return res.status(400).json({ error: errorMessage(error, 'Debit D-Balance gagal.') });
  }

  const walletResult = await supabase.from('wallet_transactions').insert({
    user_id: user.id, type: 'purchase', amount: sellingPrice, status: 'success', provider: 'vipayment', reference: publicOrderId,
    metadata: { source: 'ppob-vipayment', public_order_id: publicOrderId, local_ref: localRef, product_id: product.id, sku_code: product.sku_code, product_name: product.product_name, customer_no: customerNo, deducted_balance: sellingPrice, balance_after: nextBalance, idempotency_key: idempotencyKey, created_at: new Date().toISOString() }
  }).select('*').single();

  if (walletResult.error) {
    await creditBalance(supabase, user.id, sellingPrice).catch(() => null);
    return res.status(500).json({ error: walletResult.error.message });
  }

  const localOrder = await supabase.from('ppob_orders').insert({
    user_id: user.id, product_id: product.id, public_order_id: publicOrderId, idempotency_key: idempotencyKey, ref_id: localRef, provider: 'vipayment',
    sku_code: product.sku_code, product_name: product.product_name, customer_no: customerNo, provider_price: Math.floor(Number(product.provider_price || 0)),
    margin: Math.floor(Number(product.margin || 0)), selling_price: sellingPrice, status: 'pending', provider_status: 'local_pending',
    provider_message: 'Waiting for provider request.', wallet_transaction_id: walletResult.data.id, raw_request: rawRequest,
    raw_response: { local_ref: localRef, created_before_provider: true }
  }).select('*').single();

  if (localOrder.error) {
    await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...walletResult.data.metadata, local_order_error: localOrder.error.message } }).eq('id', walletResult.data.id);
    await creditBalance(supabase, user.id, sellingPrice).catch(() => null);
    return res.status(409).json({ error: localOrder.error.message, message: 'Order lokal gagal dibuat. Saldo sudah dikembalikan.' });
  }

  await recordEvent(supabase, { orderId: localOrder.data.id, userId: user.id, eventType: 'order_created', message: 'Order PPOB lokal dibuat.', metadata: { public_order_id: publicOrderId, local_ref: localRef } });
  await recordEvent(supabase, { orderId: localOrder.data.id, userId: user.id, eventType: 'balance_debited', message: 'D-Balance dipotong untuk transaksi PPOB.', metadata: { amount: sellingPrice, balance_after: nextBalance, wallet_transaction_id: walletResult.data.id } });

  try {
    const sentAt = new Date().toISOString();
    await supabase.from('ppob_orders').update({ sent_at: sentAt, updated_at: sentAt }).eq('id', localOrder.data.id);
    await recordEvent(supabase, { orderId: localOrder.data.id, userId: user.id, eventType: 'provider_request_sent', message: 'Order dikirim ke VIPayment.', metadata: { service: product.sku_code, customer_no: customerNo, sent_at: sentAt } });

    const providerOrder = await requestVipaymentPrepaidOrder({ service: product.sku_code, dataNo: customerNo });
    const status = normalizeStatus(providerOrder.status);
    const providerRef = providerOrder.trxid || localRef;
    const now = new Date().toISOString();

    const update = await supabase.from('ppob_orders').update({
      ref_id: providerRef, status, provider_status: providerOrder.status || null, provider_message: providerOrder.note || null,
      raw_response: providerOrder, settled_at: status === 'success' || status === 'failed' ? now : null, updated_at: now
    }).eq('id', localOrder.data.id).select('*').single();

    if (update.error) {
      await recordEvent(supabase, { orderId: localOrder.data.id, userId: user.id, eventType: 'local_update_failed', message: update.error.message, metadata: { provider_response: providerOrder } });
      return res.status(202).json({ warning: 'Order sudah dikirim ke VIPayment, tetapi update database gagal.', public_order_id: publicOrderId, local_ref: localRef, provider: providerOrder, error: update.error.message });
    }

    await recordEvent(supabase, { orderId: update.data.id, userId: user.id, eventType: `provider_${status}`, message: providerOrder.note || `VIPayment status: ${status}`, metadata: { provider_ref: providerRef, provider_response: providerOrder } });
    await supabase.from('wallet_transactions').update({ reference: publicOrderId, metadata: { ...walletResult.data.metadata, provider_ref: providerRef, provider_response: providerOrder, ppob_order_id: update.data.id } }).eq('id', walletResult.data.id);

    let refund = null;
    if (status === 'failed') {
      refund = await refundOrder(supabase, { orderId: update.data.id, reference: publicOrderId, reason: providerOrder.note || 'VIPayment order failed', metadata: { provider_response: providerOrder, provider_ref: providerRef } });
      await supabase.from('wallet_transactions').update({ status: 'failed' }).eq('id', walletResult.data.id);
      await supabase.from('ppob_orders').update({ refunded_at: new Date().toISOString() }).eq('id', update.data.id);
      await recordEvent(supabase, { orderId: update.data.id, userId: user.id, eventType: 'refund_completed', message: 'Saldo dikembalikan karena provider gagal.', metadata: { refund } });
    }

    return res.status(200).json({ order: update.data, provider: providerOrder, wallet: { d_balance: nextBalance }, refund });
  } catch (error) {
    const message = errorMessage(error, 'Order VIPayment gagal.');
    const failedAt = new Date().toISOString();
    await supabase.from('ppob_orders').update({ status: 'failed', provider_status: isProviderAddressBlocked(message) ? 'provider_address_blocked' : 'request_failed', provider_message: message, updated_at: failedAt, settled_at: failedAt }).eq('id', localOrder.data.id);
    await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...walletResult.data.metadata, provider_error: message, ppob_order_id: localOrder.data.id } }).eq('id', walletResult.data.id);
    const refund = await refundOrder(supabase, { orderId: localOrder.data.id, reference: publicOrderId, reason: message, metadata: { product_id: product.id, sku_code: product.sku_code } });
    await supabase.from('ppob_orders').update({ refunded_at: new Date().toISOString() }).eq('id', localOrder.data.id);
    await recordEvent(supabase, { orderId: localOrder.data.id, userId: user.id, eventType: isProviderAddressBlocked(message) ? 'provider_address_blocked' : 'provider_request_failed', message, metadata: { refund } });

    if (isProviderAddressBlocked(message)) {
      return res.status(503).json({ ...providerAddressBlockedPayload(message), refund, order: { id: localOrder.data.id, public_order_id: publicOrderId } });
    }
    return res.status(502).json({ error: message, refund, order: { id: localOrder.data.id, public_order_id: publicOrderId } });
  }
});

export default router;
