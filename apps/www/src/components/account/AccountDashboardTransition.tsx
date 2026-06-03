'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, registerDlavieGsap, CustomEase } from '@dlavie/animations';

const STORAGE_KEY = 'dlavie-account-transition';

export function AccountDashboardTransition() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const shouldPlay = window.sessionStorage.getItem(STORAGE_KEY) === 'dashboard';
    if (!shouldPlay) return;

    window.sessionStorage.removeItem(STORAGE_KEY);
    setShouldRender(true);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !shouldRender) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      const fallback = window.setTimeout(() => setShouldRender(false), 420);
      return () => window.clearTimeout(fallback);
    }

    registerDlavieGsap();
    if (!CustomEase.get('dlavieStutter')) {
      CustomEase.create('dlavieStutter', 'M0,0 C0,0 0.052,0.1 0.152,0.1 0.242,0.1 0.299,0.349 0.399,0.349 0.586,0.349 0.569,0.596 0.67,0.624 0.842,0.671 0.95,0.95 1,1');
    }

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>('.account-transition__char');
      const cards = gsap.utils.toArray<HTMLElement>('.dlavie-card__profile, .dlavie-card__details, .dlavie-card__footer');
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => setShouldRender(false),
      });

      tl
        .set(root, { autoAlpha: 1 })
        .fromTo(chars, { yPercent: -110, opacity: 0 }, {
          yPercent: 0,
          opacity: 1,
          duration: 0.48,
          stagger: { each: 0.035, from: 'random' },
        })
        .fromTo('.account-transition__divider', { scaleX: 0, transformOrigin: 'left' }, {
          scaleX: 1,
          duration: 1.45,
          ease: 'dlavieStutter',
        }, '-=0.08')
        .to('.account-transition__mask', {
          scale: 2.7,
          opacity: 0,
          duration: 0.82,
          ease: 'power4.in',
        }, '+=0.1')
        .to(root, { autoAlpha: 0, duration: 0.52, ease: 'power2.out' }, '<0.12')
        .fromTo(cards, { y: 28, opacity: 0, filter: 'blur(18px)' }, {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.08,
          ease: 'power4.out',
        }, '<0.05');
    }, root);

    return () => ctx.revert();
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div ref={rootRef} className="account-transition" aria-hidden="true">
      <div className="account-transition__mask" />
      <div className="account-transition__content">
        <p>Access verified</p>
        <h2 aria-label="DLAVIE">
          {'DLAVIE'.split('').map((char) => (
            <span className="account-transition__slot" key={char}>
              <span className="account-transition__char">{char}</span>
            </span>
          ))}
        </h2>
        <div className="account-transition__divider" />
        <span>Opening your account card</span>
      </div>
    </div>
  );
}
