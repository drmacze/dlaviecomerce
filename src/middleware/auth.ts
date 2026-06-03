import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../lib/errors.js';
import { getBearerToken } from '../lib/http.js';
import { getSupabaseAnon, getSupabaseAdmin } from '../lib/supabase.js';
import type { AuthUser } from '../types/auth.js';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  void reply;
  const token = getBearerToken(request);
  if (!token) throw new AppError('UNAUTHORIZED', 'Missing bearer token.', 401);
  const { data, error } = await getSupabaseAnon().auth.getUser(token);
  if (error || !data.user) throw new AppError('UNAUTHORIZED', 'Invalid bearer token.', 401);
  const { data: profile } = await (getSupabaseAdmin() as any)
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();
  request.user = { ...data.user, role: profile?.role === 'admin' ? 'admin' : 'user' } as AuthUser;
}
