import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COUNTRY_OPTIONS, DLAVIE_LOCALE_COOKIE, localeFromCountry } from '../../../../src/i18n/config';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../../src/lib/supabase/url';
import { DLAVIE_ACCESS_COOKIE, isSecureCookieRuntime } from '../../../../src/lib/supabase/session';

const DISCOVERY_VALUES = new Set([
  'search',
  'social',
  'recommendation',
  'community',
  'media',
  'existing-product',
  'other',
]);
const ROLE_VALUES = new Set([
  'personal',
  'business-owner',
  'operator',
  'technology',
  'partner',
  'exploring',
]);
const GOAL_VALUES = new Set(['shop', 'business', 'automation', 'ai', 'partnership']);
const COUNTRY_VALUES = new Set(COUNTRY_OPTIONS.map((item) => item.code));

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ ok: false, message: 'Authentication is required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const country = String(body.country ?? '').trim().toUpperCase();
  const discovery = String(body.discovery ?? '').trim();
  const role = String(body.role ?? '').trim();
  const goals = Array.isArray(body.goals)
    ? body.goals.map((value: unknown) => String(value)).filter((value: string) => GOAL_VALUES.has(value))
    : [];

  if (!COUNTRY_VALUES.has(country as (typeof COUNTRY_OPTIONS)[number]['code'])) {
    return NextResponse.json({ ok: false, message: 'Select a valid country or region.' }, { status: 400 });
  }
  if (!DISCOVERY_VALUES.has(discovery) || !ROLE_VALUES.has(role) || goals.length === 0) {
    return NextResponse.json({ ok: false, message: 'Complete all onboarding fields.' }, { status: 400 });
  }

  const locale = localeFromCountry(country);
  const requestHeaders = getSupabaseRequestHeaders();
  requestHeaders.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(getSupabaseAuthEndpoint('/user'), {
    method: 'PUT',
    headers: requestHeaders,
    body: JSON.stringify({
      data: {
        country_code: country,
        locale,
        discovery_source: discovery,
        user_role: role,
        onboarding_goals: goals,
        onboarding_completed_at: new Date().toISOString(),
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      typeof payload?.msg === 'string'
        ? payload.msg
        : typeof payload?.error_description === 'string'
          ? payload.error_description
          : 'Unable to save onboarding preferences.';
    return NextResponse.json({ ok: false, message }, { status: response.status || 500 });
  }

  const result = NextResponse.json({ ok: true, locale, redirectTo: '/account/dashboard' });
  result.cookies.set(DLAVIE_LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: 'lax',
    secure: isSecureCookieRuntime(),
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return result;
}
