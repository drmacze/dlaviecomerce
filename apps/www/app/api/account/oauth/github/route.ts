import { NextResponse } from 'next/server';
import { safeRedirectPath } from '../../../../../src/lib/account/security';
import { getSupabaseAuthEndpoint } from '../../../../../src/lib/supabase/url';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = safeRedirectPath(url.searchParams.get('next'), '/ai');
  const callbackUrl = new URL('/account/oauth/callback', url.origin);
  callbackUrl.searchParams.set('next', redirectTo);

  const authorizeUrl = new URL(getSupabaseAuthEndpoint('/authorize'));
  authorizeUrl.searchParams.set('provider', 'github');
  authorizeUrl.searchParams.set('redirect_to', callbackUrl.toString());

  return NextResponse.redirect(authorizeUrl);
}
