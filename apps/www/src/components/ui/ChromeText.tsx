'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ChromeTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ChromeText — "Learn more" link with flowing chrome gradient via GSAP.
 * Uses backgroundPosition animation so gradient shifts continuously.
 */
export function ChromeText({ children, className = '' }: ChromeTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // We animate a CSS custom property that shifts backgroundPosition
    gsap.set(el, { '--chrome-pos': '0%' });

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(el, {
      '--chrome-pos': '100%',
      duration: 2.5,
      ease: 'none',
    })
    .to(el, {
      '--chrome-pos': '0%',
      duration: 2.5,
      ease: 'none',
    });

    return () => tl.kill();
  }, []);

  return (
    <span ref={ref} className={`chrome-text ${className}`}>
      {children}
    </span>
  );
}
