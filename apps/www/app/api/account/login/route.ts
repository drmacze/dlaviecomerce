import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { jsonError, validationError } from '../../../../src/server/api/responses';
import { loginRequestSchema } from '../../../../src/server/account/authSchemas';
import { setAuthCookies } from '../../../../src/server/account/authCookies';
import { signInWithPassword } from '../../../../src/server/account/authService';

export async function POST(request: Request) {
  try {
    const input = loginRequestSchema.parse(await request.json().catch(() => ({})));
    const authResult = await signInWithPassword(input);

    if (!authResult.ok) {
      return jsonError(authResult.message, authResult.status, 'auth_error');
    }

    const response = NextResponse.json({ ok: true, redirectTo: authResult.redirectTo });
    setAuthCookies(response, authResult.payload);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return jsonError('Unable to sign in. Please try again.', 500);
  }
}
