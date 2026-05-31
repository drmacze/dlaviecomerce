'use client';

import { gsap, registerDlavieGsap, scrollToTarget } from '@dlavie/animations';
import { useEffect, useRef, useState } from 'react';
import { DlavieMenuOverlay } from './navigation/DlavieMenuOverlay';

export function TopNav() {
  const mark = useRef<HTMLSpanElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('top');

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

  useEffect(() => {
    const onState = (event: Event) => {
      const state = (event as CustomEvent<{ progress: number }>).detail;
      if (!state) return;
      if (state.progress < 0.18) setActive('top');
      else if (state.progress < 0.55) setActive('cinematic');
      else if (state.progress < 0.82) setActive('ecosystem');
      else setActive('roadmap');
    };
    window.addEventListener('dlavie:scroll-state', onState);
    return () => window.removeEventListener('dlavie:scroll-state', onState);
  }, []);

  const onAnchor = (target: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToTarget(target, 92);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="dlv-top-nav" aria-label="Primary navigation">
        <a className="dlv-brand" href="#top" aria-label="Dlavie homepage" onClick={onAnchor('#top')}>
          <span ref={mark} className="dlv-brand-mark" aria-hidden="true">D</span>
          <span>Dlavie</span>
        </a>

        <nav className="dlv-nav-links" aria-label="Dlavie product navigation">
          <a data-active={active === 'cinematic'} href="#cinematic" onClick={onAnchor('#cinematic')}>Cinematic</a>
          <a data-active={active === 'ecosystem'} href="#ecosystem" onClick={onAnchor('#ecosystem')}>Ecosystem</a>
          <a data-active={active === 'roadmap'} href="#roadmap" onClick={onAnchor('#roadmap')}>Roadmap</a>
        </nav>

        <div className="dlv-nav-actions">
          <a className="dlv-nav-cta" href="#cinematic" onClick={onAnchor('#cinematic')}>Enter core</a>
          <button className={menuOpen ? 'dlv-menu-button is-open' : 'dlv-menu-button'} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="dlv-menu-panel" onClick={() => setMenuOpen((value) => !value)}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>
      <DlavieMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
