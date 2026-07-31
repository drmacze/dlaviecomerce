'use client';

import type { ReactNode } from 'react';
import { DlavieMotionProvider } from './motion/DlavieMotionProvider';
import { RouteLoadingGate } from '../src/components/loading/RouteLoadingGate';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <DlavieMotionProvider>
      <RouteLoadingGate />
      {children}
    </DlavieMotionProvider>
  );
}
