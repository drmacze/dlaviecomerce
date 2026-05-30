import type { NextApiRequest, NextApiResponse } from 'next';
import { auditAndNotifyCommerce } from '@/lib/commerce-audit';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';

function appBaseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

function actionKey() {
  return String(process.env.DLAVIE_ADMIN_ACTION_KEY || process.env.TELEGRAM_SETUP_KEY || '').trim();
}

function rupiah(value = 0) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function validTopupAmount(value: unknown) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) && amount >= 10000 && amount <= 1000000;
}

function redirectToTopups(res: NextApiResponse) {
  res.writeHead(302, { Location: '/admin/topups' });
  return res.end();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const key = String(req.query.key || '').trim();
    const id = String(req.query.id || '').trim();
    const action = String(req.query.action || '').trim().toLowerCase();
    const secret = actionKey();

    if (!secret || key !== secret) return res.status(401).json({ error: 'Invalid action key' });
    if (!id) return res.status(400).json({ error: 'id wajib diisi' });
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'action tidak valid' });

    const supabase = createSupabaseServiceClient();
    const txResult = await supabase.from('wallet_transactions').select('*').eq('id', id).eq('type', 'topup').single();
    if (txResult.error || !txResult.data) return res.status(404).json({ error: txResult.error?.message || 'Topup tidak ditemukan' });

    const tx = txResult.data;
    if (tx.status !== 'pending') {
      return res.status(409).json({ error: `Topup sudah diproses dengan status ${tx.status}.`, topup: tx });
    }
    if (!validTopupAmount(tx.amount)) return res.status(400).json({ error: 'Nominal topup tidak valid. Minimal Rp 10.000 dan maksimal Rp 1.000.000.' });

    const metadata = {
      ...(tx.metadata || {}),
      reviewed_by: 'telegram-action',
      reviewed_at: new Date().toISOString(),
      review_note: `Processed from Telegram action: ${action}`,
      admin_action: action,
    };

    if (action === 'reject') {
      const rejected = await supabase
        .from('wallet_transactions')
        .update({ status: 'failed', metadata: { ...metadata, rejected_at: new Date().toISOString() } })
        .eq('id', id)
        .eq('type', 'topup')
        .eq('status', 'pending')
        .select('*')
        .single();

      if (rejected.error || !rejected.data) {
        const latest = await supabase.from('wallet_transactions').select('*').eq('id', id).single();
        return res.status(409).json({ error: `Topup gagal ditolak. Status terbaru: ${latest.data?.status || 'unknown'}.`, topup: latest.data || null, detail: rejected.error?.message || null });
      }

      await auditAndNotifyCommerce({ action: 'topup_rejected_telegram', actor: 'telegram-action', targetType: 'wallet_transaction', targetId: String(rejected.data.id), status: 'success', amount: Number(rejected.data.amount || 0), userId: rejected.data.user_id, reference: rejected.data.reference, metadata: { provider: rejected.data.provider } });
      await sendTelegramMessageToAdmins(['🚫 Topup rejected', '', `Amount: ${rupiah(rejected.data.amount)}`, `User: ${rejected.data.user_id}`, `Ref: ${rejected.data.reference || '-'}`].join('\n'));
      return redirectToTopups(res);
    }

    const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.user_id).single();
    if (profile.error || !profile.data) return res.status(500).json({ error: profile.error?.message || 'Profile tidak ditemukan' });

    const currentBalance = Number(profile.data.d_balance || 0);
    const nextBalance = currentBalance + Number(tx.amount || 0);
    const successMeta = { ...metadata, balance_before: currentBalance, balance_after: nextBalance, approved_at: new Date().toISOString() };

    const claimed = await supabase
      .from('wallet_transactions')
      .update({ status: 'success', metadata: successMeta })
      .eq('id', id)
      .eq('type', 'topup')
      .eq('status', 'pending')
      .select('*')
      .single();

    if (claimed.error || !claimed.data) {
      const latest = await supabase.from('wallet_transactions').select('*').eq('id', id).single();
      return res.status(409).json({ error: `Topup gagal di-approve. Status terbaru: ${latest.data?.status || 'unknown'}.`, topup: latest.data || null, detail: claimed.error?.message || null });
    }

    const balance = await supabase
      .from('profiles')
      .update({ d_balance: nextBalance })
      .eq('id', tx.user_id)
      .eq('d_balance', currentBalance)
      .select('id,d_balance')
      .single();

    if (balance.error || !balance.data) {
      await supabase.from('wallet_transactions').update({ status: 'pending', metadata: { ...metadata, rollback_reason: 'balance_update_failed_after_claim', rollback_at: new Date().toISOString() } }).eq('id', id).eq('status', 'success');
      return res.status(409).json({ error: 'Saldo user berubah saat approve. Transaksi dikembalikan ke pending, refresh lalu coba lagi.' });
    }

    await auditAndNotifyCommerce({ action: 'topup_approved_telegram', actor: 'telegram-action', targetType: 'wallet_transaction', targetId: String(claimed.data.id), status: 'success', amount: Number(claimed.data.amount || 0), userId: claimed.data.user_id, reference: claimed.data.reference, metadata: { provider: claimed.data.provider, balance_before: currentBalance, balance_after: nextBalance } });

    await sendTelegramMessageToAdmins([
      '✅ Topup approved',
      '',
      `Amount: ${rupiah(claimed.data.amount)}`,
      `Balance Before: ${rupiah(currentBalance)}`,
      `New Balance: ${rupiah(balance.data.d_balance)}`,
      `User: ${claimed.data.user_id}`,
      `Ref: ${claimed.data.reference || '-'}`,
    ].join('\n'), {
      replyMarkup: { inline_keyboard: [[{ text: '💰 Open Topups', url: `${appBaseUrl(req)}/admin/topups` }], [{ text: '👑 Admin Hub', url: `${appBaseUrl(req)}/admin/hub` }]] },
    });

    return redirectToTopups(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Topup action failed';
    return res.status(500).json({ error: message });
  }
}
