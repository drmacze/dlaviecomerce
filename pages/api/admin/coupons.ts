import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { writeAuditLog } from '@/lib/observability';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function admin(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).includes(String(email || '').toLowerCase());
}

function couponPayload(body: Record<string, unknown>) {
  return {
    code: String(body.code || '').trim().toUpperCase(),
    discount_type: String(body.discount_type || 'percent'),
    amount: Number(body.amount || 0),
    min_amount: Number(body.min_amount || 0),
    usage_limit: body.usage_limit === '' || body.usage_limit === undefined ? null : Number(body.usage_limit),
    expires_at: body.expires_at || null,
  };
}

function couponPatch(body: Record<string, unknown>) {
  const payload: Record<string, string | number | boolean | null> = {};
  if ('code' in body) payload.code = String(body.code || '').trim().toUpperCase();
  if ('discount_type' in body) payload.discount_type = String(body.discount_type || 'percent');
  if ('amount' in body) payload.amount = Number(body.amount || 0);
  if ('min_amount' in body) payload.min_amount = Number(body.min_amount || 0);
  if ('usage_limit' in body) payload.usage_limit = body.usage_limit === '' || body.usage_limit === undefined ? null : Number(body.usage_limit);
  if ('expires_at' in body) payload.expires_at = body.expires_at ? String(body.expires_at) : null;
  if ('is_active' in body) payload.is_active = Boolean(body.is_active);
  return payload;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !admin(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ coupons: data || [] });
  }

  if (req.method === 'POST') {
    const payload = couponPayload((req.body || {}) as Record<string, unknown>);
    if (!payload.code) return res.status(400).json({ error: 'Coupon code is required' });
    if (!['percent', 'fixed'].includes(payload.discount_type)) return res.status(400).json({ error: 'Invalid discount type' });
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) return res.status(400).json({ error: 'Amount must be greater than zero' });

    const { data, error } = await supabase.from('coupons').insert({
      ...payload,
      redeemed_count: 0,
      is_active: true,
    }).select('*').single();

    if (error) return res.status(500).json({ error: error.message });
    await writeAuditLog({ adminEmail: user.email || undefined, action: 'coupon.create', targetType: 'coupon', targetId: data.id, metadata: { code: data.code, discountType: data.discount_type, amount: data.amount }, req });
    return res.status(200).json({ coupon: data });
  }

  if (req.method === 'PATCH') {
    const body = (req.body || {}) as Record<string, unknown>;
    const id = String(body.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Coupon id is required' });
    const payload = couponPatch(body);
    if (!Object.keys(payload).length) return res.status(400).json({ error: 'No valid fields to update' });

    const { data, error } = await supabase.from('coupons').update(payload).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditLog({ adminEmail: user.email || undefined, action: 'coupon.update', targetType: 'coupon', targetId: id, metadata: { fields: Object.keys(payload), code: data.code }, req });
    return res.status(200).json({ coupon: data });
  }

  if (req.method === 'DELETE') {
    const id = String(req.query.id || (req.body as { id?: string } | undefined)?.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Coupon id is required' });

    const { data, error } = await supabase.from('coupons').update({ is_active: false }).eq('id', id).select('id, code').single();
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditLog({ adminEmail: user.email || undefined, action: 'coupon.disable', targetType: 'coupon', targetId: id, metadata: { code: data.code }, req });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
