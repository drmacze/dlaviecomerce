'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ChromePillProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ChromePill — eyebrow label with GSAP shimmer sweep + border pulse.
 */
export function ChromePill({ children, className = '', style }: ChromePillProps) {
  const pillRef  = useRef<HTMLSpanElement>(null);
  const sweepRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pill  = pillRef.current;
    const sweep = sweepRef.current;
    if (!pill || !sweep) return;

    gsap.set(sweep, { x: '-130%', skewX: -20, opacity: 0 });

    // Sweep loop
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
    tl.to(sweep, {
      x: '230%',
      opacity: 1,
      duration: 0.8,
      ease: 'power1.inOut',
    })
    .set(sweep, { opacity: 0 });

    // Border glow pulse
    gsap.to(pill, {
      boxShadow: '0 0 18px 2px rgba(210,210,240,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
      duration: 1.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => { tl.kill(); gsap.killTweensOf(pill); };
  }, []);

  return (
    <span ref={pillRef} className={`chrome-pill ${className}`} style={style}>
      <span ref={sweepRef} className="chrome-pill__sweep" aria-hidden="true" />
      <span className="chrome-pill__text">{children}</span>
    </span>
  );
}
