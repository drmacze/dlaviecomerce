import { createClient } from '@supabase/supabase-js';

export async function verifySupabaseUser(accessToken?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

export function isAdminEmail(email?: string | null) {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(String(email || '').toLowerCase());
}

export async function requireAdminFromAuthHeader(header?: string | string[]) {
  const user = await verifySupabaseUser(bearerToken(header));
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
