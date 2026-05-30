import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const allowedKeys = new Set(['maintenance', 'beta', 'demo', 'announcement']);

function authorized(req: NextApiRequest) {
  const secret = String(process.env.DLAVIE_BOT_AUTH_SECRET || process.env.TELEGRAM_SETUP_KEY || process.env.DLAVIE_ADMIN_ACTION_KEY || '');
  const provided = String(req.headers['x-dlavie-bot-secret'] || req.query.auth || req.query.secret || '');
  return Boolean(secret && provided && provided === secret);
}

function cleanText(value: unknown, max = 1400) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, max);
}

function boolValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1' || value === 'on';
  return fallback;
}

function linesToTitle(description: string) {
  const first = description.split('\n').map((line) => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean)[0];
  return first ? `Update: ${first.slice(0, 80)}` : 'Dlavie update selesai';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized runtime control.' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('dlavie_runtime_settings').select('key,value,updated_at').order('key');
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, settings: data || [] });
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const mode = String(req.body?.mode || req.body?.key || req.query.mode || '').trim().toLowerCase();
  if (!allowedKeys.has(mode)) return res.status(400).json({ ok: false, error: 'Invalid runtime key. Gunakan maintenance, beta, demo, atau announcement.' });

  const current = await supabase.from('dlavie_runtime_settings').select('value').eq('key', mode).maybeSingle();
  const oldValue = (current.data?.value || {}) as Record<string, unknown>;
  const wasEnabled = Boolean(oldValue.enabled);
  const enabled = boolValue(req.body?.enabled ?? req.query.enabled, Boolean(oldValue.enabled));
  const description = cleanText(req.body?.description ?? req.body?.reason ?? oldValue.description ?? oldValue.reason ?? '');
  const nextValue = {
    ...oldValue,
    ...(req.body?.value || {}),
    enabled,
    description,
    reason: description,
    updated_by: 'runtime-control',
  };

  if ((mode === 'maintenance' || mode === 'beta') && enabled && description.length < 3) {
    return res.status(400).json({ ok: false, error: 'Deskripsi wajib diisi saat mode diaktifkan.' });
  }

  const { error } = await supabase.from('dlavie_runtime_settings').upsert({ key: mode, value: nextValue, updated_at: new Date().toISOString() });
  if (error) return res.status(500).json({ ok: false, error: error.message });

  let announcement = null;
  if (mode === 'maintenance' && wasEnabled && !enabled && description) {
    const annValue = {
      enabled: true,
      title: linesToTitle(description),
      description,
      body: description,
      source: 'maintenance_release',
      created_at: new Date().toISOString(),
    };
    const ann = await supabase.from('dlavie_runtime_settings').upsert({ key: 'announcement', value: annValue, updated_at: new Date().toISOString() }).select('key,value,updated_at').single();
    announcement = ann.data || null;
  }

  return res.status(200).json({ ok: true, key: mode, value: nextValue, announcement });
}
