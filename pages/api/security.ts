import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const profile = await supabase.from('profiles').select('id,email,security_score,last_seen_at').eq('id', user.id).single();
    if (profile.error) return res.status(500).json({ error: profile.error.message });
    const events = await supabase.from('login_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (events.error) return res.status(500).json({ error: events.error.message });
    return res.status(200).json({ profile: profile.data, events: events.data || [] });
  }

  if (req.method === 'POST') {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || null;
    const userAgent = String(req.headers['user-agent'] || '');
    const created = await supabase.from('login_events').insert({ user_id: user.id, device: req.body?.device || 'web', ip, user_agent: userAgent, risk_level: 'low' }).select('*').single();
    if (created.error) return res.status(500).json({ error: created.error.message });
    await supabase.from('profiles').update({ last_seen_at: new Date().toISOString(), security_score: 92 }).eq('id', user.id);
    return res.status(200).json({ event: created.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
