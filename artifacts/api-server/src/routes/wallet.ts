import { Router } from 'express';
import { bearerToken, verifySupabaseUser } from '../lib/auth-server.js';
import { assertTransactionsAllowed } from '../lib/runtime-server.js';
import { createSupabaseServiceClient } from '../lib/supabase-server.js';
import { sendTelegramMessageToAdmins } from '../lib/telegram.js';
import { midtransAuthHeader, midtransBaseUrl, isPaidMidtransStatus, isFailedMidtransStatus } from '../lib/midtrans.js';
import { settleWalletTopup } from '../lib/topup-settlement.js';

const router = Router();

const allowedManualProviders = new Set(['manual-payment', 'bri', 'dana', 'gopay', 'qris']);
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function appBaseUrl(req: Express.Request) {
  const host = String((req as any).headers['x-forwarded-host'] || (req as any).headers.host || '').trim();
  const proto = String((req as any).headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

function sanitizeAmount(value: unknown) {
  const amount = Math.floor(Number(value || 0));
  if (!Number.isFinite(amount)) return 0;
  return amount;
}

function cleanText(value: unknown, max = 240) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function cleanProofImage(value: unknown) {
  const data = String(value || '');
  if (!data) return '';
  if (!data.startsWith('data:image/')) return '';
  if (data.length > 2_600_000) return 'too-large';
  return data;
}

async function notifyManualTopup(req: any, input: { id: string; userId: string; email?: string | null; amount: number; provider: string; reference: string; senderName: string; proofNote: string }) {
  const appUrl = appBaseUrl(req);
  const key = encodeURIComponent(String(process.env.DLAVIE_ADMIN_ACTION_KEY || process.env.TELEGRAM_SETUP_KEY || ''));
  const approveUrl = `${appUrl}/api/admin/topups/action?id=${encodeURIComponent(input.id)}&action=approve&key=${key}`;
  const rejectUrl = `${appUrl}/api/admin/topups/action?id=${encodeURIComponent(input.id)}&action=reject&key=${key}`;
  return sendTelegramMessageToAdmins([
    '💰 MANUAL TOPUP BARU - PERLU REVIEW',
    '',
    `Amount: ${rupiah(input.amount)}`,
    `Provider: ${input.provider}`,
    `Email: ${input.email || '-'}`,
    `User: ${input.userId}`,
    `Reference: ${input.reference}`,
    `Sender: ${input.senderName}`,
    '',
    `Note: ${input.proofNote}`,
    '',
    'Aksi: cek bukti pembayaran lalu Approve atau Reject.',
  ].join('\n'), {
    replyMarkup: {
      inline_keyboard: [
        [{ text: '✅ Approve Topup', url: approveUrl }, { text: '🚫 Reject', url: rejectUrl }],
        [{ text: '💰 Open Topups', url: `${appUrl}/admin/topups` }, { text: '🚀 Secure Gate', url: `${appUrl}/telegram-admin` }],
      ],
    },
  });
}

router.get('/wallet', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized. Login diperlukan untuk mengakses wallet.' });
  const supabase = createSupabaseServiceClient();

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
});

router.post('/wallet', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized. Login diperlukan untuk mengakses wallet.' });
  const supabase = createSupabaseServiceClient();

  const gate = await assertTransactionsAllowed();
  if (!gate.ok) return res.status(gate.status).json({ error: gate.error });

  const amount = sanitizeAmount(req.body?.amount);
  if (amount < 10000) return res.status(400).json({ error: 'Minimum topup Rp 10.000' });
  if (amount > 1000000) return res.status(400).json({ error: 'Maximum topup manual Rp 1.000.000' });

  const provider = String(req.body?.provider || 'manual-payment').toLowerCase();
  const safeProvider = allowedManualProviders.has(provider) ? provider : 'manual-payment';
  const senderName = cleanText(req.body?.sender_name, 80);
  const proofNote = cleanText(req.body?.proof_note, 300);
  const proofImageData = cleanProofImage(req.body?.proof_image_data);
  const proofImageName = cleanText(req.body?.proof_image_name, 120);

  if (senderName.length < 3) return res.status(400).json({ error: 'Nama pengirim wajib diisi minimal 3 karakter.' });
  if (proofNote.length < 6) return res.status(400).json({ error: 'Catatan bukti pembayaran wajib diisi.' });
  if (!proofImageData) return res.status(400).json({ error: 'Upload bukti pembayaran dari galeri wajib diisi.' });
  if (proofImageData === 'too-large') return res.status(400).json({ error: 'Ukuran bukti gambar terlalu besar. Kompres/screenshot ulang lalu upload kembali.' });

  const reference = `DLV-MANUAL-${Date.now()}-${user.id.slice(0, 6)}`;
  const created = await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'topup',
    amount,
    status: 'pending',
    provider: safeProvider,
    reference,
    metadata: {
      source: 'dlavie-wallet',
      provider: safeProvider,
      sender_name: senderName,
      proof_note: proofNote,
      proof_image_data: proofImageData,
      proof_image_name: proofImageName,
      submitted_at: new Date().toISOString(),
      needs_admin_approval: true
    }
  }).select('*').single();

  if (created.error) return res.status(500).json({ error: created.error.message });

  notifyManualTopup(req, {
    id: created.data.id,
    userId: user.id,
    email: user.email,
    amount,
    provider: safeProvider,
    reference,
    senderName,
    proofNote,
  }).catch((error) => console.error('Telegram manual topup notification failed:', error));

  return res.status(200).json({ transaction: created.data });
});

