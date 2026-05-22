import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan.' });

  const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
  const supabase = createSupabaseServiceClient();

  const ordersResult = await supabase
    .from('ppob_orders')
    .select('id,public_order_id,ref_id,provider,sku_code,product_name,customer_no,provider_price,margin,selling_price,status,provider_status,provider_message,serial_number,wallet_transaction_id,refund_wallet_transaction_id,created_at,updated_at,sent_at,settled_at,refunded_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (ordersResult.error) return res.status(500).json({ error: ordersResult.error.message });
  return res.status(200).json({ orders: ordersResult.data || [] });
}
