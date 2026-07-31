import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountOnboardingPage } from '../../../src/components/account/AccountOnboardingPage';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '../../../src/lib/supabase/url';
import { DLAVIE_ACCESS_COOKIE, type DlavieSupabaseUser } from '../../../src/lib/supabase/session';

export const metadata = {
  title: 'Onboarding — DLavie Account',
  description: 'Personalize your DLavie Account language and product experience.',
};

async function getUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const requestHeaders = getSupabaseRequestHeaders();
  requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(getSupabaseAuthEndpoint('/user'), {
    method: 'GET',
    headers: requestHeaders,
    cache: 'no-store',
  });
  if (!response.ok) return null;

  try {
    return (await response.json()) as DlavieSupabaseUser;
  } catch {
    return null;
  }
}

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect('/account/login');

  const completed = typeof user.user_metadata?.onboarding_completed_at === 'string';
  if (completed) redirect('/account/dashboard');

  const requestHeaders = await headers();
  const storedCountry =
    typeof user.user_metadata?.country_code === 'string' ? user.user_metadata.country_code : undefined;
  const detectedCountry = requestHeaders.get('x-vercel-ip-country') ?? undefined;

  return <AccountOnboardingPage defaultCountry={storedCountry ?? detectedCountry} />;
}
