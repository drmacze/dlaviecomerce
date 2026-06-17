import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import './globals.css';
import './cinematic.css';

const barlowCondensed = localFont({
  src: [
    { path: '../src/fonts/BarlowCondensed-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../src/fonts/BarlowCondensed-Medium.woff2',  weight: '500', style: 'normal' },
    { path: '../src/fonts/BarlowCondensed-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../src/fonts/BarlowCondensed-Bold.woff2',    weight: '700', style: 'normal' },
  ],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DLavie — AI. Commerce. Automation.',
  description: 'An intelligent product ecosystem for DlavieOS, AI agents, PPOB commerce, and connected operations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
