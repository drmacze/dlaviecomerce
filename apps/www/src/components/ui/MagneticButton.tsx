'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useRef } from 'react';
import { gsap } from '@dlavie/animations';
import { SvgIcon } from './SvgIcon';
import { useReducedMotion } from '../../motion/useReducedMotion';

type MagneticButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  tone?: 'primary' | 'secondary';
};

export function MagneticButton({ children, tone = 'primary', className = '', ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useReducedMotion();

  return (
    <a
      ref={ref}
      className={`magnetic-button ${tone} ${className}`}
      onMouseMove={(event) => {
        if (reducedMotion || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        gsap.to(ref.current, { x: (event.clientX - rect.left - rect.width / 2) * 0.14, y: (event.clientY - rect.top - rect.height / 2) * 0.22, duration: 0.32, ease: 'power3.out' });
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        gsap.to(ref.current, { x: 0, y: 0, duration: 0.45, ease: 'power3.out' });
      }}
      {...props}
    >
      <span>{children}</span><SvgIcon name="arrow" />
    </a>
  );
}
