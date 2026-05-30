import { createSupabaseServiceClient } from './supabase-server.js';

type RuntimeValue = { enabled?: boolean; title?: string; message?: string } & Record<string, unknown>;

export async function getRuntimeSetting(key: 'maintenance' | 'demo' | 'announcement'): Promise<RuntimeValue> {
  try {
    const supabase = createSupabaseServiceClient();
    const { data } = await supabase.from('dlavie_runtime_settings').select('value').eq('key', key).maybeSingle();
    return (data?.value || {}) as RuntimeValue;
  } catch {
    return {};
  }
}

export async function assertTransactionsAllowed() {
  const maintenance = await getRuntimeSetting('maintenance');
  if (maintenance.enabled) {
    return { ok: false, status: 503, error: maintenance.message || 'DLAVIE sedang maintenance. Transaksi sementara dinonaktifkan.' };
  }
  const demo = await getRuntimeSetting('demo');
  if (demo.enabled) {
    return { ok: false, status: 423, error: demo.message || 'Mode demo aktif. Order dan topup dinonaktifkan.' };
  }
  return { ok: true, status: 200, error: '' };
}
