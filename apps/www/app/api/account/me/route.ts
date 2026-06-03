import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { DLAVIE_ACCESS_COOKIE, type DlavieSupabaseUser } from '../../../../src/lib/supabase/session';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../../src/lib/supabase/url';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json({ authenticated: false });
  }

  let headers: Headers;

  try {
    headers = getSupabaseRequestHeaders();
  } catch {
    return NextResponse.json({ authenticated: false });
  }

  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(getSupabaseAuthEndpoint('/user'), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await response.json().catch(() => null) as DlavieSupabaseUser | null;
  const name = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined;

  return NextResponse.json({
    authenticated: true,
    email: user?.email,
    name,
  });
}
