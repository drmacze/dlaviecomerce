'use client';

import { Draggable, Flip, gsap, Observer, registerDlavieGsap, scrollToTarget, ScrollTrigger } from '@dlavie/animations';
import { useEffect, useRef, useState } from 'react';
import { DlavieShaderBackdrop } from '../webgl/DlavieShaderBackdrop';
import { MagneticButton } from './MagneticButton';
import { ScrambleText } from './ScrambleText';

const rows = [
  ['ScrollTrigger', 'Hero pin/reveal cards + this lab progress', 'registered / production'],
  ['ScrollToPlugin', 'Lab jump button and nav anchor scrolling', 'registered / production'],
  ['Observer', 'Scroll energy variable and lab wheel/touch counter', 'registered / production'],
  ['SplitText', 'Kinetic headline character reveal', 'registered / production'],
  ['ScrambleTextPlugin', 'Hero eyebrow + lab label', 'registered / production'],
  ['Flip', 'Lab tile layout swap', 'registered / lab'],
  ['MotionPathPlugin', 'Orb follows SVG path', 'registered / lab'],
  ['DrawSVGPlugin', 'Animated SVG circuit stroke', 'registered / lab'],
  ['MorphSVGPlugin', 'Registered; covered in docs, not forced in UI', 'registered / documented'],
  ['Draggable + Inertia', 'Draggable lab puck', 'registered / lab'],
  ['Physics2D/Props', 'Registered; documented for future particles', 'registered / documented'],
  ['CustomEase/EasePack', 'Dlavie easing tokens and lab pulses', 'registered / production'],
];

export function MotionLab() {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const puck = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [events, setEvents] = useState(0);

  useEffect(() => {
    registerDlavieGsap();
    if (!root.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const observer = Observer.create({
      target: root.current,
      type: 'wheel,touch,pointer',
      tolerance: 18,
      onUp: () => setEvents((value) => value + 1),
      onDown: () => setEvents((value) => value + 1),
    });

    const ctx = gsap.context(() => {
      gsap.from('.dlv-lab-hero h1, .dlv-lab-hero p, .dlv-lab-actions', { autoAlpha: 0, y: 28, stagger: 0.09, duration: 0.9, ease: 'dlaviePremium' });
      gsap.from('.dlv-lab-row', { autoAlpha: 0, y: 24, stagger: 0.045, duration: 0.7, ease: 'dlaviePremium', scrollTrigger: { trigger: '.dlv-lab-matrix', start: 'top 78%' } });
      gsap.to('.dlv-lab-orb', { motionPath: { path: '#dlv-lab-path', align: '#dlv-lab-path', alignOrigin: [0.5, 0.5] }, duration: 5.8, repeat: -1, ease: 'none' });
      gsap.fromTo('#dlv-lab-path', { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 2.2, ease: 'dlaviePremium', scrollTrigger: { trigger: '.dlv-lab-path-card', start: 'top 74%' } });
      gsap.to('.dlv-lab-pulse', { scale: 1.08, repeat: -1, yoyo: true, duration: 0.9, ease: 'rough({ template: power2.out, strength: 0.35, points: 12, taper: none, randomize: true, clamp: false })' });
      if (puck.current) {
        Draggable.create(puck.current, { type: 'x,y', bounds: '.dlv-lab-drag', inertia: true });
      }
      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
      observer.kill();
    };
  }, []);

  const runFlip = () => {
    if (!grid.current) return;
    const state = Flip.getState('.dlv-lab-tile');
    setFlipped((value) => !value);
    requestAnimationFrame(() => Flip.from(state, { duration: 0.8, ease: 'dlaviePremium', absolute: true, stagger: 0.04 }));
  };

  return (
    <div className="dlv-lab" ref={root}>
      <DlavieShaderBackdrop />
      <section className="dlv-lab-hero">
        <a className="dlv-lab-back" href="/">← Back to Dlavie</a>
        <p className="dlv-section-kicker"><ScrambleText text="Motion engine validation" /></p>
        <h1>Phase 1.2 Motion Lab</h1>
        <p>Internal proof route for GSAP plugins, Lenis synchronization, WebGL shader ambience, and Webflow-style data-motion conventions.</p>
        <div className="dlv-lab-actions">
          <MagneticButton className="dlv-button primary" href="#matrix">View coverage matrix</MagneticButton>
          <button className="dlv-lab-button" type="button" onClick={() => scrollToTarget('#playground', 84)}>ScrollTo playground</button>
          <span className="dlv-lab-counter">Observer events: {events}</span>
        </div>
      </section>

      <section className="dlv-lab-playground" id="playground" aria-label="Motion playground">
        <div className="dlv-lab-path-card">
          <svg viewBox="0 0 520 220" role="img" aria-label="MotionPath and DrawSVG demo">
            <path id="dlv-lab-path" d="M24 170 C 120 20, 240 210, 330 86 S 452 40, 496 150" fill="none" stroke="rgba(34,211,238,.8)" strokeWidth="4" />
          </svg>
          <span className="dlv-lab-orb" />
          <strong>MotionPath + DrawSVG circuit</strong>
        </div>
        <div className="dlv-lab-drag">
          <div className="dlv-lab-puck" ref={puck}>Drag</div>
          <strong>Draggable + Inertia puck</strong>
        </div>
        <div className="dlv-lab-flip">
          <button className="dlv-lab-button" type="button" onClick={runFlip}>Run FLIP transition</button>
          <div ref={grid} className={flipped ? 'dlv-lab-tiles is-flipped' : 'dlv-lab-tiles'}>
            <span className="dlv-lab-tile dlv-lab-pulse">Commerce</span>
            <span className="dlv-lab-tile">AI</span>
            <span className="dlv-lab-tile">Account</span>
          </div>
        </div>
      </section>

      <section className="dlv-lab-matrix" id="matrix" aria-labelledby="matrix-title">
        <h2 id="matrix-title">Runtime coverage matrix</h2>
        <div className="dlv-lab-table" role="table">
          {rows.map(([plugin, usage, status]) => (
            <div className="dlv-lab-row" role="row" key={plugin}>
              <strong role="cell">{plugin}</strong>
              <span role="cell">{usage}</span>
              <em role="cell">{status}</em>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
