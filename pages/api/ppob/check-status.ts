import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { fetchVipaymentPrepaidStatus } from '@/lib/vipayment';
import { shouldUseVipayment } from '@/lib/vipayment-sync';

function normalizeStatus(value?: string) {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'success' || status === 'sukses') return 'success';
  if (status === 'error' || status === 'failed' || status === 'gagal') return 'failed';
  return 'pending';
}

function pickStatusPayload(data: unknown) {
  if (Array.isArray(data)) return data[0] || null;
  return data && typeof data === 'object' ? data as Record<string, unknown> : null;
}

async function refundOrder(supabase: ReturnType<typeof createSupabaseServiceClient>, input: { orderId: string; reference: string; reason: string; metadata?: Record<string, unknown> }) {
  const result = await supabase.rpc('refund_ppob_order_atomic', {
    target_order_id: input.orderId,
    refund_reference: input.reference,
    refund_reason: input.reason,
    refund_metadata: input.metadata || {}
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

async function recordEvent(supabase: ReturnType<typeof createSupabaseServiceClient>, input: { orderId: string; userId: string; eventType: string; message?: string; metadata?: Record<string, unknown> }) {
  await supabase.from('ppob_order_events').insert({
    order_id: input.orderId,
    user_id: input.userId,
    event_type: input.eventType,
    message: input.message || null,
    metadata: input.metadata || {}
  }).throwOnError();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!shouldUseVipayment()) return res.status(503).json({ error: 'Provider VIPayment belum aktif atau env belum lengkap.' });

  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan.' });

  const publicOrderId = String(req.body?.public_order_id || '').trim();
  const orderId = String(req.body?.order_id || '').trim();
  const refId = String(req.body?.ref_id || '').trim();
  if (!publicOrderId && !orderId && !refId) return res.status(400).json({ error: 'public_order_id/order_id/ref_id wajib diisi.' });

  const supabase = createSupabaseServiceClient();
  let query = supabase.from('ppob_orders').select('*').eq('user_id', user.id).eq('provider', 'vipayment');
  if (publicOrderId) query = query.eq('public_order_id', publicOrderId);
  else if (orderId) query = query.eq('id', orderId);
  else query = query.eq('ref_id', refId);

  const orderResult = await query.maybeSingle();
  if (orderResult.error) return res.status(500).json({ error: orderResult.error.message });
  if (!orderResult.data) return res.status(404).json({ error: 'Order PPOB tidak ditemukan.' });

  const order = orderResult.data as {
    id: string;
    user_id: string;
    ref_id: string;
    public_order_id?: string | null;
    status: string;
    refund_wallet_transaction_id?: string | null;
    raw_callback?: Record<string, unknown> | null;
  };

  if (order.ref_id.startsWith('DLV-VIP-')) {
    return res.status(409).json({ error: 'Order belum punya trxid provider. Coba cek lagi beberapa saat.' });
  }

  const providerStatusRaw = await fetchVipaymentPrepaidStatus({ trxid: order.ref_id });
  const providerStatus = pickStatusPayload(providerStatusRaw);
  if (!providerStatus) return res.status(502).json({ error: 'Response status VIPayment kosong.', provider: providerStatusRaw });

  const status = normalizeStatus(String(providerStatus.status || ''));
  const now = new Date().toISOString();

  const update = await supabase.from('ppob_orders').update({
    status,
    provider_status: String(providerStatus.status || ''),
    provider_message: String(providerStatus.note || ''),
    serial_number: String(providerStatus.sn || providerStatus.serial_number || ''),
    raw_callback: {
      ...(order.raw_callback || {}),
      status_check: providerStatus,
      last_source: 'manual-status-check',
      updated_at: now
    },
    updated_at: now,
    settled_at: status === 'success' || status === 'failed' ? now : null
  }).eq('id', order.id).select('*').single();

  if (update.error) return res.status(500).json({ error: update.error.message });

  await recordEvent(supabase, {
    orderId: order.id,
    userId: user.id,
    eventType: `status_check_${status}`,
    message: String(providerStatus.note || `Status provider: ${status}`),
    metadata: { provider_status: providerStatus }
  }).catch(() => null);

  let refund = null;
  if (status === 'failed') {
    refund = await refundOrder(supabase, {
      orderId: order.id,
      reference: order.public_order_id || order.ref_id,
      reason: String(providerStatus.note || 'VIPayment transaction failed from status check'),
      metadata: { provider_status: providerStatus, source: 'manual-status-check' }
    });

    await supabase.from('ppob_orders').update({ refunded_at: new Date().toISOString() }).eq('id', order.id);
    await recordEvent(supabase, {
      orderId: order.id,
      userId: user.id,
      eventType: 'refund_completed',
      message: 'Saldo dikembalikan dari status checker.',
      metadata: { refund }
    }).catch(() => null);
  }

  return res.status(200).json({ order: update.data, provider: providerStatus, refund });
}
