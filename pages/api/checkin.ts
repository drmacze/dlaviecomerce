import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const supabase = createSupabaseServiceClient();
    const today = new Date().toISOString().slice(0, 10);
    const existing = await supabase.from('daily_checkins').select('id').eq('user_id', userId).eq('checkin_date', today).maybeSingle();
    if (existing.data) return res.status(409).json({ error: 'Sudah check-in hari ini.' });
    const points = 25;
    const inserted = await supabase.from('daily_checkins').insert({ user_id: userId, checkin_date: today, points_awarded: points });
    if (inserted.error) return res.status(500).json({ error: inserted.error.message });
    const ledger = await supabase.from('l_point_ledger').insert({ user_id: userId, amount: points, reason: 'daily_checkin' });
    if (ledger.error) return res.status(500).json({ error: ledger.error.message });
    await supabase.rpc('increment_l_points', { target_user_id: userId, points_delta: points });
    return res.status(200).json({ success: true, points });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Check-in failed';
    return res.status(500).json({ error: message });
  }
}
