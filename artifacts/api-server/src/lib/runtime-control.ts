import { createSupabaseServiceClient } from './supabase-server.js';

type RuntimeValue = {
  enabled?: boolean;
  description?: string;
  reason?: string;
  title?: string;
  body?: string;
  source?: string;
  created_at?: string;
};

type RuntimeRow = {
  key: string;
  value: RuntimeValue | null;
  updated_at?: string | null;
};

type RuntimeFlag = {
  key: string;
  enabled: boolean;
  description: string;
  updated_at?: string | null;
};

type Announcement = {
  title: string;
  body: string;
  source?: string | null;
  is_active?: boolean;
  created_at?: string | null;
};

export type RuntimeState = {
  maintenance: RuntimeFlag;
  beta: RuntimeFlag;
  announcement: Announcement | null;
  announcements: Announcement[];
};

const defaultFlag = (key: string): RuntimeFlag => ({ key, enabled: false, description: '', updated_at: null });

export function cleanRuntimeText(value: unknown, max = 1200) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, max);
}

function flagFromRow(key: string, row?: RuntimeRow): RuntimeFlag {
  const value = row?.value || {};
  return {
    key,
    enabled: Boolean(value.enabled),
    description: cleanRuntimeText(value.description || value.reason || ''),
    updated_at: row?.updated_at || null,
  };
}

function announcementFromRow(row?: RuntimeRow): Announcement | null {
  if (!row?.value?.enabled) return null;
  const value = row.value;
  const body = cleanRuntimeText(value.body || value.description || value.reason || '');
  if (!body) return null;
  return {
    title: cleanRuntimeText(value.title || 'Dlavie update selesai', 120),
    body,
    source: value.source || 'runtime_announcement',
    is_active: true,
    created_at: value.created_at || row.updated_at || null,
  };
}

export async function getRuntimeState(): Promise<RuntimeState> {
  const supabase = createSupabaseServiceClient();
  try {
    const { data, error } = await supabase.from('dlavie_runtime_settings').select('key,value,updated_at').in('key', ['maintenance', 'beta', 'announcement']);
    if (error) throw error;
    const rows = ((data || []) as RuntimeRow[]).reduce<Record<string, RuntimeRow>>((acc, row) => {
      acc[row.key] = row;
      return acc;
    }, {});
    const announcement = announcementFromRow(rows.announcement);
    return {
      maintenance: flagFromRow('maintenance', rows.maintenance),
      beta: flagFromRow('beta', rows.beta),
      announcement,
      announcements: announcement ? [announcement] : [],
    };
  } catch {
    return { maintenance: defaultFlag('maintenance'), beta: defaultFlag('beta'), announcement: null, announcements: [] };
  }
}

export async function setRuntimeFlag(input: { key: 'maintenance' | 'beta'; enabled: boolean; description?: string; actor?: string }) {
  const supabase = createSupabaseServiceClient();
  const current = await supabase.from('dlavie_runtime_settings').select('value').eq('key', input.key).maybeSingle();
  const oldValue = (current.data?.value || {}) as RuntimeValue;
  const wasEnabled = Boolean(oldValue.enabled);
  const description = cleanRuntimeText(input.description ?? oldValue.description ?? oldValue.reason ?? '');
  const value = { ...oldValue, enabled: input.enabled, description, reason: description, updated_by: input.actor || 'system' };

  const updated = await supabase.from('dlavie_runtime_settings').upsert({ key: input.key, value, updated_at: new Date().toISOString() }).select('key,value,updated_at').single();
  if (updated.error) throw new Error(updated.error.message);

  if (input.key === 'maintenance' && wasEnabled && !input.enabled && description) {
    await supabase.from('dlavie_runtime_settings').upsert({
      key: 'announcement',
      value: { enabled: true, title: 'Dlavie update selesai', description, body: description, source: 'maintenance_release', created_at: new Date().toISOString(), created_by: input.actor || 'system' },
      updated_at: new Date().toISOString(),
    });
  }

  return flagFromRow(input.key, updated.data as RuntimeRow);
}
