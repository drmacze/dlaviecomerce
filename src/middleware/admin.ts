import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { safeEqual } from '../utils/crypto.js';
import { requireAuth } from './auth.js';

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const key = request.headers['x-admin-api-key'];
  if (typeof key === 'string' && env.ADMIN_API_KEY && safeEqual(key, env.ADMIN_API_KEY)) return;
  await requireAuth(request, reply);
  if (request.user?.role !== 'admin')
    throw new AppError('FORBIDDEN', 'Admin access required.', 403);
}
