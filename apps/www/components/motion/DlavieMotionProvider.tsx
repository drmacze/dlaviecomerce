'use client';

import type { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import { ScrollOrchestrator } from './ScrollOrchestrator';
import { ScrollProgress } from './ScrollProgress';
import { CinematicCursor } from './CinematicCursor';

/**
 * DlavieMotionProvider
 *
 * Root cinematic scroll provider. Wraps the entire app with:
 *  - Lenis smooth scroll (cinematic tuning)
 *  - GSAP ScrollTrigger sync via ScrollOrchestrator
 *  - Scroll progress bar
 *  - Cinematic cursor trail (desktop only)
 *
 * Lenis options explained:
 *  duration       : 1.35s — slightly slower than default for that "film" feel
 *  easing         : cubic-bezier that starts slow, accelerates, then eases out
 *  smoothWheel    : true  — smooth native wheel delta
 *  wheelMultiplier: 0.88  — slightly reduced for controlled scroll speed
 *  touchMultiplier: 1.12  — slightly amplified on touch for natural feel
 *  infinite       : false — standard bounded scroll
 *  anchors        : true  — smooth-scroll to hash anchors
 *  autoRaf        : false — GSAP ticker drives RAF, not browser rAF
 */
export function DlavieMotionProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        duration: 1.35,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.88,
        touchMultiplier: 1.12,
        infinite: false,
        anchors: true,
      }}
    >
      <ScrollOrchestrator />
      <ScrollProgress />
      <CinematicCursor />
      {children}
    </ReactLenis>
  );
}
