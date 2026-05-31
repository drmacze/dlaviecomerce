'use client';

import type { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';
import { ScrollOrchestrator } from './ScrollOrchestrator';
import { ScrollProgress } from './ScrollProgress';

export function DlavieMotionProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root autoRaf={false} options={{ duration: 1.08, smoothWheel: true, wheelMultiplier: 0.92, touchMultiplier: 1.08, anchors: true }}>
      <ScrollOrchestrator />
      <ScrollProgress />
      {children}
    </ReactLenis>
  );
}
