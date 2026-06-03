import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type JsonErrorCode = 'bad_request' | 'validation_error' | 'auth_error';

export function jsonError(message: string, status: number, code: JsonErrorCode = 'bad_request') {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export function validationError(error: ZodError) {
  return jsonError(error.issues[0]?.message ?? 'Invalid request body.', 400, 'validation_error');
}
