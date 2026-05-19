import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('ai_chat_sessions').select('*').eq('user_email', user.email.toLowerCase()).order('created_at', { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ sessions: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Load sessions failed';
    return res.status(500).json({ error: message });
  }
}
