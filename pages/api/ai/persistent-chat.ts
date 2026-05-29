import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { estimateAiCharge } from '@/lib/dlavie-ai-credits';
import { getDlavieAiPlanConfig, getDlavieAiSystemPrompt, normalizeDlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { getGeminiClient } from '@/lib/gemini';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const todayKey = () => new Date().toISOString().slice(0, 10);
const SAFE_AI_PROVIDER_ERROR = 'Dlavie AI sedang tidak dapat memproses jawaban karena koneksi provider AI bermasalah. Admin perlu memperbarui konfigurasi AI provider.';

function looksLikeProviderFailure(value: string) {
  const text = String(value || '').toLowerCase().trim();
  const credentialPhrase = 'api' + ' key';
  return (
    text.includes(credentialPhrase) ||
    text.includes('permission_denied') ||
    text.includes('403') ||
    text.startsWith('{"error"') ||
    text.startsWith('{\n  "error"')
  );
}

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
      .select('dlavie_ai_plan, dlavie_ai_daily_quota, dlavie_ai_daily_used, dlavie_ai_usage_date, ai_token_balance')
      .eq('id', user.id)
      .maybeSingle();

    if (profile.error) return res.status(500).json({ error: 'Profil Dlavie belum bisa dimuat.' });
    if (!profile.data) return res.status(403).json({ error: 'Profil Dlavie belum tersedia. Login ulang atau buka dashboard terlebih dahulu.' });

    const plan = normalizeDlavieAiPlan(profile.data.dlavie_ai_plan);
    const planConfig = getDlavieAiPlanConfig(plan);
    const usageDate = String(profile.data.dlavie_ai_usage_date || todayKey()).slice(0, 10);
    const used = usageDate === todayKey() ? Number(profile.data.dlavie_ai_daily_used || 0) : 0;
    const quota = Number(profile.data.dlavie_ai_daily_quota || planConfig.dailyQuota);
    const remaining = Math.max(quota - used, 0);
    const currentAiTokens = Number(profile.data.ai_token_balance || 0);
    const estimatedMinimum = Math.ceil(message.length / 4) * (plan === 'core' ? 2 : 1);

    if (message.length > planConfig.maxInputChars) {
      return res.status(413).json({ error: `Pesan terlalu panjang untuk ${planConfig.name}.` });
    }

    if (remaining <= 0) {
      return res.status(429).json({ error: `Kuota harian ${planConfig.name} sudah habis.`, plan, remaining: 0 });
    }

    if (currentAiTokens < estimatedMinimum) {
      return res.status(402).json({ error: 'AI Token tidak cukup. Topup D Balance lalu beli AI Token terlebih dahulu.', plan, aiTokenBalance: currentAiTokens });
    }

    if (!sessionId) {
      const created = await supabase
        .from('ai_chat_sessions')
        .insert({ user_email: email, title: message.slice(0, 48) || 'Dlavie AI Chat', dlavie_ai_plan: plan })
        .select('id')
        .single();
      if (created.error || !created.data) return res.status(500).json({ error: 'Session Dlavie AI gagal dibuat.' });
      sessionId = created.data.id;
    }

    await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'user', content: message, dlavie_ai_plan: plan });

    let reply = '';
    try {
      const ai = getGeminiClient();
      const result = await ai.models.generateContent({ model: planConfig.model, contents: `${getDlavieAiSystemPrompt(plan)}\n\nPertanyaan user:\n${message}` });
      reply = result.text?.trim() || '';
    } catch {
      return res.status(502).json({ error: SAFE_AI_PROVIDER_ERROR, code: 'AI_PROVIDER_UNAVAILABLE', sessionId, plan, planName: planConfig.name });
    }

    if (!reply || looksLikeProviderFailure(reply)) {
      return res.status(502).json({ error: SAFE_AI_PROVIDER_ERROR, code: 'AI_PROVIDER_UNAVAILABLE', sessionId, plan, planName: planConfig.name });
    }

    const charge = estimateAiCharge({ message, reply, plan });
    const chargedTokens = Math.min(charge.charged, currentAiTokens);
    const nextAiTokens = Math.max(currentAiTokens - chargedTokens, 0);

    await supabase.from('ai_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: reply, dlavie_ai_plan: plan });

    await supabase
      .from('profiles')
      .update({ ai_token_balance: nextAiTokens, dlavie_ai_daily_used: used + 1, dlavie_ai_usage_date: todayKey(), last_seen_at: new Date().toISOString() })
      .eq('id', user.id);

    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'ai_token_usage',
      amount: -chargedTokens,
      status: 'success',
      provider: 'dlavie-ai',
      reference: `ai-use-${sessionId}-${Date.now()}`,
      metadata: {
        sessionId,
        plan,
        model: planConfig.model,
        inputUnits: charge.inputUnits,
        outputUnits: charge.outputUnits,
        multiplier: charge.multiplier,
        aiTokenBefore: currentAiTokens,
        aiTokenAfter: nextAiTokens,
      },
    });

    return res.status(200).json({ sessionId, reply, plan, planName: planConfig.name, remaining: Math.max(remaining - 1, 0), aiTokenBalance: nextAiTokens, chargedTokens });
  } catch {
    return res.status(500).json({ error: 'Dlavie AI sedang bermasalah. Coba lagi sebentar.', code: 'DLAVIE_AI_FAILED' });
  }
}
