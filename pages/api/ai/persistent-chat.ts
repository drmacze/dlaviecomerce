import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { getDlavieAiPlanConfig, getDlavieAiSystemPrompt, normalizeDlavieAiPlan } from '@/lib/dlavie-ai-plans';
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
    const profile = user?.id
      ? await supabase.from('profiles').select('dlavie_ai_plan').eq('id', user.id).maybeSingle()
      : { data: null, error: null };

    if (profile.error) return res.status(500).json({ error: profile.error.message });

    const plan = normalizeDlavieAiPlan(profile.data?.dlavie_ai_plan);
    const planConfig = getDlavieAiPlanConfig(plan);

    if (message.length > planConfig.maxInputChars) {
      return res.status(413).json({ error: `Pesan terlalu panjang untuk ${planConfig.name}.` });
    }

    if (!sessionId) {
      const created = await supabase
        .from('ai_chat_sessions')
        .insert({ user_email: email, title: message.slice(0, 48) || 'Dlavie AI Chat', dlavie_ai_plan: plan })
        .select('id')
        .single();
      if (created.error || !created.data) return res.status(500).json({ error: created.error?.message || 'Session failed' });
      sessionId = created.data.id;
    }

    await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'user', content: message, dlavie_ai_plan: plan });
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({ model: planConfig.model, contents: `${getDlavieAiSystemPrompt(plan)}\n\nPertanyaan user:\n${message}` });
    const reply = result.text?.trim() || 'Maaf, Dlavie AI belum bisa menjawab itu sekarang.';
    await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply, dlavie_ai_plan: plan });
    return res.status(200).json({ sessionId, reply, plan, planName: planConfig.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI chat failed';
    return res.status(500).json({ error: message });
  }
}
