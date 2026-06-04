import { DLAVIE_ACCESS_COOKIE } from '../../lib/supabase/session';
import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { getBearerToken } from '../lib/http';
import { getSupabaseAdmin, getSupabaseAnon } from '../lib/supabase';
import type { AuthUser } from '../types/auth';
import { safeEqual } from '../utils/crypto';

type ProfileRoleClient = {
  from(table: 'profiles'): {
    select(columns: 'role'): {
      eq(column: 'id', value: string): {
        maybeSingle(): Promise<{ data: { role?: string } | null }>;
      };
    };
  };
};

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getCookieToken(headers: Headers, cookieName: string) {
  const cookieHeader = headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex === -1) continue;

    const name = cookie.slice(0, separatorIndex).trim();
    if (name !== cookieName) continue;

    const value = cookie.slice(separatorIndex + 1).trim();
    return value ? decodeCookieValue(value) : null;
  }

  return null;
}

export async function requireAuth(headers: Headers): Promise<AuthUser> {
  const token = getBearerToken(headers) ?? getCookieToken(headers, DLAVIE_ACCESS_COOKIE);
  if (!token) throw new AppError('UNAUTHORIZED', 'Missing bearer token or DLavie account session.', 401);

  const { data, error } = await getSupabaseAnon().auth.getUser(token);
  if (error || !data.user) throw new AppError('UNAUTHORIZED', 'Invalid bearer token or DLavie account session.', 401);

  const profileClient = getSupabaseAdmin() as unknown as ProfileRoleClient;
  const { data: profile } = await profileClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  return { ...data.user, role: profile?.role === 'admin' ? 'admin' : 'user' } as AuthUser;
}

export async function requireAdmin(headers: Headers): Promise<AuthUser | undefined> {
  const key = headers.get('x-admin-api-key');
  if (key && env.ADMIN_API_KEY && safeEqual(key, env.ADMIN_API_KEY)) return undefined;

  const user = await requireAuth(headers);
  if (user.role !== 'admin') throw new AppError('FORBIDDEN', 'Admin access required.', 403);
  return user;
}
