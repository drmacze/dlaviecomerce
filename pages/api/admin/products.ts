import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { writeAuditLog } from '@/lib/observability';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function admin(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).includes(String(email || '').toLowerCase());
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function createPayload(body: Record<string, unknown>) {
  return {
    name: String(body.name || '').trim(),
    description: body.description ? String(body.description) : null,
    price: Number(body.price || 0),
    category: String(body.category || 'digital').trim() || 'digital',
    image_url: body.image_url ? String(body.image_url) : null,
    file_path: body.file_path ? String(body.file_path) : null,
    is_published: Boolean(body.is_published),
    release_date: body.release_date ? String(body.release_date) : null,
    stock: Number.isFinite(Number(body.stock)) ? Number(body.stock) : 99,
    badge: body.badge ? String(body.badge) : 'DLAVIE',
    mood_color: body.mood_color ? String(body.mood_color) : '#2467c9'
  };
}

function updatePayload(body: Record<string, unknown>) {
  const payload: Record<string, string | number | boolean | null> = {};
  if ('name' in body) payload.name = String(body.name || '').trim();
  if ('description' in body) payload.description = body.description ? String(body.description) : null;
  if ('price' in body) payload.price = Number(body.price || 0);
  if ('category' in body) payload.category = String(body.category || 'digital').trim() || 'digital';
  if ('image_url' in body) payload.image_url = body.image_url ? String(body.image_url) : null;
  if ('file_path' in body) payload.file_path = body.file_path ? String(body.file_path) : null;
  if ('is_published' in body) payload.is_published = Boolean(body.is_published);
  if ('release_date' in body) payload.release_date = body.release_date ? String(body.release_date) : null;
  if ('stock' in body) payload.stock = Number.isFinite(Number(body.stock)) ? Number(body.stock) : 99;
  if ('badge' in body) payload.badge = body.badge ? String(body.badge) : 'DLAVIE';
  if ('mood_color' in body) payload.mood_color = body.mood_color ? String(body.mood_color) : '#2467c9';
  if (typeof payload.name === 'string' && payload.name) payload.slug = slugify(payload.name);
  return payload;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user || !admin(user.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ products: data || [] });
  }

  if (req.method === 'POST') {
    const payload = createPayload((req.body || {}) as Record<string, unknown>);
    if (!payload.name) return res.status(400).json({ error: 'Product name is required' });
    const { data, error } = await supabase.from('products').insert({ ...payload, slug: slugify(payload.name) }).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditLog({ adminEmail: user.email || undefined, action: 'product.create', targetType: 'product', targetId: data.id, metadata: { name: data.name, price: data.price }, req });
    return res.status(200).json({ product: data });
  }

  if (req.method === 'PATCH') {
    const body = (req.body || {}) as Record<string, unknown>;
    const id = String(body.id || '');
    if (!id) return res.status(400).json({ error: 'Product id is required' });
    const payload = updatePayload(body);
    if (!Object.keys(payload).length) return res.status(400).json({ error: 'No valid fields to update' });
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditLog({ adminEmail: user.email || undefined, action: 'product.update', targetType: 'product', targetId: id, metadata: { fields: Object.keys(payload) }, req });
    return res.status(200).json({ product: data });
  }

  if (req.method === 'DELETE') {
    const id = String(req.query.id || (req.body as { id?: string } | undefined)?.id || '');
    if (!id) return res.status(400).json({ error: 'Product id is required' });
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditLog({ adminEmail: user.email || undefined, action: 'product.delete', targetType: 'product', targetId: id, req });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
