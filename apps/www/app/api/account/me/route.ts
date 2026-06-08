import { NextResponse, type NextRequest } from 'next/server';
import { createAccountSessionView, createUnauthenticatedAccountSession } from '../../../../src/lib/supabase/account-session';
import { DLAVIE_ACCESS_COOKIE } from '../../../../src/lib/supabase/session';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../../src/lib/supabase/url';

type SupabaseUserPayload = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  identities?: Array<{ provider?: string; identity_data?: Record<string, unknown> }>;
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(DLAVIE_ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: true, account: createUnauthenticatedAccountSession(), providers: [] });
  }

  try {
    const headers = getSupabaseRequestHeaders();
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(getSupabaseAuthEndpoint('/user'), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ ok: true, account: createUnauthenticatedAccountSession(), providers: [] });
    }

    const user = (await response.json().catch(() => ({}))) as SupabaseUserPayload;
    if (!user.id) {
      return NextResponse.json({ ok: true, account: createUnauthenticatedAccountSession(), providers: [] });
    }

    const providers = Array.from(
      new Set((user.identities ?? []).map((identity) => identity.provider).filter((provider): provider is string => Boolean(provider))),
    );

    return NextResponse.json({ ok: true, account: createAccountSessionView(user), providers });
  } catch {
    return NextResponse.json({ ok: true, account: createUnauthenticatedAccountSession(), providers: [] });
  }
}
