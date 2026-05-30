import type { NextApiRequest, NextApiResponse } from "next";
import { bearerToken, verifySupabaseUser } from "@/lib/auth-server";
import {
  dlavieAiPlans,
  normalizeDlavieAiPlan,
  type DlavieAiPlan,
} from "@/lib/dlavie-ai-plans";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const planOrder: DlavieAiPlan[] = ["free", "basic", "core", "custom"];

function planRank(plan: DlavieAiPlan) {
  return planOrder.indexOf(plan);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await verifySupabaseUser(
      bearerToken(req.headers.authorization),
    );
    if (!user?.id || !user.email)
      return res
        .status(401)
        .json({ error: "Login diperlukan untuk upgrade Dlavie AI." });

    const plan = normalizeDlavieAiPlan(req.body?.plan);
    const billing = req.body?.billing === "year" ? "year" : "month";
    if (plan === "free")
      return res
        .status(400)
        .json({ error: "Free plan sudah tersedia otomatis." });

    const config = dlavieAiPlans[plan];
    const price = billing === "year" ? config.yearlyPrice : config.monthlyPrice;

    const supabase = createSupabaseServiceClient();
    const profile = await supabase
      .from("profiles")
      .select("d_balance, dlavie_ai_plan")
      .eq("id", user.id)
      .maybeSingle();

    if (profile.error)
      return res.status(500).json({ error: profile.error.message });
    if (!profile.data)
      return res.status(404).json({ error: "Profil user belum tersedia." });

    const currentPlan = normalizeDlavieAiPlan(profile.data.dlavie_ai_plan);
    if (planRank(plan) < planRank(currentPlan)) {
      return res
        .status(400)
        .json({
          error:
            "Downgrade plan harus dilakukan oleh admin agar usage tidak rusak.",
        });
    }

    const currentDBalance = Number(profile.data.d_balance || 0);
    if (currentDBalance < price) {
      return res.status(402).json({
        error: `D Balance tidak cukup. Butuh ${price.toLocaleString("id-ID")} D Balance.`,
        dBalance: currentDBalance,
        requiredDBalance: price,
      });
    }

    const nextDBalance = currentDBalance - price;
    const updated = await supabase
      .from("profiles")
      .update({
        d_balance: nextDBalance,
        dlavie_ai_plan: plan,
        dlavie_ai_daily_quota: config.dailyQuota,
        dlavie_ai_daily_used: 0,
        dlavie_ai_usage_date: new Date().toISOString().slice(0, 10),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("d_balance", currentDBalance)
      .select("d_balance, dlavie_ai_plan, dlavie_ai_daily_quota")
      .maybeSingle();

    if (updated.error)
      return res.status(500).json({ error: updated.error.message });
    if (!updated.data)
      return res
        .status(409)
        .json({
          error:
            "Saldo berubah saat upgrade diproses. Muat ulang lalu coba lagi.",
        });

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "dlavie_ai_plan_purchase",
      amount: -price,
      status: "success",
      provider: "dlavie-ai",
      reference: `ai-plan-${plan}-${billing}-${Date.now()}`,
      metadata: {
        plan,
        planName: config.name,
        billing,
        dailyQuota: config.dailyQuota,
        dBalanceBefore: currentDBalance,
        dBalanceAfter: nextDBalance,
      },
    });

    return res
      .status(200)
      .json({
        success: true,
        plan,
        planName: config.name,
        dBalance: nextDBalance,
        dailyQuota: config.dailyQuota,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upgrade Dlavie AI gagal.";
    return res.status(500).json({ error: message });
  }
}
