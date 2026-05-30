import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });
    const { receiverEmail, amount } = req.body || {};
    const receiverMail = String(receiverEmail || '').trim().toLowerCase();
    const points = Math.floor(Number(amount || 0));
    if (!receiverMail || points <= 0) return res.status(400).json({ error: 'Receiver email and positive amount are required' });
    if (receiverMail === user.email.toLowerCase()) return res.status(400).json({ error: 'Tidak bisa gift ke akun sendiri.' });

    const supabase = createSupabaseServiceClient();
    const sender = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (sender.error || !sender.data) return res.status(404).json({ error: 'Sender profile not found' });
    if (Number(sender.data.l_points || 0) < points) return res.status(400).json({ error: 'L-Points tidak cukup.' });

    const receiver = await supabase.from('profiles').select('*').eq('email', receiverMail).single();
    if (receiver.error || !receiver.data) return res.status(404).json({ error: 'Receiver not found' });

    await supabase.from('l_point_ledger').insert([{ user_id: user.id, amount: -points, reason: 'gift_sent' }, { user_id: receiver.data.id, amount: points, reason: 'gift_received' }]);
    await supabase.rpc('increment_l_points', { target_user_id: user.id, points_delta: -points });
    await supabase.rpc('increment_l_points', { target_user_id: receiver.data.id, points_delta: points });
    return res.status(200).json({ success: true, points, receiver: receiver.data.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gift failed';
    return res.status(500).json({ error: message });
  }
}
