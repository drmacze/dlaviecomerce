import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dlavie — Crafting digital ecosystems for modern life.',
  description: 'Dlavie is a parent technology brand building commerce, AI, and automation products.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
