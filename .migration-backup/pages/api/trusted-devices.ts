import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function makeFingerprint(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  return `web-${Math.abs(hash)}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const devices = await supabase.from('trusted_devices').select('*').eq('user_id', user.id).is('revoked_at', null).order('last_seen_at', { ascending: false });
    if (devices.error) return res.status(500).json({ error: devices.error.message });
    return res.status(200).json({ devices: devices.data || [] });
  }

  if (req.method === 'POST') {
    const ua = String(req.headers['user-agent'] || 'unknown');
    const fingerprint = makeFingerprint(String(req.body?.fingerprint || ua));
    const saved = await supabase.from('trusted_devices').upsert({
      user_id: user.id,
      fingerprint,
      label: req.body?.label || 'Current browser',
      user_agent: ua,
      last_seen_at: new Date().toISOString(),
      revoked_at: null
    }, { onConflict: 'user_id,fingerprint' }).select('*').single();
    if (saved.error) return res.status(500).json({ error: saved.error.message });
    return res.status(200).json({ device: saved.data });
  }

  if (req.method === 'DELETE') {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ error: 'Missing device id' });
    const revoked = await supabase.from('trusted_devices').update({ revoked_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
    if (revoked.error) return res.status(500).json({ error: revoked.error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
