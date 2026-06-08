export const DLAVIE_ACCESS_COOKIE = 'dlavie-sb-at';
export const DLAVIE_REFRESH_COOKIE = 'dlavie-sb-rt';

export type DlavieSupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  identities?: Array<{ provider?: string; [key: string]: unknown }>;
  created_at?: string;
};

export type DlavieAuthPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: DlavieSupabaseUser;
  error?: string;
  error_description?: string;
  msg?: string;
};

export function isSecureCookieRuntime() {
  return process.env.NODE_ENV === 'production';
}

export function getAuthMessage(payload: DlavieAuthPayload, fallback: string) {
  return payload.error_description ?? payload.msg ?? payload.error ?? fallback;
}
