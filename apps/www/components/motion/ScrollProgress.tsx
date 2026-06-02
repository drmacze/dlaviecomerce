'use client';

import { gsap, registerDlavieGsap } from '@dlavie/animations';
import { useEffect, useRef } from 'react';

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerDlavieGsap();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !bar.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 } });
    });
    return () => ctx.revert();
  }, []);

  return <div className="dlv-scroll-progress" ref={bar} aria-hidden="true" />;
}
