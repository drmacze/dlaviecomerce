'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ChromeIconProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ChromeIcon({ children, delay = 0, className = '' }: ChromeIconProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const sweep = sweepRef.current;
    if (!wrap || !sweep) return;

    gsap.set(sweep, { x: '-110%', skewX: -18, opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, delay, repeatDelay: 2.5 });
    tl.to(sweep, { x: '210%', opacity: 1, duration: 0.65, ease: 'power2.inOut' })
      .set(sweep, { opacity: 0 });

    const onEnter = (): void => { tl.restart(); };
    wrap.addEventListener('mouseenter', onEnter);

    return (): void => {
      tl.kill();
      wrap.removeEventListener('mouseenter', onEnter);
    };
  }, [delay]);

  return (
    <div ref={wrapRef} className={`chrome-icon ${className}`} aria-hidden="true">
      <span ref={sweepRef} className="chrome-icon__sweep" aria-hidden="true" />
      <span className="chrome-icon__inner">{children}</span>
    </div>
  );
}
