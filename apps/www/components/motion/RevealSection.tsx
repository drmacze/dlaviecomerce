'use client';

import { createElement, type ReactNode, type CSSProperties } from 'react';

type MotionType = 'reveal' | 'parallax' | 'depth-card' | 'split-reveal';

interface RevealSectionProps {
  children: ReactNode;
  /** GSAP motion type — maps to data-motion attribute */
  motion?: MotionType;
  /** Marks this as a named scroll section (tracked by scroll-engine) */
  sectionId?: string;
  delay?: number;
  speed?: number;
  depth?: number;
  stagger?: number;
  as?: keyof JSX.IntrinsicElements;
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
  as = 'div',
  className,
  style,
  id,
}: RevealSectionProps) {
  return createElement(
    as,
    {
      id,
      className,
      style,
      'data-motion': motion,
      ...(sectionId !== undefined ? { 'data-scroll-section': sectionId } : {}),
      ...(delay   !== undefined ? { 'data-delay':   delay   } : {}),
      ...(speed   !== undefined ? { 'data-speed':   speed   } : {}),
      ...(depth   !== undefined ? { 'data-depth':   depth   } : {}),
      ...(stagger !== undefined ? { 'data-stagger': stagger } : {}),
    },
    children,
  );
}
