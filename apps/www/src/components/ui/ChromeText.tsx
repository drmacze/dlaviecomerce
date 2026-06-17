'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ChromeTextProps {
  children: React.ReactNode;
  className?: string;
}

export function ChromeText({ children, className = '' }: ChromeTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Animate opacity in a shimmer pulse — safe, no CSS var needed
    // The gradient is static; we animate a brightness overlay instead
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(el, {
      filter: 'brightness(1.6)',
      duration: 1.8,
      ease: 'sine.inOut',
    });

    return (): void => { tl.kill(); };
  }, []);

  return (
    <span ref={ref} className={`chrome-text ${className}`}>
      {children}
    </span>
  );
}
