import { NextResponse } from 'next/server';
import { createAccountSessionView, getAccountProviders } from '../../../../src/lib/supabase/account-session';
import { getDlavieUserFromRequest } from '../../../../src/lib/supabase/server-session';

export async function GET(request: Request) {
  const user = await getDlavieUserFromRequest(request).catch(() => null);
  return NextResponse.json({ ok: true, account: createAccountSessionView(user), providers: getAccountProviders(user) });
}
