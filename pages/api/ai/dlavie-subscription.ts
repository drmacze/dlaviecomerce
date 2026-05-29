import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { dlavieAiPlans, getDlavieAiPlanConfig, normalizeDlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const todayKey = () => new Date().toISOString().slice(0, 10);

type DlavieProfileAccess = {
  dlavie_ai_plan?: string | null;
  dlavie_ai_daily_quota?: number | null;
  dlavie_ai_daily_used?: number | null;
  dlavie_ai_usage_date?: string | null;
};

function buildAccess(profile?: DlavieProfileAccess | null, authenticated = false) {
  const plan = normalizeDlavieAiPlan(profile?.dlavie_ai_plan);
  const config = getDlavieAiPlanConfig(plan);
  const usageDate = String(profile?.dlavie_ai_usage_date || todayKey()).slice(0, 10);
  const dailyUsed = usageDate === todayKey() ? Number(profile?.dlavie_ai_daily_used || 0) : 0;
  const dailyQuota = Number(profile?.dlavie_ai_daily_quota || config.dailyQuota);

  return {
    authenticated,
    plan,
    name: config.name,
    dailyQuota,
    dailyUsed,
    remaining: Math.max(dailyQuota - dailyUsed, 0),
    usageDate: todayKey(),
    plans: dlavieAiPlans,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.id) return res.status(200).json(buildAccess(null, false));

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('dlavie_ai_plan, dlavie_ai_daily_quota, dlavie_ai_daily_used, dlavie_ai_usage_date')
      .eq('id', user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(buildAccess(data as DlavieProfileAccess | null, true));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Dlavie AI subscription failed';
    return res.status(500).json({ error: message });
  }
}
