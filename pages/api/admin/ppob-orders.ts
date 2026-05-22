import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdminEmail(email?: string | null) {
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });

  const supabase = createSupabaseServiceClient();
  const orders = await supabase
    .from('ppob_orders')
    .select('id,ref_id,sku_code,product_name,customer_no,selling_price,status,provider_status,provider_message,serial_number,created_at,updated_at,settled_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (orders.error) return res.status(500).json({ error: orders.error.message });
  return res.status(200).json({ orders: orders.data || [] });
}