router.post('/wallet/topup-auto', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user?.email) return res.status(401).json({ error: 'Unauthorized. Login dulu untuk topup otomatis.' });

  const amount = sanitizeAmount(req.body?.amount);
  if (amount < 10000) return res.status(400).json({ error: 'Minimum topup Rp 10.000' });
  if (amount > 1000000) return res.status(400).json({ error: 'Maximum topup otomatis Rp 1.000.000' });

  if (!process.env.MIDTRANS_SERVER_KEY) {
    return res.status(503).json({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi.' });
  }

  const supabase = createSupabaseServiceClient();
  const topupId = `DLV-TOPUP-${Date.now()}-${user.id.slice(0, 6)}`;
  const inserted = await supabase.from('wallet_transactions').insert({
    user_id: user.id,
    type: 'topup',
    amount,
    status: 'pending',
    provider: 'midtrans',
    reference: topupId,
    metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId }
  }).select('*').single();

  if (inserted.error) return res.status(500).json({ error: inserted.error.message });

  try {
    const siteUrl = process.env.VITE_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || req.headers.origin || 'https://dlaviecomerce.vercel.app';
    const response = await fetch(`${midtransBaseUrl()}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        Authorization: midtransAuthHeader(),
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        transaction_details: { order_id: topupId, gross_amount: amount },
        customer_details: { email: user.email },
        item_details: [{ id: 'DLAVIE_TOPUP', price: amount, quantity: 1, name: `DLAVIE Topup ${amount}` }],
        callbacks: { finish: `${siteUrl}/wallet/finish?order_id=${encodeURIComponent(topupId)}&amount=${amount}` }
      })
    });

    const data = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      const errorMessage = (data.error_messages as string[])?.[0] || data.message || 'Midtrans transaction failed';
      await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, error: errorMessage } }).eq('id', inserted.data.id);
      return res.status(response.status).json({ error: errorMessage });
    }

    if (!data.redirect_url || !data.token) {
      await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, error: 'Midtrans tidak mengirim redirect_url/token' } }).eq('id', inserted.data.id);
      return res.status(502).json({ error: 'Midtrans tidak mengirim link pembayaran. Coba lagi.' });
    }

    await supabase.from('wallet_transactions').update({ metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, snap_token: data.token, redirect_url: data.redirect_url } }).eq('id', inserted.data.id);
    return res.status(200).json({ transaction: inserted.data, token: data.token, redirect_url: data.redirect_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Topup otomatis gagal dibuat.';
    await supabase.from('wallet_transactions').update({ status: 'failed', metadata: { gateway: 'midtrans', source: 'auto-topup', order_id: topupId, error: message } }).eq('id', inserted.data.id);
    return res.status(500).json({ error: message });
  }
});

router.post('/wallet/verify-topup', async (req, res) => {
  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Unauthorized. Login diperlukan.' });

  const orderId = String(req.body?.order_id || '').trim();
  if (!orderId || !orderId.startsWith('DLV-TOPUP-')) return res.status(400).json({ error: 'Order topup tidak valid.' });

  const supabase = createSupabaseServiceClient();
  const owned = await supabase.from('wallet_transactions').select('id,user_id,status,amount').eq('reference', orderId).eq('type', 'topup').maybeSingle();
  if (owned.error) return res.status(500).json({ error: owned.error.message });
  if (!owned.data) return res.status(404).json({ error: 'Transaksi topup tidak ditemukan.' });
  if (owned.data.user_id !== user.id) return res.status(403).json({ error: 'Transaksi ini bukan milik akun kamu.' });
  if (owned.data.status === 'approved') return res.status(200).json({ ok: true, status: 'approved', duplicate: true });

  const response = await fetch(`${midtransBaseUrl()}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Authorization: midtransAuthHeader(), Accept: 'application/json' }
  });
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) return res.status(response.status).json({ error: (data.error_messages as string[])?.[0] || data.message || 'Gagal cek status Midtrans.' });

  const gatewayStatus = String(data.transaction_status || '');
  const fraudStatus = String(data.fraud_status || '');

  if (isPaidMidtransStatus(gatewayStatus, fraudStatus)) {
    const settled = await settleWalletTopup(orderId, data, 'midtrans_verify');
    return res.status(200).json({ ok: true, status: 'approved', result: settled });
  }

  if (isFailedMidtransStatus(gatewayStatus)) {
    const updated = await supabase.from('wallet_transactions').update({ status: 'rejected', metadata: { ...(owned.data as any).metadata, midtrans_verify: data } }).eq('id', owned.data.id).select('*').single();
    if (updated.error) return res.status(500).json({ error: updated.error.message });
    return res.status(200).json({ ok: true, status: 'rejected', topup: updated.data });
  }

  return res.status(200).json({ ok: true, status: gatewayStatus || 'pending', midtrans: data });
});

export default router;
