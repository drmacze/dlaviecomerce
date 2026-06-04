import { cookies } from 'next/headers';
import { buildDlavieAccountUser, type DlavieAccountSession, unauthenticatedDlavieAccountSession } from './account-session';
import { DLAVIE_ACCESS_COOKIE, type DlavieSupabaseUser } from './session';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from './url';

export async function getDlavieAccountSession(): Promise<DlavieAccountSession> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value;

  if (!accessToken) return unauthenticatedDlavieAccountSession;

  const headers = getSupabaseRequestHeaders();
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(getSupabaseAuthEndpoint('/user'), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) return unauthenticatedDlavieAccountSession;

  try {
    const user = await response.json() as DlavieSupabaseUser;
    return {
      isAuthenticated: true,
      user: buildDlavieAccountUser(user),
    };
  } catch {
    return unauthenticatedDlavieAccountSession;
  }
}
