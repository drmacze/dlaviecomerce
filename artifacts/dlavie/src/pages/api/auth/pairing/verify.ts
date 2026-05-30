import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const channels = new Set(['telegram', 'whatsapp']);

type PairingRow = {
  id: string;
  channel: string;
  external_id: string;
  display_name: string | null;
  email: string | null;
  next_path: string | null;
  expires_at: string;
  used_at: string | null;
};

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function normalizeCode(value: unknown) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

function hashCode(channel: string, code: string) {
  return crypto.createHash('sha256').update(`${channel}:${normalizeCode(code)}:${process.env.DLAVIE_BOT_AUTH_SECRET || ''}`).digest('hex');
}

function safeNext(value: unknown) {
  const raw = typeof value === 'string' ? value : '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/login')) return '/dashboard';
  return raw;
}

function syntheticEmail(channel: string, externalId: string) {
  const hash = crypto.createHash('sha256').update(`${channel}:${externalId}`).digest('hex').slice(0, 32);
  return `${channel}.${hash}@bot.dlavie.local`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.DLAVIE_BOT_AUTH_SECRET) {
    return res.status(500).json({ error: 'DLAVIE_BOT_AUTH_SECRET belum diset.' });
  }

  const channel = String(req.body?.channel || '').toLowerCase();
  const code = normalizeCode(req.body?.code);
  if (!channels.has(channel)) return res.status(400).json({ error: 'channel harus telegram atau whatsapp.' });
  if (code.length < 6) return res.status(400).json({ error: 'Kode pairing tidak valid.' });

  const supabase = createSupabaseServiceClient();
  const { data: pairing, error } = await supabase
    .from('auth_pairing_codes')
    .select('id, channel, external_id, display_name, email, next_path, expires_at, used_at')
    .eq('channel', channel)
    .eq('code_hash', hashCode(channel, code))
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!pairing) return res.status(400).json({ error: 'Kode salah, expired, atau sudah digunakan.' });

  const row = pairing as PairingRow;
  const email = (row.email || syntheticEmail(channel, row.external_id)).toLowerCase();
  const next = safeNext(req.body?.next || row.next_path || '/dashboard');
  const metadata = {
    provider: channel,
    external_id: row.external_id,
    full_name: row.display_name || 'DLAVIE Bot User',
    source: `dlavie-${channel}-pairing`
  };

  const created = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: metadata
  });

  if (created.error && !created.error.message.toLowerCase().includes('already')) {
    return res.status(400).json({ error: created.error.message });
  }

  await supabase.from('auth_pairing_codes').update({ used_at: new Date().toISOString() }).eq('id', row.id);

  const redirectTo = `${getSiteUrl()}/auth/confirmed?next=${encodeURIComponent(next)}`;
  const link = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo, data: metadata }
  });

  if (link.error || !link.data?.properties?.action_link) {
    return res.status(500).json({ error: link.error?.message || 'Gagal membuat login link.' });
  }

  return res.status(200).json({ loginUrl: link.data.properties.action_link, next });
}
