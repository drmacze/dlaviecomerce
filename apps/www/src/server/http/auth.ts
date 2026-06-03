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

export async function requireAuth(headers: Headers): Promise<AuthUser> {
  const token = getBearerToken(headers);
  if (!token) throw new AppError('UNAUTHORIZED', 'Missing bearer token.', 401);

  const { data, error } = await getSupabaseAnon().auth.getUser(token);
  if (error || !data.user) throw new AppError('UNAUTHORIZED', 'Invalid bearer token.', 401);

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
