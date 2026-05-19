import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { orderId, productId } = req.body || {};
    if (!orderId || !productId) return res.status(400).json({ error: 'orderId and productId are required' });
    const supabase = createSupabaseServiceClient();
    const { data: order } = await supabase.from('orders').select('status').eq('id', orderId).single();
    if (order?.status !== 'fulfilled') return res.status(403).json({ error: 'Order is not fulfilled yet' });
    const { data: product, error } = await supabase.from('products').select('file_path').eq('id', productId).single();
    if (error || !product?.file_path) return res.status(404).json({ error: 'File not found' });
    const signed = await supabase.storage.from('digital-products').createSignedUrl(product.file_path, 60 * 10);
    if (signed.error) return res.status(500).json({ error: signed.error.message });
    return res.status(200).json({ url: signed.data.signedUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download failed';
    return res.status(500).json({ error: message });
  }
}
