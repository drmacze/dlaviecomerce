import { NextResponse } from 'next/server';
import { getSupabaseAuthEndpoint } from '../../../../../src/lib/supabase/url';

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const callback = new URL('/account/oauth/callback', origin);
  callback.searchParams.set('next', '/ai');
  const authorize = new URL(getSupabaseAuthEndpoint('/authorize'));
  authorize.searchParams.set('provider', 'google');
  authorize.searchParams.set('redirect_to', callback.toString());
  return NextResponse.redirect(authorize);
}
