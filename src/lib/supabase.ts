import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import type { Database } from '../types/database.js';

let adminClient: SupabaseClient<Database> | undefined;
let anonClient: SupabaseClient<Database> | undefined;

function requireSupabaseEnv() {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are required for this operation.');
  }
}

export function getSupabaseAdmin(): SupabaseClient<Database> {
  requireSupabaseEnv();
  adminClient ??= createClient<Database>(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function getSupabaseAnon(): SupabaseClient<Database> {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) throw new Error('Supabase env missing.');
  anonClient ??= createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonClient;
}
