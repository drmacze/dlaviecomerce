import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';

const allowedManualProviders = new Set(['manual-payment', 'bri', 'dana', 'gopay', 'qris']);
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function appBaseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
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
  if (data.length > 1_250_000) return 'too-large';
  return data;
}

async function notifyManualTopup(req: NextApiRequest, input: { id: string; userId: string; email?: string | null; amount: number; provider: string; reference: string; senderName: string; proofNote: string }) {
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
    const senderName = cleanText(req.body?.sender_name, 80);
    const proofNote = cleanText(req.body?.proof_note, 300);
    const proofImageData = cleanProofImage(req.body?.proof_image_data);
    const proofImageName = cleanText(req.body?.proof_image_name, 120);

    if (senderName.length < 3) return res.status(400).json({ error: 'Nama pengirim wajib diisi minimal 3 karakter.' });
    if (proofNote.length < 6) return res.status(400).json({ error: 'Catatan bukti pembayaran wajib diisi.' });
    if (!proofImageData) return res.status(400).json({ error: 'Upload bukti pembayaran dari galeri wajib diisi.' });
    if (proofImageData === 'too-large') return res.status(400).json({ error: 'Ukuran bukti gambar terlalu besar. Maksimal sekitar 900KB.' });

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
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
