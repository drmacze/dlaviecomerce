import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const allowedManualProviders = new Set(['manual-payment', 'bri', 'dana', 'gopay', 'qris']);

function sanitizeAmount(value: unknown) {
  const amount = Math.floor(Number(value || 0));
  if (!Number.isFinite(amount)) return 0;
  return amount;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized. Login diperlukan untuk mengakses wallet.' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    let profile = await supabase.from('profiles').select('id,email,d_balance,d_points,vip_level,security_score').eq('id', user.id).maybeSingle();
    if (profile.error) return res.status(500).json({ error: profile.error.message });

    if (!profile.data) {
      const created = await supabase.from('profiles').insert({ id: user.id, email: user.email, d_balance: 0, d_points: 0, l_points: 0, vip_level: 'free' }).select('id,email,d_balance,d_points,vip_level,security_score').single();
      if (created.error) return res.status(500).json({ error: created.error.message });
      profile = created;
    }

    const transactions = await supabase.from('wallet_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (transactions.error) return res.status(500).json({ error: transactions.error.message });
    return res.status(200).json({ wallet: profile.data, transactions: transactions.data || [] });
  }

  if (req.method === 'POST') {
    const amount = sanitizeAmount(req.body?.amount);
    if (amount < 10000) return res.status(400).json({ error: 'Minimum topup Rp 10.000' });
    if (amount > 1000000) return res.status(400).json({ error: 'Maximum topup manual Rp 1.000.000' });

    const provider = String(req.body?.provider || 'manual-payment').toLowerCase();
    const safeProvider = allowedManualProviders.has(provider) ? provider : 'manual-payment';
    const reference = `DLV-MANUAL-${Date.now()}-${user.id.slice(0, 6)}`;

    const created = await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'topup',
      amount,
      status: 'pending',
      provider: safeProvider,
      reference,
      metadata: { source: 'dlavie-wallet', provider: safeProvider, needs_admin_approval: true }
    }).select('*').single();

    if (created.error) return res.status(500).json({ error: created.error.message });
    return res.status(200).json({ transaction: created.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
