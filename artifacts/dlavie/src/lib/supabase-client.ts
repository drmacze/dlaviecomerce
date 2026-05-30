import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseBrowserClient = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true
  }
});

export function createSupabaseBrowserClient() {
  if (!url || !anonKey) {
    throw new Error('Supabase public env is missing.');
  }
  return supabaseBrowserClient;
}
