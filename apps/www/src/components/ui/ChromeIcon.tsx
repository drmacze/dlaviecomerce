'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ChromeIconProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * ChromeIcon — silver/chrome icon wrapper with GSAP sweep shimmer.
 * The sweep is a white diagonal bar that slides across the icon
 * on a looping timeline. Each instance gets its own staggered delay.
 */
export function ChromeIcon({ children, delay = 0, className = '' }: ChromeIconProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const sweep = sweepRef.current;
    if (!wrap || !sweep) return;

    // Reset sweep to start position
    gsap.set(sweep, { x: '-110%', skewX: -18, opacity: 0 });

    // Build looping timeline
    const tl = gsap.timeline({
      repeat: -1,
      delay,
      repeatDelay: 2.5,         // pause between sweeps
    });

    tl.to(sweep, {
      x: '210%',
      opacity: 1,
      duration: 0.65,
      ease: 'power2.inOut',
    })
    .set(sweep, { opacity: 0 });

    // On hover: instant re-trigger
    const onEnter = () => {
      tl.restart();
    };
    wrap.addEventListener('mouseenter', onEnter);

    return () => {
      tl.kill();
      wrap.removeEventListener('mouseenter', onEnter);
    };
  }, [delay]);

  return (
    <div
      ref={wrapRef}
      className={`chrome-icon ${className}`}
      aria-hidden="true"
    >
      {/* Sweep layer */}
      <span ref={sweepRef} className="chrome-icon__sweep" aria-hidden="true" />
      {/* Icon content */}
      <span className="chrome-icon__inner">{children}</span>
    </div>
  );
}
