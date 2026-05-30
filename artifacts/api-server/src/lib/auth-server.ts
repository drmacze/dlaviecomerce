import { createClient } from '@supabase/supabase-js';

export async function verifySupabaseUser(accessToken?: string) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey || !accessToken) return null;
  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

export function bearerToken(header?: string | string[]) {
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw?.startsWith('Bearer ')) return undefined;
  return raw.slice('Bearer '.length);
}
