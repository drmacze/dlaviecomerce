import { NextResponse } from 'next/server';
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

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(formatError(error.code, error.message, error.details), {
      status: error.statusCode,
    });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      formatError('VALIDATION_ERROR', 'Request validation failed.', error.issues),
      { status: 400 },
    );
  }

  return NextResponse.json(formatError('INTERNAL_ERROR', 'Internal server error.'), { status: 500 });
}
