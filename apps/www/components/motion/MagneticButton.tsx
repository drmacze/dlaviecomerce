'use client';

import { gsap, registerDlavieGsap } from '@dlavie/animations';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

type MagneticButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

export function MagneticButton({ children, className = '', ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    registerDlavieGsap();
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;

    const move = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.28;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.38;
      gsap.to(element, { x, y, rotate: x * 0.02, duration: 0.45, ease: 'dlaviePremium' });
    };
    const leave = () => gsap.to(element, { x: 0, y: 0, rotate: 0, duration: 0.62, ease: 'elastic.out(1, 0.45)' });
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('blur', leave);
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('blur', leave);
    };
  }, []);

  return (
    <a ref={ref} className={className} data-motion="magnetic" {...props}>
      <span className="dlv-magnetic-label">{children}</span>
    </a>
  );
}
