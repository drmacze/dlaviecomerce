import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { getGeminiClient } from '@/lib/gemini';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    const email = user?.email?.toLowerCase() || 'guest@lumina.local';
    const message = String(req.body?.message || '').trim();
    let sessionId = String(req.body?.sessionId || '').trim();
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const supabase = createSupabaseServiceClient();
    if (!sessionId) {
      const created = await supabase.from('ai_chat_sessions').insert({ user_email: email, title: message.slice(0, 48) || 'Lumina Chat' }).select('id').single();
      if (created.error || !created.data) return res.status(500).json({ error: created.error?.message || 'Session failed' });
      sessionId = created.data.id;
    }

    await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'user', content: message });
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `Kamu adalah AI support LUMINA, e-commerce produk digital. Jawab ramah, singkat, dan bantu user. Pertanyaan: ${message}` });
    const reply = result.text?.trim() || 'Maaf, aku belum bisa menjawab itu sekarang.';
    await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply });
    return res.status(200).json({ sessionId, reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI chat failed';
    return res.status(500).json({ error: message });
  }
}
