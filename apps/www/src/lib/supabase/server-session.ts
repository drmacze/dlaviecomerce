import { cookies } from 'next/headers';
import { createAccountSessionView, createUnauthenticatedAccountSession, type DlavieAccountSession } from './account-session';
import { DLAVIE_ACCESS_COOKIE, type DlavieSupabaseUser } from './session';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from './url';

type SupabaseUserPayload = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

function normalizeUser(payload: SupabaseUserPayload): DlavieSupabaseUser | null {
  if (!payload.id) return null;
  return {
    id: payload.id,
    email: payload.email,
    user_metadata: payload.user_metadata,
  };
}

async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value;
}

export async function getDlavieServerAccountSession(): Promise<DlavieAccountSession> {
  const token = await getAccessTokenFromCookies();
  if (!token) return createUnauthenticatedAccountSession();

  try {
    const headers = getSupabaseRequestHeaders();
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(getSupabaseAuthEndpoint('/user'), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) return createUnauthenticatedAccountSession();

    const payload = (await response.json().catch(() => ({}))) as SupabaseUserPayload;
    const user = normalizeUser(payload);
    return user ? createAccountSessionView(user) : createUnauthenticatedAccountSession();
  } catch {
    return createUnauthenticatedAccountSession();
  }
}
