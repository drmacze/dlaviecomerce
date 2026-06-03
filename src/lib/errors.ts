import type { FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export const errorCodes = [
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'AI_PROVIDER_ERROR',
  'AI_PROVIDER_TIMEOUT',
  'RAG_ERROR',
  'DATABASE_ERROR',
  'INTERNAL_ERROR',
] as const;
export type ErrorCode = (typeof errorCodes)[number];

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode = 500,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function formatError(code: ErrorCode, message: string, details?: unknown) {
  return { error: { code, message, details: details ?? {} } };
}

export function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof AppError) {
    return reply
      .status(error.statusCode)
      .send(formatError(error.code, error.message, error.details));
  }
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send(formatError('VALIDATION_ERROR', 'Request validation failed.', error.issues));
  }
  return reply.status(500).send(formatError('INTERNAL_ERROR', 'Internal server error.'));
}
