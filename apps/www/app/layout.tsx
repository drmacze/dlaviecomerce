import type { Metadata } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';
import { SmoothScrollProvider } from '../components/SmoothScrollProvider';
import { LocaleExperience } from '../src/components/i18n/LocaleExperience';
import { getRequestLocale } from '../src/i18n/server';
import 'lenis/dist/lenis.css';
import './globals.css';
import '../src/styles/tokens.css';
import '../src/styles/globals.css';
import '../src/styles/motion.css';
import '../src/components/loading/DlavieLoader.css';
import '../src/components/security/CopyProtection.css';
import '../src/components/pwa/InstallTutorial.css';
import '../src/styles/account.css';
import '../src/styles/account-auth.css';
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
  title: 'DLavie Commerce — Produk Digital Indonesia',
  description:
    'Beli pulsa, paket data, voucher digital, dan produk pembayaran harian melalui katalog DLavie Commerce.',
  icons: {
    icon: '/brand/dlavie-mark.svg',
    shortcut: '/brand/dlavie-mark.svg',
    apple: '/brand/dlavie-mark.svg',
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} data-lenis-root suppressHydrationWarning>
      <body className={`${dlavieDisplay.variable} ${dlavieSans.variable}`} suppressHydrationWarning>
        <LocaleExperience initialLocale={locale}>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </LocaleExperience>
      </body>
    </html>
  );
}
