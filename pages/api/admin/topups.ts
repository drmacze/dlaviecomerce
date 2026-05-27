import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

function isAdminEmail(email?: string | null) {
  const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
  return Boolean(email && admins.includes(email.toLowerCase()));
}

function cleanText(value: unknown, max = 220) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function validTopupAmount(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) && amount >= 10000 && amount <= 1000000;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const admin = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!admin || !isAdminEmail(admin.email)) return res.status(403).json({ error: 'Forbidden' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('wallet_transactions').select('*').eq('type', 'topup').order('created_at', { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: error.message });
    const rows = data || [];
    return res.status(200).json({
      topups: rows,
      pending: rows.filter((tx) => tx.status === 'pending'),
      history: rows.filter((tx) => tx.status !== 'pending'),
      serverTime: new Date().toISOString(),
    });
  }

  if (req.method === 'POST') {
    const { id, action } = req.body || {};
    const reviewNote = cleanText(req.body?.review_note);
    if (!id || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'id and action are required' });

    const txResult = await supabase.from('wallet_transactions').select('*').eq('id', id).eq('type', 'topup').single();
    if (txResult.error || !txResult.data) return res.status(404).json({ error: txResult.error?.message || 'Topup not found' });
    const tx = txResult.data;
    if (tx.status !== 'pending') return res.status(409).json({ error: `Topup sudah diproses dengan status ${tx.status}.`, topup: tx });
    if (!validTopupAmount(tx.amount)) return res.status(400).json({ error: 'Nominal topup tidak valid. Minimal Rp 10.000 dan maksimal Rp 1.000.000.' });

    const metadata = { ...(tx.metadata || {}), reviewed_by: admin.email, reviewed_at: new Date().toISOString(), review_note: reviewNote, admin_action: action };
    const provider = String(tx.provider || '').toLowerCase();
    const manualProvider = provider !== 'midtrans';
    if (manualProvider && (!metadata.sender_name || !metadata.proof_note || !metadata.proof_image_data)) {
      return res.status(400).json({ error: 'Topup manual tidak boleh di-approve tanpa nama pengirim, catatan, dan gambar bukti pembayaran.' });
    }

    if (action === 'reject') {
      const rejected = await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { ...metadata, rejected_at: new Date().toISOString() } }).eq('id', id).eq('type', 'topup').eq('status', 'pending').select('*').single();
      if (rejected.error || !rejected.data) {
        const latest = await supabase.from('wallet_transactions').select('*').eq('id', id).single();
        return res.status(409).json({ error: `Topup gagal ditolak. Status terbaru: ${latest.data?.status || 'unknown'}.`, topup: latest.data || null, detail: rejected.error?.message || null });
      }
      return res.status(200).json({ topup: rejected.data });
    }

    const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.user_id).single();
    if (profile.error || !profile.data) return res.status(500).json({ error: profile.error?.message || 'Profile tidak ditemukan.' });

    const currentBalance = Number(profile.data.d_balance || 0);
    const nextBalance = currentBalance + Number(tx.amount || 0);
    const successMeta = { ...metadata, balance_before: currentBalance, balance_after: nextBalance, approved_at: new Date().toISOString() };

    const claimed = await supabase.from('wallet_transactions').update({ status: 'success', metadata: successMeta }).eq('id', id).eq('type', 'topup').eq('status', 'pending').select('*').single();
    if (claimed.error || !claimed.data) {
      const latest = await supabase.from('wallet_transactions').select('*').eq('id', id).single();
      return res.status(409).json({ error: `Topup gagal di-approve. Status terbaru: ${latest.data?.status || 'unknown'}.`, topup: latest.data || null, detail: claimed.error?.message || null });
    }

    const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.user_id).eq('d_balance', currentBalance).select('id,d_balance').single();
    if (balance.error || !balance.data) {
      await supabase.from('wallet_transactions').update({ status: 'pending', metadata: { ...metadata, rollback_reason: 'balance_update_failed_after_claim', rollback_at: new Date().toISOString() } }).eq('id', id).eq('status', 'success');
      return res.status(409).json({ error: 'Saldo user berubah saat approve. Transaksi dikembalikan ke pending, refresh lalu coba lagi.' });
    }

    return res.status(200).json({ topup: claimed.data, wallet: balance.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
