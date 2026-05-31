'use client';

import type { ReactNode } from 'react';
import { DlavieMotionProvider } from './motion/DlavieMotionProvider';

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return <DlavieMotionProvider>{children}</DlavieMotionProvider>;
}
