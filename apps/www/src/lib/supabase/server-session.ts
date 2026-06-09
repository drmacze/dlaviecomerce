import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from './url';
import { DLAVIE_ACCESS_COOKIE, type DlavieSupabaseUser } from './session';

export function readCookie(cookieHeader: string | null, name: string) {
  const raw = cookieHeader
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || null;

  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function validateDlavieAccessToken(accessToken?: string | null): Promise<DlavieSupabaseUser | null> {
  if (!accessToken) return null;
  const headers = getSupabaseRequestHeaders();
  headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(getSupabaseAuthEndpoint('/user'), { headers, cache: 'no-store' });
  if (!response.ok) return null;
  return response.json().catch(() => null) as Promise<DlavieSupabaseUser | null>;
}

export async function getDlavieUserFromRequest(request: Request) {
  return validateDlavieAccessToken(readCookie(request.headers.get('cookie'), DLAVIE_ACCESS_COOKIE));
}
