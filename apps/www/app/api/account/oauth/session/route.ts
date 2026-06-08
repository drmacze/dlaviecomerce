import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateDlavieAccessToken } from '../../../../../src/lib/supabase/server-session';
import { DLAVIE_ACCESS_COOKIE, DLAVIE_REFRESH_COOKIE, isSecureCookieRuntime } from '../../../../../src/lib/supabase/session';

const schema = z.object({ accessToken: z.string().min(1), refreshToken: z.string().min(1), expiresIn: z.number().int().positive().optional() }).strict();

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !(await validateDlavieAccessToken(parsed.data?.accessToken).catch(() => null))) {
    return NextResponse.json({ ok: false, message: 'Invalid social session.' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  const options = { httpOnly: true, sameSite: 'lax' as const, secure: isSecureCookieRuntime(), path: '/' };
  response.cookies.set(DLAVIE_ACCESS_COOKIE, parsed.data.accessToken, { ...options, maxAge: Math.max(parsed.data.expiresIn ?? 3600, 60) });
  response.cookies.set(DLAVIE_REFRESH_COOKIE, parsed.data.refreshToken, { ...options, maxAge: 60 * 60 * 24 * 30 });
  return response;
}
