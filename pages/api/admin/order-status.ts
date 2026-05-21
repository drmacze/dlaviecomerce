import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminFromAuthHeader } from '@/lib/auth-server';
import { writeAuditLog } from '@/lib/observability';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const allowedStatuses = ['pending', 'paid', 'fulfilled', 'cancelled'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdminFromAuthHeader(req.headers.authorization);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const orderId = String(req.body?.id || '').trim();
  const nextStatus = String(req.body?.status || '').trim();

  if (!orderId) return res.status(400).json({ error: 'Order id is required' });
  if (!allowedStatuses.includes(nextStatus)) return res.status(400).json({ error: 'Invalid order status' });

  const supabase = createSupabaseServiceClient();
  const { data: before, error: beforeError } = await supabase
    .from('orders')
    .select('id, status, buyer_email, total_amount')
    .eq('id', orderId)
    .maybeSingle();

  if (beforeError) return res.status(500).json({ error: beforeError.message });
  if (!before) return res.status(404).json({ error: 'Order not found' });

  const { data, error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId)
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await writeAuditLog({
    adminEmail: admin.email || undefined,
    action: 'order.status.update',
    targetType: 'order',
    targetId: orderId,
    metadata: {
      from: before.status,
      to: nextStatus,
      buyerEmail: before.buyer_email,
      totalAmount: before.total_amount,
    },
    req,
  });

  return res.status(200).json({ order: data });
}
