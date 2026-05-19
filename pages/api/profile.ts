import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const supabase = createSupabaseServiceClient();
    const existing = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (existing.data) return res.status(200).json({ profile: existing.data });
    const created = await supabase.from('profiles').insert({ id: user.id, email: user.email, display_name: user.user_metadata?.display_name || null }).select('*').single();
    if (created.error) return res.status(500).json({ error: created.error.message });
    return res.status(200).json({ profile: created.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Profile failed';
    return res.status(500).json({ error: message });
  }
}
