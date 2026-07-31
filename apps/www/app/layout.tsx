import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { Barlow_Condensed, Inter } from 'next/font/google';
import { SmoothScrollProvider } from '../components/SmoothScrollProvider';
import { HomeWordmark } from '../src/components/brand/HomeWordmark';
import { LocaleExperience } from '../src/components/i18n/LocaleExperience';
import {
  DLAVIE_LOCALE_COOKIE,
  localeFromCountry,
  normalizeLocale,
} from '../src/i18n/config';
import 'lenis/dist/lenis.css';
import './globals.css';
import './cinematic.css';
import '../src/styles/tokens.css';
import '../src/styles/globals.css';
import '../src/styles/motion.css';
import '../src/components/effects/MetallicPaint.css';
import '../src/components/loading/DlavieLoader.css';
import '../src/components/security/CopyProtection.css';
import '../src/components/pwa/InstallTutorial.css';
import '../src/styles/account.css';
import '../src/styles/account-auth.css';
import '../src/styles/ai.css';
import '../src/styles/home.css';
import '../src/styles/commerce.css';
import '../src/styles/brand-experience.css';
import '../src/styles/onboarding-localization.css';

const dlavieDisplay = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const dlavieSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DLavie — AI. Commerce. Automation.',
  description:
    'An intelligent product ecosystem for DlavieOS, AI agents, commerce, and connected operations.',
  icons: {
    icon: '/brand/dlavie-mark.svg',
    shortcut: '/brand/dlavie-mark.svg',
    apple: '/brand/dlavie-mark.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const storedLocale = normalizeLocale(cookieStore.get(DLAVIE_LOCALE_COOKIE)?.value);
  const browserLocale = normalizeLocale(requestHeaders.get('accept-language')?.split(',')[0]);
  const regionLocale = localeFromCountry(requestHeaders.get('x-vercel-ip-country'));
  const locale = storedLocale ?? browserLocale ?? regionLocale;

  return (
    <html lang={locale} data-lenis-root suppressHydrationWarning>
      <body className={`${dlavieDisplay.variable} ${dlavieSans.variable}`} suppressHydrationWarning>
        <LocaleExperience initialLocale={locale}>
          <HomeWordmark />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </LocaleExperience>
      </body>
    </html>
  );
}
