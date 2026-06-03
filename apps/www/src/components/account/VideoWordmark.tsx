'use client';

import { useEffect, useId, useRef } from 'react';
import { gsap } from '@dlavie/animations';
import { useReducedMotion } from '../../motion/useReducedMotion';

const WORDMARK_VIDEO = '/onboarding/gemini_generated_video_CA93A03B.mov';

type VideoWordmarkProps = {
  compact?: boolean;
};

export function VideoWordmark({ compact = false }: VideoWordmarkProps) {
  const maskId = useId().replace(/:/g, '');
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
          rotateX: y * -4,
          rotateY: x * 6,
          duration: 0.8,
          ease: 'power3.out',
        });
      }

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: x * -28,
          y: y * -22,
          duration: 1,
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
    <div ref={wrapRef} className="account-wordmark-stage" data-compact={compact ? 'true' : 'false'} aria-label="DLavie Account">
      <span ref={glowRef} className="account-wordmark-glow" aria-hidden="true" />
      <div ref={wordRef} className="account-wordmark-video-text" aria-hidden="true">
        <svg viewBox="0 0 1200 360" role="img" focusable="false" preserveAspectRatio="xMidYMid meet">
          <defs>
            <mask id={`${maskId}-word`} maskUnits="userSpaceOnUse">
              <rect width="1200" height="360" fill="black" />
              <text x="600" y="230" textAnchor="middle" dominantBaseline="middle">DLAVIE</text>
            </mask>
            <linearGradient id={`${maskId}-stroke`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.72)" />
              <stop offset="48%" stopColor="rgba(255,126,103,0.82)" />
              <stop offset="100%" stopColor="rgba(185,108,255,0.76)" />
            </linearGradient>
          </defs>
          <foreignObject x="0" y="0" width="1200" height="360" mask={`url(#${maskId}-word)`}>
            <video className="account-wordmark-video-fill" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
              <source src={WORDMARK_VIDEO} type="video/quicktime" />
            </video>
          </foreignObject>
          <text className="account-wordmark-outline" x="600" y="230" textAnchor="middle" dominantBaseline="middle" fill="transparent" stroke={`url(#${maskId}-stroke)`}>DLAVIE</text>
        </svg>
        <span>Understand the DLavie ecosystem_</span>
      </div>
    </div>
  );
}
