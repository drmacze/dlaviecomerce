import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = import.meta.env;
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey =
  env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let cachedClient: SupabaseClient | null = null;

export function hasSupabaseBrowserEnv() {
  return Boolean(url && anonKey);
}

export function createSupabaseBrowserClient() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase public env is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.",
    );
  }

  cachedClient ??= createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return cachedClient;
}

export const supabaseBrowserClient = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    return Reflect.get(createSupabaseBrowserClient(), property, receiver);
  },
});
