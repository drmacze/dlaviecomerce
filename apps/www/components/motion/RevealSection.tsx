'use client';

import type { ReactNode, CSSProperties, HTMLAttributes } from 'react';

type MotionType = 'reveal' | 'parallax' | 'depth-card' | 'split-reveal';

interface RevealSectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  motion?: MotionType;
  sectionId?: string;
  delay?: number;
  speed?: number;
  depth?: number;
  stagger?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * RevealSection — wraps any block with data-motion attribute for GSAP pickup.
 * Renders as a <div> by default. For semantic headings use data-motion directly on the element.
 */
export function RevealSection({
  children,
  motion = 'reveal',
  sectionId,
  delay,
  speed,
  depth,
  stagger,
  className,
  style,
  id,
  ...rest
}: RevealSectionProps) {
  return (
    <div
      {...rest}
      id={id}
      className={className}
      style={style}
      data-motion={motion}
      data-scroll-section={sectionId}
      data-delay={delay}
      data-speed={speed}
      data-depth={depth}
      data-stagger={stagger}
    >
      {children}
    </div>
  );
}
