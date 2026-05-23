import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdmin: SupabaseClient | null = null;

type TableKey =
  | 'features'
  | 'faqs'
  | 'ppob_products'
  | 'ppob_orders'
  | 'deposit_methods'
  | 'deposit_requests'
  | 'tickets'
  | 'wa_links';

const defaultTables: Record<TableKey, string> = {
  features: 'bot_features',
  faqs: 'bot_faqs',
  ppob_products: 'ppob_products',
  ppob_orders: 'ppob_orders',
  deposit_methods: 'deposit_methods',
  deposit_requests: 'deposit_requests',
  tickets: 'support_tickets',
  wa_links: 'whatsapp_links'
};

export function getTable(key: TableKey) {
  const envKey = `DLAVIE_TABLE_${key.toUpperCase()}`;
  return process.env[envKey] || defaultTables[key];
}

export function getSupabaseAdmin() {
  if (cachedAdmin) return cachedAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) return null;

  cachedAdmin = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return cachedAdmin;
}

export async function safeSelect<T = Record<string, unknown>>(
  tableKey: TableKey,
  options: {
    select?: string;
    filters?: Record<string, string | number | boolean>;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  } = {}
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: true, data: [] as T[], source: 'not_connected' };

  let query = supabase
    .from(getTable(tableKey))
    .select(options.select || '*')
    .limit(options.limit || 100);

  if (options.filters) {
    for (const [field, value] of Object.entries(options.filters)) {
      query = query.eq(field, value);
    }
  }

  if (options.orderBy) {
    query = query.order(options.orderBy, {
      ascending: options.ascending ?? true
    });
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`[dlavie-bot-api] ${getTable(tableKey)} select skipped:`, error.message);
    return { ok: true, data: [] as T[], source: 'table_missing_or_unavailable', detail: error.message };
  }

  return { ok: true, data: (data || []) as T[], source: 'database' };
}

export async function safeInsert<T = Record<string, unknown>>(tableKey: TableKey, payload: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase belum terhubung di website. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Vercel.'
    };
  }

  const { data, error } = await supabase
    .from(getTable(tableKey))
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data as T };
}

export async function safeUpdate<T = Record<string, unknown>>(
  tableKey: TableKey,
  filters: Record<string, string | number | boolean>,
  payload: Record<string, unknown>
) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase belum terhubung di website.'
    };
  }

  let query = supabase
    .from(getTable(tableKey))
    .update(payload)
    .select('*');

  for (const [field, value] of Object.entries(filters)) {
    query = query.eq(field, value);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: (data || []) as T[] };
}
