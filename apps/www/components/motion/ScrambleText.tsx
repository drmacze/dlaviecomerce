'use client';

import { gsap, registerDlavieGsap } from '@dlavie/animations';
import { useEffect, useRef } from 'react';

export function ScrambleText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    registerDlavieGsap();
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { scrambleText: { text: 'DLV_CORE_SYNC', chars: '01×◇△', speed: 0.35 } }, { scrambleText: { text, chars: '01×◇△', revealDelay: 0.12, speed: 0.42 }, duration: 1.35, ease: 'none', delay: 0.25 });
    }, ref);
    return () => ctx.revert();
  }, [text]);

  return <span ref={ref} className={className} data-motion="scramble">{text}</span>;
}
