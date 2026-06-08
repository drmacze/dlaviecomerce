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
      eq(
        column: 'id',
        value: string,
      ): {
        maybeSingle(): Promise<{ data: { role?: string } | null }>;
      };
    };
  };
};

function getCookieToken(headers: Headers): string | undefined {
  const cookieHeader = headers.get('cookie');
  if (!cookieHeader) return undefined;

  for (const item of cookieHeader.split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0 || item.slice(0, separator).trim() !== DLAVIE_ACCESS_COOKIE) continue;
    const value = item.slice(separator + 1).trim();
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function getAccessToken(headers: Headers): string | undefined {
  return getBearerToken(headers) ?? getCookieToken(headers);
}

async function authenticateToken(token: string): Promise<AuthUser> {
  const { data, error } = await getSupabaseAnon().auth.getUser(token);
  if (error || !data.user) throw new AppError('UNAUTHORIZED', 'Invalid access token.', 401);

  const profileClient = getSupabaseAdmin() as unknown as ProfileRoleClient;
  const { data: profile } = await profileClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  return { ...data.user, role: profile?.role === 'admin' ? 'admin' : 'user' } as AuthUser;
}

export async function requireAuth(headers: Headers): Promise<AuthUser> {
  const token = getBearerToken(headers);
  if (!token) throw new AppError('UNAUTHORIZED', 'Missing bearer token.', 401);
  return authenticateToken(token);
}

export async function optionalAuth(headers: Headers): Promise<AuthUser | undefined> {
  const token = getAccessToken(headers);
  if (!token) return undefined;
  try {
    return await authenticateToken(token);
  } catch {
    return undefined;
  }
}

export async function requireAdmin(headers: Headers): Promise<AuthUser | undefined> {
  const key = headers.get('x-admin-api-key');
  if (key && env.ADMIN_API_KEY && safeEqual(key, env.ADMIN_API_KEY)) return undefined;

  const user = await requireAuth(headers);
  if (user.role !== 'admin') throw new AppError('FORBIDDEN', 'Admin access required.', 403);
  return user;
}
