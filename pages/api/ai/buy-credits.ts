import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { getDlavieAiPack } from '@/lib/dlavie-ai-credits';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user?.id || !user.email) return res.status(401).json({ error: 'Login diperlukan untuk membeli AI Token.' });

    const pack = getDlavieAiPack(req.body?.packId);
    if (!pack) return res.status(400).json({ error: 'Paket AI Token tidak valid.' });

    const supabase = createSupabaseServiceClient();
    const profile = await supabase
      .from('profiles')
      .select('d_balance, ai_token_balance')
      .eq('id', user.id)
      .maybeSingle();

    if (profile.error) return res.status(500).json({ error: profile.error.message });
    if (!profile.data) return res.status(404).json({ error: 'Profil user belum tersedia.' });

    const currentDBalance = Number(profile.data.d_balance || 0);
    const currentAiTokens = Number(profile.data.ai_token_balance || 0);

    if (currentDBalance < pack.priceDBalance) {
      return res.status(402).json({
        error: `D Balance tidak cukup. Butuh ${pack.priceDBalance.toLocaleString('id-ID')} D Balance.`,
        dBalance: currentDBalance,
      });
    }

    const nextDBalance = currentDBalance - pack.priceDBalance;
    const nextAiTokens = currentAiTokens + pack.credits;

    const updated = await supabase
      .from('profiles')
      .update({
        d_balance: nextDBalance,
        ai_token_balance: nextAiTokens,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('d_balance, ai_token_balance')
      .single();

    if (updated.error || !updated.data) return res.status(500).json({ error: updated.error?.message || 'Pembelian AI Token gagal.' });

    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'ai_credit_purchase',
      amount: -pack.priceDBalance,
      status: 'success',
      provider: 'dlavie-ai',
      reference: `ai-${pack.id}-${Date.now()}`,
      metadata: {
        packId: pack.id,
        packName: pack.name,
        aiTokensAdded: pack.credits,
        dBalanceBefore: currentDBalance,
        dBalanceAfter: nextDBalance,
        aiTokenBefore: currentAiTokens,
        aiTokenAfter: nextAiTokens,
      },
    });

    return res.status(200).json({
      success: true,
      pack,
      dBalance: Number(updated.data.d_balance || 0),
      aiTokenBalance: Number(updated.data.ai_token_balance || 0),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pembelian AI Token gagal.';
    return res.status(500).json({ error: message });
  }
}
