import type { Metadata } from 'next';
import './globals.css';
import '../src/styles/tokens.css';
import '../src/styles/globals.css';
import '../src/styles/motion.css';

export const metadata: Metadata = {
  title: 'DLavie — AI, commerce, and automation operating layer.',
  description: 'DLavie is the parent brand behind DlavieOS, DLavie AI Agents, Commerce/PPOB rails, and workflow automation.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
