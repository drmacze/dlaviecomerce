import type { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    if (tx.status !== 'pending') return res.status(400).json({ error: 'Topup sudah diproses.' });

    const metadata = { ...(tx.metadata || {}), reviewed_by: 'telegram-action', reviewed_at: new Date().toISOString(), review_note: `Processed from Telegram action: ${action}` };

    if (action === 'reject') {
      const rejected = await supabase.from('wallet_transactions').update({ status: 'rejected', metadata }).eq('id', id).select('*').single();
      if (rejected.error) return res.status(500).json({ error: rejected.error.message });
      await sendTelegramMessageToAdmins(['🚫 Topup rejected', '', `Amount: ${rupiah(tx.amount)}`, `User: ${tx.user_id}`, `Ref: ${tx.reference || '-'}`].join('\n'));
      res.writeHead(302, { Location: '/admin/topups' });
      return res.end();
    }

    const profile = await supabase.from('profiles').select('id,d_balance').eq('id', tx.user_id).single();
    if (profile.error || !profile.data) return res.status(500).json({ error: profile.error?.message || 'Profile tidak ditemukan' });

    const nextBalance = Number(profile.data.d_balance || 0) + Number(tx.amount || 0);
    const balance = await supabase.from('profiles').update({ d_balance: nextBalance }).eq('id', tx.user_id).select('id,d_balance').single();
    if (balance.error) return res.status(500).json({ error: balance.error.message });

    const approved = await supabase.from('wallet_transactions').update({ status: 'approved', metadata }).eq('id', id).select('*').single();
    if (approved.error) return res.status(500).json({ error: approved.error.message });

    await sendTelegramMessageToAdmins([
      '✅ Topup approved',
      '',
      `Amount: ${rupiah(tx.amount)}`,
      `New Balance: ${rupiah(balance.data.d_balance)}`,
      `User: ${tx.user_id}`,
      `Ref: ${tx.reference || '-'}`,
    ].join('\n'), {
      replyMarkup: { inline_keyboard: [[{ text: '💰 Open Topups', url: `${appBaseUrl(req)}/admin/topups` }], [{ text: '👑 Admin Hub', url: `${appBaseUrl(req)}/admin/hub` }]] },
    });

    res.writeHead(302, { Location: '/admin/topups' });
    return res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Topup action failed';
    return res.status(500).json({ error: message });
  }
}
