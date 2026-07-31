import type { FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { getBearerToken } from '../lib/http.js';
import { getSupabaseAdmin, getSupabaseAnon } from '../lib/supabase.js';
import type { AuthUser } from '../types/auth.js';
import { safeEqual } from '../utils/crypto.js';

function hasValidAutomationKey(request: FastifyRequest): boolean {
  const key = request.headers['x-admin-api-key'];
  const configuredKey = env.ADMIN_API_KEY;
  return typeof key === 'string' && Boolean(configuredKey) && safeEqual(key, configuredKey!);
}

async function requireAdminUser(request: FastifyRequest): Promise<void> {
  const token = getBearerToken(request);
  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Valid admin credentials are required.', 401);
  }

  try {
    const { data, error } = await getSupabaseAnon().auth.getUser(token);
    if (error || !data.user) {
      throw new AppError('UNAUTHORIZED', 'The admin session is invalid or expired.', 401);
    }

    const { data: profile, error: profileError } = await (getSupabaseAdmin() as any)
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      throw new AppError('SERVICE_UNAVAILABLE', 'Admin authorization is unavailable.', 503);
    }
    if (profile?.role !== 'admin') {
      throw new AppError('FORBIDDEN', 'The authenticated user is not a commerce admin.', 403);
    }

    request.user = { ...data.user, role: 'admin' } as AuthUser;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('SERVICE_UNAVAILABLE', 'Admin authentication is unavailable.', 503);
  }
}

export async function requireCommerceAdmin(request: FastifyRequest): Promise<void> {
  if (hasValidAutomationKey(request)) return;
  await requireAdminUser(request);
}
