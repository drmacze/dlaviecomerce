'use client';

import { useEffect, useRef } from 'react';
import { gsap, scrollToTarget } from '@dlavie/animations';

const menuItems = [
  { href: '#top', label: 'DlavieOS', meta: 'AI operating surface' },
  { href: '#cloud-story', label: 'Commerce', meta: 'Digital transaction rails' },
  { href: '#cloud-preview', label: 'Automation', meta: 'Flows and system triggers' },
  { href: '#cloud-preview', label: 'Ecosystem', meta: 'One parent cloud' },
  { href: '/motion-lab', label: 'Motion Lab', meta: 'GSAP + Lenis proof' },
];

export function CloudMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlayEl = overlay.current;
    const panelEl = panel.current;
    if (!overlayEl || !panelEl) return;

    if (open) {
      gsap.set(overlayEl, { pointerEvents: 'auto' });
      gsap.fromTo(overlayEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power2.out' });
      gsap.fromTo(panelEl, { autoAlpha: 0, y: -18, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'dlaviePremium' });
      gsap.fromTo('.dlv-cloud-menu-link', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.045, duration: 0.32, ease: 'dlaviePremium' });
    } else {
      gsap.to(panelEl, { autoAlpha: 0, y: -10, scale: 0.97, duration: 0.18, ease: 'power2.in' });
      gsap.to(overlayEl, { autoAlpha: 0, duration: 0.18, ease: 'power2.in', onComplete: () => gsap.set(overlayEl, { pointerEvents: 'none' }) });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div ref={overlay} className="dlv-cloud-menu-overlay" aria-hidden={!open} onPointerDown={(event) => event.target === overlay.current && onClose()}>
      <div ref={panel} className="dlv-cloud-menu-panel" role="dialog" aria-label="DlavieOS navigation" aria-modal="false">
        <div className="dlv-cloud-menu-head"><span>DlavieOS</span><button type="button" onClick={onClose}>Close</button></div>
        <p>Navigate the parent cloud for Commerce, AI, Automation, and the motion engine.</p>
        <nav aria-label="DlavieOS menu">
          {menuItems.map((item) => (
            <a className="dlv-cloud-menu-link" href={item.href} key={`${item.href}-${item.label}`} onClick={(event) => {
              if (item.href.startsWith('#')) {
                event.preventDefault();
                scrollToTarget(item.href, 84);
              }
              onClose();
            }}>
              <strong>{item.label}</strong>
              <small>{item.meta}</small>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
