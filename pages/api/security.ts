import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function getIp(req: NextApiRequest) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0]?.trim();
  return forwarded || String(req.headers['x-real-ip'] || '') || null;
}

function riskFromUserAgent(userAgent: string) {
  if (!userAgent) return 'medium';
  const lower = userAgent.toLowerCase();
  if (lower.includes('curl') || lower.includes('bot') || lower.includes('spider')) return 'medium';
  return 'low';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const profile = await supabase.from('profiles').select('id,email,last_seen_at').eq('id', user.id).maybeSingle();
    const events = await supabase.from('login_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (events.error) return res.status(500).json({ error: events.error.message });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_confirmed_at: user.email_confirmed_at || null,
        phone_confirmed_at: user.phone_confirmed_at || null,
        last_sign_in_at: user.last_sign_in_at || null
      },
      profile: profile.data || null,
      events: events.data || []
    });
  }

  if (req.method === 'POST') {
    const ip = getIp(req);
    const userAgent = String(req.headers['user-agent'] || '');
    const riskLevel = riskFromUserAgent(userAgent);
    const created = await supabase.from('login_events').insert({
      user_id: user.id,
      device: req.body?.device || 'web session',
      ip,
      user_agent: userAgent,
      risk_level: riskLevel
    }).select('*').single();
    if (created.error) return res.status(500).json({ error: created.error.message });
    await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);
    return res.status(200).json({ event: created.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
