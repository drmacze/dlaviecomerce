'use client';

import { createElement, type ReactNode, type CSSProperties, type ElementType } from 'react';

type MotionType = 'reveal' | 'parallax' | 'depth-card' | 'split-reveal';

interface RevealSectionProps {
  children: ReactNode;
  motion?: MotionType;
  sectionId?: string;
  delay?: number;
  speed?: number;
  depth?: number;
  stagger?: number;
  /** Any valid HTML tag string, e.g. "div", "section", "h2" */
  as?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

export function RevealSection({
  children,
  motion = 'reveal',
  sectionId,
  delay,
  speed,
  depth,
  stagger,
  as = 'div',
  className,
  style,
  id,
}: RevealSectionProps) {
  const props: Record<string, unknown> = {
    id,
    className,
    style,
    'data-motion': motion,
  };

  if (sectionId !== undefined) props['data-scroll-section'] = sectionId;
  if (delay     !== undefined) props['data-delay']           = delay;
  if (speed     !== undefined) props['data-speed']           = speed;
  if (depth     !== undefined) props['data-depth']           = depth;
  if (stagger   !== undefined) props['data-stagger']         = stagger;

  return createElement(as as ElementType, props, children);
}
