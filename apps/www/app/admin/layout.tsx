import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../../src/styles/admin.css';

export const metadata: Metadata = {
  title: 'DLavie Commerce Admin',
  description: 'Secure commerce operations console for DLavie.',
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
