import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.email) return res.status(401).json({ error: 'Unauthorized' });
    const sessionId = String(req.query.sessionId || '');
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
    const supabase = createSupabaseServiceClient();
    const session = await supabase.from('ai_chat_sessions').select('*').eq('id', sessionId).eq('user_email', user.email.toLowerCase()).single();
    if (session.error || !session.data) return res.status(404).json({ error: 'Session not found' });
    const messages = await supabase.from('ai_chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    if (messages.error) return res.status(500).json({ error: messages.error.message });
    return res.status(200).json({ session: session.data, messages: messages.data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Load chat failed';
    return res.status(500).json({ error: message });
  }
}
