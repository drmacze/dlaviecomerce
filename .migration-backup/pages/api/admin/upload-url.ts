import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdmin(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase()).includes(String(email || '').toLowerCase());
}

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '') || 'upload.bin';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user || !isAdmin(user.email)) return res.status(403).json({ error: 'Forbidden' });
    const bucket = String(req.body?.bucket || 'digital-products');
    const fileName = safeName(String(req.body?.fileName || 'upload.bin'));
    if (!['digital-products', 'product-images'].includes(bucket)) return res.status(400).json({ error: 'Invalid bucket' });
    const path = `${Date.now()}-${fileName}`;
    const supabase = createSupabaseServiceClient();
    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (signed.error) return res.status(500).json({ error: signed.error.message });
    const publicUrl = bucket === 'product-images' ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
    return res.status(200).json({ bucket, path, token: signed.data.token, publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload sign failed';
    return res.status(500).json({ error: message });
  }
}
