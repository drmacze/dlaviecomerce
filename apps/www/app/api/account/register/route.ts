import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { jsonError, validationError } from '../../../../src/server/api/responses';
import { registerRequestSchema } from '../../../../src/server/account/authSchemas';
import { setAuthCookies } from '../../../../src/server/account/authCookies';
import { signUpWithPassword } from '../../../../src/server/account/authService';

export async function POST(request: Request) {
  try {
    const input = registerRequestSchema.parse(await request.json().catch(() => ({})));
    const authResult = await signUpWithPassword(input);

    if (!authResult.ok) {
      return jsonError(authResult.message, authResult.status, 'auth_error');
    }

    if ('requiresConfirmation' in authResult) {
      return NextResponse.json({
        ok: true,
        requiresConfirmation: true,
        message: authResult.message,
        redirectTo: authResult.redirectTo,
      });
    }

    const response = NextResponse.json({ ok: true, redirectTo: authResult.redirectTo });
    setAuthCookies(response, authResult.payload);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error);
    }

    return jsonError('Unable to create your DLavie Account. Please try again.', 500);
  }
}
