import type { Metadata } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';
import './globals.css';
import '../src/styles/tokens.css';
import '../src/styles/globals.css';
import '../src/styles/motion.css';

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
  description: 'An intelligent product ecosystem for DlavieOS, AI agents, PPOB commerce, and connected operations.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dlavieDisplay.variable} ${dlavieSans.variable}`}>{children}</body>
    </html>
  );
}
