import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const channels = new Set(['telegram', 'whatsapp']);

function normalizeExternalId(value: unknown) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_@.+-]/g, '').slice(0, 120);
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

function hashCode(channel: string, code: string) {
  return crypto.createHash('sha256').update(`${channel}:${normalizeCode(code)}:${process.env.DLAVIE_BOT_AUTH_SECRET || ''}`).digest('hex');
}

function safeNext(value: unknown) {
  const raw = typeof value === 'string' ? value : '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/login')) return '/dashboard';
  return raw;
}

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DLV';
  for (let index = 0; index < 5; index++) code += alphabet[crypto.randomInt(0, alphabet.length)];
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.DLAVIE_BOT_AUTH_SECRET;
  const incomingSecret = String(req.headers['x-dlavie-bot-secret'] || req.body?.secret || '');
  if (!secret || incomingSecret !== secret) return res.status(401).json({ error: 'Unauthorized bot request.' });

  const channel = String(req.body?.channel || '').toLowerCase();
  const externalId = normalizeExternalId(req.body?.externalId);
  const displayName = String(req.body?.displayName || 'DLAVIE Bot User').trim().slice(0, 120);
  const email = String(req.body?.email || '').trim().toLowerCase();
  const nextPath = safeNext(req.body?.next);

  if (!channels.has(channel)) return res.status(400).json({ error: 'channel must be telegram or whatsapp.' });
  if (!externalId) return res.status(400).json({ error: 'externalId is required.' });

  const code = makeCode();
  const supabase = createSupabaseServiceClient();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabase.from('auth_pairing_codes').insert({
    channel,
    code_hash: hashCode(channel, code),
    external_id: externalId,
    display_name: displayName,
    email: email || null,
    next_path: nextPath,
    expires_at: expiresAt
  });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ code, expiresInSeconds: 300, next: nextPath });
}
