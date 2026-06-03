'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@dlavie/animations';
import { useReducedMotion } from '../../motion/useReducedMotion';

const WORDMARK_VIDEO = '/onboarding/gemini_generated_video_CA93A03B.mov';

export function VideoWordmark() {
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
          x: x * 18,
          y: y * 12,
          rotateX: y * -2,
          rotateY: x * 3,
          duration: 0.7,
          ease: 'power3.out',
        });
      }

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: x * -24,
          y: y * -18,
          duration: 0.9,
          ease: 'power3.out',
        });
      }
    };

    const handlePointerLeave = () => {
      if (wordRef.current) gsap.to(wordRef.current, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
      if (glowRef.current) gsap.to(glowRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
    };

    wrap.addEventListener('pointermove', handlePointerMove);
    wrap.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      wrap.removeEventListener('pointermove', handlePointerMove);
      wrap.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="account-wordmark-stage" aria-label="DLavie Account">
      <span ref={glowRef} className="account-wordmark-glow" aria-hidden="true" />
      <video className="account-wordmark-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
        <source src={WORDMARK_VIDEO} type="video/quicktime" />
      </video>
      <div ref={wordRef} className="account-wordmark-text" aria-hidden="true">
        <span>DLAVIE</span>
        <small>ACCOUNT</small>
      </div>
    </div>
  );
}
