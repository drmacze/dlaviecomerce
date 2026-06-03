'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@dlavie/animations';
import { useReducedMotion } from '../../motion/useReducedMotion';

type VideoWordmarkProps = {
  compact?: boolean;
};

export function VideoWordmark({ compact = false }: VideoWordmarkProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || reducedMotion) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      if (wordRef.current) {
        gsap.to(wordRef.current, {
          x: x * 12,
          y: y * 8,
          rotateX: y * -2,
          rotateY: x * 3,
          duration: 0.9,
          ease: 'power3.out',
        });
      }

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: x * -22,
          y: y * -18,
          duration: 1,
          ease: 'power3.out',
        });
      }
    };

    const handlePointerLeave = () => {
      if (wordRef.current) gsap.to(wordRef.current, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' });
      if (glowRef.current) gsap.to(glowRef.current, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    };

    wrap.addEventListener('pointermove', handlePointerMove);
    wrap.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      wrap.removeEventListener('pointermove', handlePointerMove);
      wrap.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="account-wordmark-stage" data-compact={compact ? 'true' : 'false'} aria-label="DLavie Account">
      <span ref={glowRef} className="account-wordmark-glow" aria-hidden="true" />
      <div ref={wordRef} className="account-wordmark-plain" aria-hidden="true">
        <strong>DLavie</strong>
        <span>Understand the ecosystem_</span>
      </div>
    </div>
  );
}
