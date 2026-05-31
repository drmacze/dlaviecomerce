'use client';

import { gsap, registerDlavieGsap, scrollToTarget } from '@dlavie/animations';
import { Menu } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function TopNav() {
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    registerDlavieGsap();
    const element = mark.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const enter = () => gsap.to(element, { rotate: 10, scale: 1.08, duration: 0.28, ease: 'dlaviePremium' });
    const leave = () => gsap.to(element, { rotate: 0, scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)' });
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    return () => {
      element.removeEventListener('pointerenter', enter);
      element.removeEventListener('pointerleave', leave);
    };
  }, []);

  const onAnchor = (target: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToTarget(target, 86);
  };

  return (
    <header className="dlv-top-nav" aria-label="Primary navigation">
      <a className="dlv-brand" href="#top" aria-label="Dlavie homepage" onClick={onAnchor('#top')}>
        <span ref={mark} className="dlv-brand-mark" aria-hidden="true">D</span>
        <span>Dlavie</span>
      </a>

      <nav className="dlv-nav-links" aria-label="Dlavie product navigation">
        <a href="#ecosystem" onClick={onAnchor('#ecosystem')}>Ecosystem</a>
        <a href="#roadmap" onClick={onAnchor('#roadmap')}>Roadmap</a>
        <a href="/motion-lab">Motion Lab</a>
      </nav>

      <div className="dlv-nav-actions">
        <a className="dlv-nav-cta" href="#ecosystem" onClick={onAnchor('#ecosystem')}>Explore ecosystem</a>
        <button className="dlv-menu-button" type="button" aria-label="Open menu">
          <Menu size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
