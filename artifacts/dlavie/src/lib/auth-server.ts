import { createClient } from "@supabase/supabase-js";

export async function verifySupabaseUser(accessToken?: string) {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !accessToken) return null;
  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

export function bearerToken(header?: string | string[]) {
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw?.startsWith("Bearer ")) return undefined;
  return raw.slice("Bearer ".length);
}
