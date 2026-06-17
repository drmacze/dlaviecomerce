'use client';

import type { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import { ScrollOrchestrator } from './ScrollOrchestrator';
import { ScrollProgress } from './ScrollProgress';
import { CinematicCursor } from './CinematicCursor';

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
