import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const allowedKeys = new Set(['maintenance', 'demo', 'announcement']);

function authorized(req: NextApiRequest) {
  const secret = String(process.env.DLAVIE_BOT_AUTH_SECRET || process.env.TELEGRAM_SETUP_KEY || process.env.DLAVIE_ADMIN_ACTION_KEY || '');
  const provided = String(req.headers['x-dlavie-bot-secret'] || req.query.key || '');
  return Boolean(secret && provided && provided === secret);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized runtime control.' });
  const supabase = createSupabaseServiceClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('dlavie_runtime_settings').select('key,value,updated_at').order('key');
    if (error) return res.status(500).json({ ok: false, error: error.message });
    return res.status(200).json({ ok: true, settings: data || [] });
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const key = String(req.body?.key || req.query.key || '').trim();
  if (!allowedKeys.has(key)) return res.status(400).json({ ok: false, error: 'Invalid runtime key.' });

  const current = await supabase.from('dlavie_runtime_settings').select('value').eq('key', key).maybeSingle();
  const oldValue = (current.data?.value || {}) as Record<string, unknown>;
  const nextValue = { ...oldValue, ...(req.body?.value || {}) };
  if (typeof req.body?.enabled === 'boolean') nextValue.enabled = req.body.enabled;
  if (typeof req.query.enabled === 'string') nextValue.enabled = req.query.enabled === 'true';

  const { error } = await supabase.from('dlavie_runtime_settings').upsert({ key, value: nextValue, updated_at: new Date().toISOString() });
  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, key, value: nextValue });
}
