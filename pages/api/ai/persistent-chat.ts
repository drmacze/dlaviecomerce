import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { getDlavieAiPlanConfig, getDlavieAiSystemPrompt, normalizeDlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { getGeminiClient } from '@/lib/gemini';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const todayKey = () => new Date().toISOString().slice(0, 10);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.id || !user.email) return res.status(401).json({ error: 'Login diperlukan untuk menggunakan Dlavie AI.' });

    const email = user.email.toLowerCase();
    const message = String(req.body?.message || '').trim();
    let sessionId = String(req.body?.sessionId || '').trim();
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const supabase = createSupabaseServiceClient();
    const profile = await supabase
      .from('profiles')
      .select('dlavie_ai_plan, dlavie_ai_daily_quota, dlavie_ai_daily_used, dlavie_ai_usage_date')
      .eq('id', user.id)
      .maybeSingle();

    if (profile.error) return res.status(500).json({ error: profile.error.message });

    const plan = normalizeDlavieAiPlan(profile.data?.dlavie_ai_plan);
    const planConfig = getDlavieAiPlanConfig(plan);
    const usageDate = String(profile.data?.dlavie_ai_usage_date || todayKey()).slice(0, 10);
    const used = usageDate === todayKey() ? Number(profile.data?.dlavie_ai_daily_used || 0) : 0;
    const quota = Number(profile.data?.dlavie_ai_daily_quota || planConfig.dailyQuota);
    const remaining = Math.max(quota - used, 0);

    if (message.length > planConfig.maxInputChars) {
      return res.status(413).json({ error: `Pesan terlalu panjang untuk ${planConfig.name}.` });
    }

    if (remaining <= 0) {
      return res.status(429).json({ error: `Kuota harian ${planConfig.name} sudah habis.`, plan, remaining: 0 });
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

    await supabase
      .from('profiles')
      .update({ dlavie_ai_daily_used: used + 1, dlavie_ai_usage_date: todayKey(), last_seen_at: new Date().toISOString() })
      .eq('id', user.id);

    return res.status(200).json({ sessionId, reply, plan, planName: planConfig.name, remaining: Math.max(remaining - 1, 0) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI chat failed';
    return res.status(500).json({ error: message });
  }
}
