'use client';

import type { ReactNode, ElementType, CSSProperties } from 'react';

type MotionType = 'reveal' | 'parallax' | 'depth-card' | 'split-reveal';

interface RevealSectionProps {
  children: ReactNode;
  /** GSAP motion type — maps to data-motion attribute */
  motion?: MotionType;
  /** Marks this as a named scroll section (tracked by scroll-engine) */
  sectionId?: string;
  /** Additional data- attributes forwarded to the element */
  delay?: number;
  speed?: number;
  depth?: number;
  stagger?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * RevealSection
 *
 * Thin wrapper that applies the correct data-motion attribute
 * for GSAP to pick up in ScrollOrchestrator / effects.ts.
 *
 * Usage:
 *   <RevealSection motion="reveal" delay={0.1}>
 *     <Card />
 *   </RevealSection>
 *
 *   <RevealSection motion="depth-card" depth={1.5}>
 *     <FeatureCard />
 *   </RevealSection>
 *
 *   <RevealSection motion="split-reveal" as="h2">
 *     The future is AI-native
 *   </RevealSection>
 */
export function RevealSection({
  children,
  motion = 'reveal',
  sectionId,
  delay,
  speed,
  depth,
  stagger,
  as: Tag = 'div',
  className,
  style,
  id,
}: RevealSectionProps) {
  return (
    <Tag
      id={id}
      className={className}
      style={style}
      data-motion={motion}
      data-scroll-section={sectionId !== undefined ? sectionId : undefined}
      data-delay={delay}
      data-speed={speed}
      data-depth={depth}
      data-stagger={stagger}
    >
      {children}
    </Tag>
  );
}
