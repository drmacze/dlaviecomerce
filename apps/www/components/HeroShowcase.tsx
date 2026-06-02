'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, registerDlavieGsap, ScrollTrigger, SplitText } from '@dlavie/animations';
import { CircularText } from './CircularText';
import { CloudMenuOverlay } from './CloudMenuOverlay';
import { ShinyText } from './ShinyText';
import { DlavieShaderBackdrop } from './webgl/DlavieShaderBackdrop';

const productLines = [
  ['DlavieOS', 'AI workspace, agents, prompts'],
  ['Commerce', 'PPOB rails, checkout, provider logs'],
  ['Automation', 'Triggers, reminders, system flows'],
];

export function HeroShowcase() {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    registerDlavieGsap();
    const element = root.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      split = new SplitText('.dlv-cloud-title', { type: 'chars,words', charsClass: 'dlv-cloud-char' });
      gsap.set(split.chars, { autoAlpha: 0, yPercent: 72, rotateX: -18 });
      gsap.set('.dlv-cloud-word', { autoAlpha: 0, yPercent: 86, rotateX: -20, filter: 'blur(10px)' });
      gsap.set('.dlv-cloud-logo-row', { autoAlpha: 0, visibility: 'hidden', y: 58, pointerEvents: 'none' });
      gsap.set('.dlv-cloud-reveal', { autoAlpha: 0, y: 42, filter: 'blur(12px)' });
      gsap.set('.dlv-cloud-preview', { autoAlpha: 0, y: 120, scale: 0.95 });
      gsap.set('.dlv-cloud-terminal-line span', { scaleX: 0, transformOrigin: 'left center' });

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: element,
          start: 'top top',
          end: '+=540%',
          scrub: 0.9,
          pin: '.dlv-cloud-stage',
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress.toFixed(4);
            document.documentElement.style.setProperty('--dlv-scroll-progress', progress);
            document.documentElement.style.setProperty('--dlv-zoom-progress', progress);
            document.documentElement.style.setProperty('--dlv-scroll-velocity', Math.min(Math.abs(self.getVelocity()) / 1800, 1).toFixed(4));
            document.documentElement.style.setProperty('--dlv-cloud-scroll', progress);
          },
        },
      })
        .to(split.chars, { autoAlpha: 1, yPercent: 0, rotateX: 0, stagger: 0.018, duration: 0.34 }, 0)
        .to('.dlv-cloud-hero-main', { y: -34, scale: 0.96, autoAlpha: 0.9, duration: 0.38 }, 0.08)
        .to('.dlv-cloud-hero-main', { autoAlpha: 0, y: -118, scale: 0.88, filter: 'blur(8px)', duration: 0.34 }, 0.52)
        .to('.dlv-cloud-word', { autoAlpha: 1, yPercent: 0, rotateX: 0, filter: 'blur(0px)', stagger: 0.08, duration: 0.56 }, 0.82)
        .to('.dlv-cloud-logo-row', { autoAlpha: 1, visibility: 'visible', y: 0, duration: 0.5 }, 1.0)
        .to('.dlv-cloud-word-row', { autoAlpha: 0, y: -80, scale: 0.88, filter: 'blur(12px)', duration: 0.42 }, 1.58)
        .to('.dlv-cloud-logo-row', { autoAlpha: 0, visibility: 'hidden', y: 40, duration: 0.34 }, 1.62)
        .to('.dlv-cloud-beat-one', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, 1.82)
        .to('.dlv-cloud-beat-one', { autoAlpha: 0, y: -54, filter: 'blur(10px)', duration: 0.38 }, 2.42)
        .to('.dlv-cloud-beat-two', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, 2.58)
        .to('.dlv-cloud-beat-two', { autoAlpha: 0, y: -54, filter: 'blur(10px)', duration: 0.38 }, 3.18)
        .to('.dlv-cloud-beat-three', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, 3.34)
        .to('.dlv-cloud-preview', { autoAlpha: 1, y: 0, scale: 1, duration: 0.74 }, 3.58)
        .to('.dlv-cloud-terminal-line span', { scaleX: 1, stagger: 0.09, duration: 0.68 }, 3.68)
        .to('.dlv-cloud-beat-three', { autoAlpha: 0, y: -68, scale: 0.9, filter: 'blur(12px)', duration: 0.42 }, 4.34)
        .to('.dlv-cloud-preview', { autoAlpha: 0, y: 90, scale: 0.94, filter: 'blur(8px)', duration: 0.42 }, 4.48)
        .set('.dlv-cloud-hero-main, .dlv-cloud-word-row, .dlv-cloud-logo-row, .dlv-cloud-beat-one, .dlv-cloud-beat-two, .dlv-cloud-beat-three, .dlv-cloud-preview', { autoAlpha: 0 }, 4.9)
        .to('.dlv-cloud-final', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.78 }, 5.02);
    }, element);

    return () => {
      split?.revert();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <main ref={root} className="dlv-cloud-page">
      <div className="dlv-cloud-stage">
        <DlavieShaderBackdrop className="dlv-cloud-shader" />
        <div className="dlv-cloud-css-mist" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="dlv-cloud-grain" aria-hidden="true" />

        <nav className="dlv-cloud-nav" aria-label="Dlavie primary navigation">
          <a href="#top" className="dlv-cloud-brand" aria-label="Dlavie homepage">
            <span className="dlv-cloud-mark"><span>D</span><CircularText text="DLAVIE INTELLIGENT*" spinDuration={22} className="dlv-nav-orbit" /></span>
          </a>
          <div className="dlv-cloud-nav-actions">
            <a className="dlv-cloud-nav-pill" href="#cloud-preview"><ShinyText>Try DlavieOS</ShinyText></a>
            <button className="dlv-cloud-menu" type="button" aria-label="Open DlavieOS menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span /></button>
          </div>
        </nav>
        <CloudMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />

        <section id="top" className="dlv-cloud-hero-main" aria-labelledby="dlavie-cloud-title">
          <div className="dlv-cloud-icon" aria-hidden="true"><span className="dlv-cloud-blob"><span>D</span></span></div>
          <h1 id="dlavie-cloud-title" className="dlv-cloud-title">DLavie</h1>
          <p>Produk commerce, AI, dan automation untuk membangun kehidupan digital yang lebih sederhana.</p>
          <div className="dlv-cloud-cta-row"><a href="#cloud-preview" className="dlv-cloud-cta primary"><ShinyText>Try DlavieOS</ShinyText></a><a href="#cloud-story" className="dlv-cloud-cta secondary">Lihat Ecosystem</a></div>
        </section>

        <div className="dlv-cloud-word-row" aria-hidden="true"><span className="dlv-cloud-word">Commerce.</span><span className="dlv-cloud-word">AI.</span><span className="dlv-cloud-word">Automation.</span></div>
        <div className="dlv-cloud-logo-row" aria-label="Dlavie product areas"><span>commerce</span><span>ai</span><span>automation</span></div>

        <section id="cloud-story" className="dlv-cloud-beat dlv-cloud-beat-one dlv-cloud-reveal" aria-label="Dlavie story one"><span>01 / DlavieOS cloud</span><h2>One calm interface for digital products.</h2><p>DLavie menyatukan transaksi, AI workspace, identity, dan automation dalam satu sistem brand.</p></section>
        <section className="dlv-cloud-beat dlv-cloud-beat-two dlv-cloud-reveal" aria-label="Dlavie story two"><span>02 / motion engine</span><h2>Scroll feels still. The product appears from inside.</h2><p>Lenis smooth scroll dan GSAP ScrollTrigger membuat copy, preview, dan background bergerak pelan mengikuti momentum.</p></section>
        <section className="dlv-cloud-beat dlv-cloud-beat-three dlv-cloud-reveal" aria-label="Dlavie story three"><span>03 / DlavieOS intelligence</span><h2>Commerce, AI, and automation in one field.</h2><p>Setiap layer muncul sebagai product moment, bukan grid card yang memenuhi layar.</p></section>

        <section id="cloud-preview" className="dlv-cloud-preview" aria-label="DlavieOS product preview">
          <div className="dlv-cloud-window-head"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /><strong>DlavieOS</strong><small>ecosystem preview</small></div>
          <div className="dlv-cloud-window-body">{productLines.map(([title, detail]) => <div className="dlv-cloud-terminal-line" key={title}><b>{title}</b><p>{detail}</p><span /></div>)}</div>
        </section>

        <section className="dlv-cloud-final dlv-cloud-reveal" aria-label="Dlavie final call to action"><span>DLAVIE INC.</span><h2>Digital life, simplified.</h2><a href="#top" className="dlv-cloud-cta primary"><ShinyText>Try DlavieOS</ShinyText></a></section>
      </div>
    </main>
  );
}
