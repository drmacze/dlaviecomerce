import type { FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { safeEqual } from '../utils/crypto.js';

export async function requireCommerceAdmin(request: FastifyRequest): Promise<void> {
  const key = request.headers['x-admin-api-key'];
  if (typeof key !== 'string' || !env.ADMIN_API_KEY || !safeEqual(key, env.ADMIN_API_KEY)) {
    throw new AppError('UNAUTHORIZED', 'Valid admin credentials are required.', 401);
  }
}
