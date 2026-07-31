'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LETTERS = ['D', 'L', 'a', 'v', 'i', 'e'];

export function HomeWordmark() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <Link className="home-wordmark" href="/#top" aria-label="DLavie home">
      <span className="home-wordmark__text" aria-hidden="true">
        {LETTERS.map((letter, index) => (
          <span key={`${letter}-${index}`} style={{ '--letter-index': index } as React.CSSProperties}>
            {letter}
          </span>
        ))}
      </span>
      <span className="home-wordmark__descriptor">AI · Commerce · Automation</span>
    </Link>
  );
}
