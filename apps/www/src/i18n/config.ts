export const DLAVIE_LOCALE_COOKIE = 'dlavie-locale';

export type DlavieLocale = 'id' | 'en';

export const COUNTRY_OPTIONS = [
  { code: 'ID', en: 'Indonesia', id: 'Indonesia' },
  { code: 'SG', en: 'Singapore', id: 'Singapura' },
  { code: 'MY', en: 'Malaysia', id: 'Malaysia' },
  { code: 'PH', en: 'Philippines', id: 'Filipina' },
  { code: 'TH', en: 'Thailand', id: 'Thailand' },
  { code: 'VN', en: 'Vietnam', id: 'Vietnam' },
  { code: 'AU', en: 'Australia', id: 'Australia' },
  { code: 'US', en: 'United States', id: 'Amerika Serikat' },
  { code: 'GB', en: 'United Kingdom', id: 'Britania Raya' },
  { code: 'IN', en: 'India', id: 'India' },
  { code: 'JP', en: 'Japan', id: 'Jepang' },
  { code: 'KR', en: 'South Korea', id: 'Korea Selatan' },
  { code: 'DE', en: 'Germany', id: 'Jerman' },
  { code: 'NL', en: 'Netherlands', id: 'Belanda' },
  { code: 'OTHER', en: 'Other country', id: 'Negara lainnya' },
] as const;

export function normalizeLocale(value: string | null | undefined): DlavieLocale | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'id' || normalized.startsWith('id-')) return 'id';
  if (normalized === 'en' || normalized.startsWith('en-')) return 'en';
  return null;
}

export function localeFromCountry(countryCode: string | null | undefined): DlavieLocale {
  return countryCode?.trim().toUpperCase() === 'ID' ? 'id' : 'en';
}
