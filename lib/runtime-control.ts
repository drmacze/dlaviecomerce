import { createSupabaseServiceClient } from '@/lib/supabase-server';

type RuntimeFlag = {
  key: string;
  enabled: boolean;
  description?: string | null;
  updated_at?: string | null;
};

type Announcement = {
  id?: string;
  title: string;
  body: string;
  source?: string | null;
  is_active?: boolean;
  created_at?: string | null;
};

export type RuntimeState = {
  maintenance: RuntimeFlag;
  beta: RuntimeFlag;
  announcements: Announcement[];
};

const defaultFlag = (key: string): RuntimeFlag => ({ key, enabled: false, description: '', updated_at: null });

export function cleanRuntimeText(value: unknown, max = 1200) {
  return String(value || '').replace(/\r/g, '').trim().slice(0, max);
}

export async function getRuntimeState(): Promise<RuntimeState> {
  const supabase = createSupabaseServiceClient();
  try {
    const [flagsResult, announcementsResult] = await Promise.all([
      supabase.from('runtime_flags').select('key,enabled,description,updated_at').in('key', ['maintenance', 'beta']),
      supabase.from('runtime_announcements').select('id,title,body,source,is_active,created_at').eq('is_active', true).order('created_at', { ascending: false }).limit(5),
    ]);

    const flags = ((flagsResult.data || []) as RuntimeFlag[]).reduce<Record<string, RuntimeFlag>>((acc, flag) => {
      acc[flag.key] = flag;
      return acc;
    }, {});

    return {
      maintenance: flags.maintenance || defaultFlag('maintenance'),
      beta: flags.beta || defaultFlag('beta'),
      announcements: (announcementsResult.data || []) as Announcement[],
    };
  } catch {
    return { maintenance: defaultFlag('maintenance'), beta: defaultFlag('beta'), announcements: [] };
  }
}

async function ensureFlag(key: 'maintenance' | 'beta') {
  const supabase = createSupabaseServiceClient();
  await supabase.from('runtime_flags').upsert({ key, enabled: false, description: '', updated_at: new Date().toISOString() }, { onConflict: 'key', ignoreDuplicates: true });
}

export async function setRuntimeFlag(input: { key: 'maintenance' | 'beta'; enabled: boolean; description?: string; actor?: string }) {
  const supabase = createSupabaseServiceClient();
  await ensureFlag(input.key);

  const current = await supabase.from('runtime_flags').select('key,enabled,description').eq('key', input.key).maybeSingle();
  const previous = (current.data || defaultFlag(input.key)) as RuntimeFlag;
  const description = cleanRuntimeText(input.description ?? previous.description ?? '');
  const updatedAt = new Date().toISOString();

  const updated = await supabase.from('runtime_flags').upsert({
    key: input.key,
    enabled: input.enabled,
    description,
    updated_at: updatedAt,
    updated_by: input.actor || 'system',
  }, { onConflict: 'key' }).select('key,enabled,description,updated_at').single();

  if (updated.error) throw new Error(updated.error.message);

  if (input.key === 'maintenance' && previous.enabled && !input.enabled && description) {
    await supabase.from('runtime_announcements').insert({
      title: 'Dlavie update selesai',
      body: description,
      source: 'maintenance_release',
      is_active: true,
      created_by: input.actor || 'system',
    });
  }

  return updated.data as RuntimeFlag;
}
