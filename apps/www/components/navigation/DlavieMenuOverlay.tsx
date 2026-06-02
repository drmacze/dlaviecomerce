'use client';

import { gsap, scrollToTarget } from '@dlavie/animations';
import { useEffect, useRef } from 'react';

const links = [
  { href: '#top', label: 'Top', meta: 'Clean hero' },
  { href: '#cinematic', label: 'Cinematic Core', meta: 'Pinned zoom sequence' },
  { href: '#ecosystem', label: 'Ecosystem', meta: 'Product constellation' },
  { href: '#roadmap', label: 'Roadmap', meta: 'Launch surface' },
  { href: '/motion-lab', label: 'Motion Lab', meta: 'Engine proof' },
];

export function DlavieMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!panel.current || !overlay.current) return;
    if (open) {
      gsap.set(overlay.current, { pointerEvents: 'auto' });
      gsap.fromTo(overlay.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: 'power2.out' });
      gsap.fromTo(panel.current, { autoAlpha: 0, y: -16, scale: 0.96, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.42, ease: 'dlaviePremium' });
      gsap.fromTo('.dlv-menu-link', { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, stagger: 0.045, duration: 0.34, ease: 'dlaviePremium' });
    } else {
      gsap.to(panel.current, { autoAlpha: 0, y: -10, scale: 0.97, duration: 0.2, ease: 'power2.in' });
      gsap.to(overlay.current, { autoAlpha: 0, duration: 0.2, ease: 'power2.in', onComplete: () => gsap.set(overlay.current, { pointerEvents: 'none' }) });
    }
  }, [open]);

  const onLink = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      event.preventDefault();
      scrollToTarget(href, 92);
    }
    onClose();
  };

  return (
    <div ref={overlay} className="dlv-menu-overlay" aria-hidden={!open} onPointerDown={(event) => event.target === overlay.current && onClose()}>
      <div ref={panel} id="dlv-menu-panel" className="dlv-menu-panel" role="dialog" aria-modal="false" aria-label="Dlavie navigation menu">
        <div className="dlv-menu-panel-head">
          <span>DLAVIE / ENGINE MAP</span>
          <button type="button" onClick={onClose} aria-label="Close menu">Close</button>
        </div>
        <nav aria-label="Expanded Dlavie navigation">
          {links.map((link) => (
            <a className="dlv-menu-link" href={link.href} key={link.href} onClick={onLink(link.href)}>
              <strong>{link.label}</strong>
              <span>{link.meta}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
