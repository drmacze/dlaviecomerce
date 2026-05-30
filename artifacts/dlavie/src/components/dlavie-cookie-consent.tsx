import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const COOKIE_KEY = 'dlavie_cookie_consent_v1';
type ConsentValue = 'accepted' | 'essential';

function readConsent() {
  try {
    return Boolean(localStorage.getItem(COOKIE_KEY));
  } catch {
    return false;
  }
}

function saveConsent(value: ConsentValue) {
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ value, savedAt: new Date().toISOString() }));
  } catch {
    // Storage can be blocked in private mode. Consent UI should still close gracefully.
  }
}

export function DlavieCookieConsent() {
  const rootRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLSpanElement | null>(null);
  const scanRef = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!readConsent()) setVisible(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || !rootRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.set(rootRef.current, { x: reduceMotion ? 0 : 120, autoAlpha: 0, scale: reduceMotion ? 1 : 0.96, filter: reduceMotion ? 'none' : 'blur(8px)' });
      gsap.to(rootRef.current, {
        x: 0,
        autoAlpha: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: reduceMotion ? 0.18 : 0.72,
        ease: 'expo.out'
      });

      if (!reduceMotion) {
        gsap.to(glowRef.current, { xPercent: 8, yPercent: -6, scale: 1.08, duration: 5.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.fromTo(scanRef.current, { xPercent: -160, autoAlpha: 0 }, { xPercent: 430, autoAlpha: 0.9, duration: 1.25, delay: 0.8, repeat: -1, repeatDelay: 3.8, ease: 'power2.inOut' });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [visible]);

  function closeWith(value: ConsentValue) {
    saveConsent(value);
    const node = rootRef.current;
    if (!node) {
      setVisible(false);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(node, {
      x: reduceMotion ? 0 : 130,
      autoAlpha: 0,
      scale: reduceMotion ? 1 : 0.97,
      filter: reduceMotion ? 'none' : 'blur(7px)',
      duration: reduceMotion ? 0.16 : 0.38,
      ease: 'power3.in',
      onComplete: () => setVisible(false)
    });
  }

  if (!visible) return null;

  return (
    <section ref={rootRef} className="fixed bottom-4 right-3 z-[80] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.45rem] p-[1px] text-white opacity-0 shadow-[0_24px_80px_rgba(0,0,0,.34)] md:bottom-5 md:right-5" aria-label="Cookie consent">
      <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[linear-gradient(145deg,rgba(4,8,22,.94),rgba(8,16,38,.86)_52%,rgba(10,8,26,.92))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.13)] backdrop-blur-2xl">
        <span ref={glowRef} className="pointer-events-none absolute -inset-12 bg-[radial-gradient(circle_at_12%_22%,rgba(69,213,255,.58),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(231,40,255,.42),transparent_34%),radial-gradient(circle_at_74%_88%,rgba(223,255,79,.36),transparent_30%)] opacity-45 blur-3xl" aria-hidden="true" />
        <span ref={scanRef} className="pointer-events-none absolute left-0 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0" aria-hidden="true" />

        <div className="relative z-10 flex gap-3">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/10 before:absolute before:-inset-1 before:-z-10 before:rounded-full before:bg-[conic-gradient(from_0deg,transparent,#dfff4f,#45d5ff,transparent_68%)] before:opacity-80 before:blur-[1px]">
            <span className="h-3 w-3 rounded-full bg-[#dfff4f] shadow-[0_0_24px_rgba(223,255,79,.76)]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">DLAVIE Cookies</p>
                <h2 className="mt-1 text-sm font-black tracking-[-0.02em] text-white">Biar pengalamanmu lebih halus.</h2>
              </div>
              <button type="button" onClick={() => closeWith('essential')} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black text-white/45 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white" aria-label="Tutup cookie popup">×</button>
            </div>

            <p className="mt-2 text-[11px] font-semibold leading-5 text-white/58">Kami memakai cookie penting untuk login, keamanan, preferensi tampilan, dan membuat DLAVIE terasa cepat di perangkatmu.</p>

            <div className="mt-3 grid grid-cols-[.82fr_1.18fr] gap-2">
              <button type="button" onClick={() => closeWith('essential')} className="rounded-full bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/58 ring-1 ring-white/10 transition hover:bg-white/14 hover:text-white">Essential</button>
              <button type="button" onClick={() => closeWith('accepted')} className="rounded-full bg-[#dfff4f] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_12px_30px_rgba(223,255,79,.22)] transition hover:scale-[1.02] active:scale-[.98]">Accept All</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
