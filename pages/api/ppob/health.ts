import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { fetchVipaymentProfile, hasVipaymentEnv } from '@/lib/vipayment';
import { shouldUseVipayment } from '@/lib/vipayment-sync';

function startOfTodayIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function num(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function minimumProviderBalance() {
  return Number(process.env.PPOB_PROVIDER_MIN_BALANCE || 25000);
}

async function countRows(query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  const result = await query;
  if (result.error) throw new Error(result.error.message);
  return result.count || 0;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan.' });

  const supabase = createSupabaseServiceClient();
  const today = startOfTodayIso();
  const checks = {
    vipayment_env_ready: hasVipaymentEnv(),
    vipayment_enabled: shouldUseVipayment(),
    provider_min_balance: minimumProviderBalance()
  };

  let providerProfile = null;
  let providerBalance = 0;
  let providerError = null;

  if (checks.vipayment_env_ready) {
    try {
      providerProfile = await fetchVipaymentProfile();
      providerBalance = num(providerProfile.balance);
    } catch (error) {
      providerError = error instanceof Error ? error.message : 'Gagal cek saldo VIPayment.';
    }
  }

  try {
    const [activeProducts, pendingOrders, successToday, failedToday] = await Promise.all([
      countRows(supabase.from('ppob_products').select('id', { count: 'exact', head: true }).eq('provider', 'vipayment').eq('is_active', true)),
      countRows(supabase.from('ppob_orders').select('id', { count: 'exact', head: true }).eq('provider', 'vipayment').eq('status', 'pending')),
      countRows(supabase.from('ppob_orders').select('id', { count: 'exact', head: true }).eq('provider', 'vipayment').eq('status', 'success').gte('created_at', today)),
      countRows(supabase.from('ppob_orders').select('id', { count: 'exact', head: true }).eq('provider', 'vipayment').eq('status', 'failed').gte('created_at', today))
    ]);

    const healthy = Boolean(
      checks.vipayment_env_ready &&
      checks.vipayment_enabled &&
      !providerError &&
      providerBalance >= checks.provider_min_balance &&
      activeProducts > 0
    );

    return res.status(200).json({
      healthy,
      checks,
      provider: {
        balance: providerBalance,
        low_balance: providerBalance < checks.provider_min_balance,
        profile: providerProfile,
        error: providerError
      },
      metrics: {
        active_products: activeProducts,
        pending_orders: pendingOrders,
        success_today: successToday,
        failed_today: failedToday
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PPOB health check failed.';
    return res.status(500).json({ healthy: false, error: message, checks, provider: { balance: providerBalance, error: providerError } });
  }
}
