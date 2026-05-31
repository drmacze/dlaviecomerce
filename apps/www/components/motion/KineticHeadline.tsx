'use client';

import { gsap, registerDlavieGsap, SplitText } from '@dlavie/animations';
import { useEffect, useRef } from 'react';

export function KineticHeadline({ children, id, className }: { children: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    registerDlavieGsap();
    const element = ref.current;
    if (!element) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const compact = window.matchMedia('(max-width: 780px)').matches;
    if (reduce || compact) return;

    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = new SplitText(element, { type: 'words,chars', wordsClass: 'dlv-kinetic-word', charsClass: 'dlv-kinetic-char' });
      gsap.from(split.chars, { yPercent: 112, rotateX: -72, autoAlpha: 0, duration: 1.05, stagger: 0.012, ease: 'dlavieText', delay: 0.15 });
    }, element);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, []);

  return <h1 ref={ref} className={className} id={id}>{children}</h1>;
}
