import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Code is required' });
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('coupons').select('id, redeemed_count').eq('code', code).single();
    if (error || !data) return res.status(404).json({ error: 'Coupon not found' });
    const updated = await supabase.from('coupons').update({ redeemed_count: Number(data.redeemed_count || 0) + 1 }).eq('id', data.id);
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Coupon tracking failed';
    return res.status(500).json({ error: message });
  }
}
