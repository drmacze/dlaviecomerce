import type { FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export const errorCodes = [
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'SERVICE_UNAVAILABLE',
  'PAYMENT_PROVIDER_ERROR',
  'AI_PROVIDER_ERROR',
  'AI_PROVIDER_TIMEOUT',
  'RAG_ERROR',
  'DATABASE_ERROR',
  'NOT_IMPLEMENTED',
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

function isErrorLike(
  error: unknown,
): error is { statusCode?: number; code?: string; message?: string; constraint?: string } {
  return typeof error === 'object' && error !== null && ('statusCode' in error || 'code' in error);
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

  if (isErrorLike(error)) {
    if (error.statusCode === 413) {
      return reply.status(413).send(formatError('BAD_REQUEST', 'Request payload is too large.'));
    }
    if (error.statusCode === 429) {
      return reply.status(429).send(formatError('RATE_LIMITED', 'Rate limit exceeded.'));
    }

    if (error.code === '23505') {
      return reply
        .status(409)
        .send(formatError('CONFLICT', 'A record with the same unique value already exists.'));
    }
    if (error.code === '23503') {
      return reply
        .status(409)
        .send(formatError('CONFLICT', 'The record is still referenced by other data.'));
    }
    if (error.code === '23514' || error.code === '22P02') {
      return reply
        .status(400)
        .send(formatError('BAD_REQUEST', 'The submitted data violates a database constraint.'));
    }
  }

  return reply.status(500).send(formatError('INTERNAL_ERROR', 'Internal server error.'));
}
