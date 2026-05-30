import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const allowedChannels = new Set(['whatsapp', 'telegram']);

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function safeNext(value: unknown) {
  const raw = typeof value === 'string' ? value : '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/login')) return '/dashboard';
  return raw;
}

function normalizeExternalId(value: unknown) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_@.+-]/g, '').slice(0, 120);
}

function syntheticEmail(channel: string, externalId: string) {
  const hash = crypto.createHash('sha256').update(`${channel}:${externalId}`).digest('hex').slice(0, 32);
  return `${channel}.${hash}@bot.dlavie.local`;
}

function unauthorized(res: NextApiResponse) {
  return res.status(401).json({ error: 'Unauthorized bot bridge request.' });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const configuredSecret = process.env.DLAVIE_BOT_AUTH_SECRET;
  const incomingSecret = String(req.headers['x-dlavie-bot-secret'] || req.body?.secret || '');
  if (!configuredSecret || incomingSecret !== configuredSecret) return unauthorized(res);

  const channel = String(req.body?.channel || '').toLowerCase();
  const externalId = normalizeExternalId(req.body?.externalId);
  const displayName = String(req.body?.displayName || 'DLAVIE Bot User').trim().slice(0, 120);
  const email = String(req.body?.email || syntheticEmail(channel, externalId)).trim().toLowerCase();
  const next = safeNext(req.body?.next);

  if (!allowedChannels.has(channel)) return res.status(400).json({ error: 'channel must be whatsapp or telegram.' });
  if (!externalId) return res.status(400).json({ error: 'externalId is required.' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Supabase server env is missing.' });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const metadata = {
    provider: channel,
    external_id: externalId,
    full_name: displayName,
    source: `dlavie-${channel}-bot`
  };

  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: metadata
  });

  if (created.error && !created.error.message.toLowerCase().includes('already')) {
    return res.status(400).json({ error: created.error.message });
  }

  const redirectTo = `${getSiteUrl()}/auth/confirmed?next=${encodeURIComponent(next)}`;
  const link = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo, data: metadata }
  });

  if (link.error || !link.data?.properties?.action_link) {
    return res.status(500).json({ error: link.error?.message || 'Failed to generate bot login link.' });
  }

  return res.status(200).json({
    channel,
    email,
    next,
    loginUrl: link.data.properties.action_link
  });
}
