import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../lib/supabase/url';
import { getAuthMessage, type DlavieAuthPayload } from '../../lib/supabase/session';
import type { LoginRequest, RegisterRequest } from './authSchemas';

export type AuthenticatedPayload = DlavieAuthPayload & {
  access_token: string;
  refresh_token: string;
};

export type AuthenticatedResult = {
  ok: true;
  status: 200;
  payload: AuthenticatedPayload;
  redirectTo: string;
};

export type AuthServiceResult =
  | AuthenticatedResult
  | {
      ok: true;
      status: 200;
      requiresConfirmation: true;
      message: string;
      redirectTo: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

function hasAuthTokens(payload: DlavieAuthPayload): payload is AuthenticatedPayload {
  return Boolean(payload.access_token && payload.refresh_token);
}

async function readAuthPayload(response: Response): Promise<DlavieAuthPayload> {
  try {
    return (await response.json()) as DlavieAuthPayload;
  } catch {
    return {} as DlavieAuthPayload;
  }
}

export async function signInWithPassword(input: LoginRequest): Promise<AuthenticatedResult | Extract<AuthServiceResult, { ok: false }>> {
  const response = await fetch(getSupabaseAuthEndpoint('/token?grant_type=password'), {
    method: 'POST',
    headers: getSupabaseRequestHeaders(),
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  const payload = await readAuthPayload(response);

  if (!response.ok || !hasAuthTokens(payload)) {
    return {
      ok: false,
      status: response.status || 401,
      message: getAuthMessage(payload, 'Unable to sign in. Check your email and password.'),
    };
  }

  return { ok: true, status: 200, payload, redirectTo: '/account/dashboard' };
}

export async function signUpWithPassword(input: RegisterRequest): Promise<AuthServiceResult> {
  const response = await fetch(getSupabaseAuthEndpoint('/signup'), {
    method: 'POST',
    headers: getSupabaseRequestHeaders(),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: {
        full_name: input.name,
        product_interest: input.interest,
        source: 'dlavie-www',
      },
    }),
    cache: 'no-store',
  });

  const payload = await readAuthPayload(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status || 400,
      message: getAuthMessage(payload, 'Unable to create your DLavie Account.'),
    };
  }

  if (!hasAuthTokens(payload)) {
    return {
      ok: true,
      status: 200,
      requiresConfirmation: true,
      message: 'Account created. Please check your email to confirm your DLavie Account before signing in.',
      redirectTo: '/account/login',
    };
  }

  return { ok: true, status: 200, payload, redirectTo: '/account/dashboard' };
}
