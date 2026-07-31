import { cookies, headers } from 'next/headers';
import { DLAVIE_LOCALE_COOKIE, localeFromCountry, normalizeLocale, type DlavieLocale } from './config';

export async function getRequestLocale(): Promise<DlavieLocale> {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const storedLocale = normalizeLocale(cookieStore.get(DLAVIE_LOCALE_COOKIE)?.value);
  if (storedLocale) return storedLocale;

  const country = requestHeaders.get('x-vercel-ip-country');
  if (country) return localeFromCountry(country);

  return normalizeLocale(requestHeaders.get('accept-language')?.split(',')[0]) ?? 'en';
}
