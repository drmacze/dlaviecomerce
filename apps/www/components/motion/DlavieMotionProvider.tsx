'use client';

import type { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import { ScrollOrchestrator } from './ScrollOrchestrator';
import { ExperienceMotionDirector } from './ExperienceMotionDirector';
import { CinematicCursor } from './CinematicCursor';

export function DlavieMotionProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.05,
        syncTouch: false,
        overscroll: true,
        infinite: false,
        anchors: true,
      }}
    >
      <ScrollOrchestrator />
      <ExperienceMotionDirector />
      <CinematicCursor />
      {children}
    </ReactLenis>
  );
}
