import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dlavie — Digital life, simplified.',
  description: 'Dlavie parent technology brand for commerce, AI, and automation.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
