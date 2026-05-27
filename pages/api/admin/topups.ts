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
    });
  }

  if (req.method === 'POST') {
    const { id, action } = req.body || {};
    const reviewNote = cleanText(req.body?.review_note);
    if (!id || !['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'id and action are required' });

    const txResult = await supabase.from('wallet_transactions').select('*').eq('id', id).eq('type', 'topup').single();
    if (txResult.error || !txResult.data) return res.status(404).json({ error: txResult.error?.message || 'Topup not found' });
    const tx = txResult.data;
    if (tx.status !== 'pending') return res.status(409).json({ error: `Topup sudah diproses dengan status ${tx.status}.` });
    if (!validTopupAmount(tx.amount)) return res.status(400).json({ error: 'Nominal topup tidak valid. Minimal Rp 10.000 dan maksimal Rp 1.000.000.' });

    const metadata = { ...(tx.metadata || {}), reviewed_by: admin.email, reviewed_at: new Date().toISOString(), review_note: reviewNote };
    const provider = String(tx.provider || '').toLowerCase();
    const manualProvider = provider !== 'midtrans';
    if (manualProvider && (!metadata.sender_name || !metadata.proof_note || !metadata.proof_image_data)) {
      return res.status(400).json({ error: 'Topup manual tidak boleh di-approve tanpa nama pengirim, catatan, dan gambar bukti pembayaran.' });
    }

    const locked = await supabase.from('wallet_transactions').update({ status: 'processing', metadata }).eq('id', id).eq('type', 'topup').eq('status', 'pending').select('*').single();
    if (locked.error || !locked.data) return res.status(409).json({ error: 'Topup sudah diproses oleh request lain. Refresh data.' });

    if (action === 'reject') {
      const rejected = await supabase.from('wallet_transactions').update({ status: 'rejected', metadata }).eq('id', id).eq('status', 'processing').select('*').single();
      if (rejected.error) return res.status(500).json({ error: rejected.error.message });
      return res.status(200).json({ topup: rejected.data });
    }

    const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.user_id).single();
    if (profile.error) return res.status(500).json({ error: profile.error.message });
    const currentBalance = Number(profile.data.d_balance || 0);
    const nextBalance = currentBalance + Number(tx.amount || 0);
    const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.user_id).eq('d_balance', currentBalance).select('id,d_balance').single();
    if (balance.error || !balance.data) return res.status(409).json({ error: 'Saldo user berubah saat approve. Topup dikunci processing, cek manual sebelum ulang.' });

    const approvedMeta = { ...metadata, balance_before: currentBalance, balance_after: nextBalance };
    const approved = await supabase.from('wallet_transactions').update({ status: 'approved', metadata: approvedMeta }).eq('id', id).eq('status', 'processing').select('*').single();
    if (approved.error) return res.status(500).json({ error: approved.error.message });
    return res.status(200).json({ topup: approved.data, wallet: balance.data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
