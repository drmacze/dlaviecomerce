import { createClient } from '@supabase/supabase-js';

export function createSupabaseServiceClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server env is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
