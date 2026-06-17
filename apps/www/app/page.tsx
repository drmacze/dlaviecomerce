'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Bot, Brain, Database,
  LayoutDashboard, Play, Users, Workflow,
  Zap, Shield, Globe,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Silver / Chrome design tokens (JS-side)
   Injected as <style> so they always win.
───────────────────────────────────────────── */
const CHROME_STYLES = `
  /* Keyframes */
  @keyframes sweep {
    0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
  }
  @keyframes pill-sweep {
    0%   { transform: translateX(-160%) skewX(-18deg); }
    100% { transform: translateX(260%) skewX(-18deg); }
  }
  @keyframes chrome-flow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes glow-pulse {
    0%,100% { opacity: 0.5; }
    50%      { opacity: 1; }
  }
  @keyframes border-shimmer {
    0%   { border-color: rgba(200,200,220,0.14); box-shadow: 0 0 0 0 rgba(210,210,235,0); }
    50%  { border-color: rgba(230,230,250,0.36); box-shadow: 0 0 16px 1px rgba(210,210,235,0.18); }
    100% { border-color: rgba(200,200,220,0.14); box-shadow: 0 0 0 0 rgba(210,210,235,0); }
  }

  /* Chrome gradient string */
  :root {
    --chrome-grad: linear-gradient(
      105deg,
      #8a8aa0 0%, #c8c8dc 12%, #f0f0ff 22%,
      #d4d4e8 32%, #9090ac 44%, #e0e0f4 55%,
      #ffffff 62%, #c0c0d8 72%, #8888a4 82%,
      #d0d0e8 92%, #f0f0ff 100%
    );
  }

  /* ── Eyebrow pill shimmer ── */
  .dlv-eyebrow-pill {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 9999px;
    border: 1px solid rgba(210,210,230,0.26);
    background: rgba(190,190,215,0.10);
    color: #D8D8F0;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    margin-bottom: 16px;
    animation: border-shimmer 3s ease-in-out infinite;
  }
  .dlv-eyebrow-pill .sweep {
    position: absolute;
    top: 0; left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.65) 50%,
      transparent 100%
    );
    animation: pill-sweep 2s ease-in-out infinite;
    pointer-events: none;
  }

  /* ── Card icon chrome ── */
  .dlv-icon {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px; height: 44px;
    border-radius: 14px;
    border: 1px solid rgba(200,200,220,0.18);
    background: linear-gradient(145deg, rgba(150,150,175,0.18), rgba(100,100,130,0.08));
    box-shadow:
      0 1px 0 rgba(255,255,255,0.14) inset,
      0 0 12px rgba(200,200,225,0.08);
    color: #D8D8F0;
    margin-bottom: 6px;
    flex-shrink: 0;
  }
  .dlv-icon .sweep {
    position: absolute;
    top: -20%;
    left: 0;
    width: 35%;
    height: 140%;
    background: linear-gradient(105deg,
      transparent 0%,
      rgba(255,255,255,0.80) 50%,
      transparent 100%
    );
    pointer-events: none;
    animation: sweep 2.5s ease-in-out infinite;
    animation-delay: var(--delay, 0s);
  }
  .dlavie-home__card:hover .dlv-icon {
    border-color: rgba(230,230,250,0.35);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.22) inset,
      0 0 20px rgba(210,210,240,0.20);
    background: linear-gradient(145deg, rgba(200,200,225,0.22), rgba(150,150,185,0.12));
  }

  /* ── Chrome gradient text (Learn more) ── */
  .dlv-chrome-text {
    background: var(--chrome-grad);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    animation: chrome-flow 3s ease-in-out infinite;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
  }
  .dlv-chrome-text svg {
    -webkit-text-fill-color: initial;
    color: #A0A0C0;
    flex-shrink: 0;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  /* ── Section labels ── */
  .dlv-section-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 9999px;
    border: 1px solid rgba(200,200,220,0.16);
    background: rgba(180,180,210,0.08);
    color: rgba(210,210,235,0.60);
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 16px;
  }
`;

const coreFeatures = [
  { icon: Bot,             title: 'AI Core',      delay: '0s',   desc: 'Intelligent foundation powering reasoning, orchestration, and decision-making across the ecosystem.' },
  { icon: Users,           title: 'Agents',        delay: '0.4s', desc: 'Autonomous agents that execute complex workflows, handle commerce, and respond to real-time signals.' },
  { icon: Brain,           title: 'Models',        delay: '0.8s', desc: 'Flexible model routing with frontier models, fine-tuned agents, and local inference support.' },
  { icon: Database,        title: 'Memory',        delay: '1.2s', desc: 'Persistent contextual memory that remembers conversations, transactions, and operational history.' },
  { icon: LayoutDashboard, title: 'Dashboards',    delay: '1.6s', desc: 'Real-time command surfaces for monitoring agents, commerce metrics, and system health.' },
  { icon: Workflow,        title: 'Workflows',     delay: '2.0s', desc: 'Visual and code-based orchestration of multi-step processes across AI, commerce, and automation.' },
];

const ecosystemCards = [
  { icon: Globe,  title: 'DLavie Commerce', desc: 'PPOB products, storefront flows, transaction rails, and automated settlement — all connected.' },
  { icon: Zap,    title: 'Automation Layer', desc: 'Triggers, agents, and commerce events stay synchronized from signal to final settlement.' },
  { icon: Shield, title: 'DLavie OS',        desc: 'The intelligent command layer that orchestrates everything into one unified experience.' },
];

const SPRING = { type: 'spring', stiffness: 280, damping: 22 } as const;

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Inject chrome styles — guaranteed to override everything */}
      <style dangerouslySetInnerHTML={{ __html: CHROME_STYLES }} />

      <main className="dlavie-home">

        {/* ── Nav ── */}
        <nav className="dlavie-home__nav" aria-label="Primary navigation">
          <div className="dlavie-home__nav-inner">
            <a href="#top" className="dlavie-home__brand" aria-label="DLavie home">
              <span className="dlavie-home__brand-mark" aria-hidden="true">D</span>
              <span className="dlavie-home__brand-wordmark">DLavie</span>
            </a>
            <div className="dlavie-home__nav-links">
              <a href="#os">DLavie OS</a>
              <a href="#ecosystem">Ecosystem</a>
              <a href="#workspace">AI Workspace</a>
              <a href="/ai">Docs</a>
            </div>
            <div className="dlavie-home__nav-actions">
              <a href="/ai" className="dlavie-home__button dlavie-home__button--ghost dlavie-home__button--desktop">
                Open Workspace
              </a>
              <a href="/account/register" className="dlavie-home__button dlavie-home__button--primary dlavie-home__button--compact">
                Get Started <ArrowRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section id="top" className="dlavie-home__hero" aria-labelledby="hero-title">
          <motion.p
            className="dlavie-home__eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Intelligent operating system
          </motion.p>

          <motion.h1
            id="hero-title"
            className="dlavie-home__title"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            DLavie OS
          </motion.h1>

          <motion.p
            className="dlavie-home__subtitle"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
          >
            The cinematic command mesh for agents, models, memory, and intelligent operations.
          </motion.p>

          <motion.p
            className="dlavie-home__description"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.46 }}
          >
            One parent brand. One unified ecosystem. Decisions, transactions, and workflows — perfectly aligned.
          </motion.p>

          <motion.div
            className="dlavie-home__actions"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
          >
            <a href="#os" className="dlavie-home__button dlavie-home__button--primary">
              Explore DLavie OS
            </a>
            <a href="/ai" className="dlavie-home__button dlavie-home__button--secondary">
              <Play size={14} aria-hidden="true" /> Open AI Workspace
            </a>
          </motion.div>

          <p className="dlavie-home__meta">Built for founders • operators • intelligent systems</p>
        </section>

        {/* ── Philosophy ── */}
        <section className="dlavie-home__section dlavie-home__section--center dlavie-home__section--band" aria-labelledby="philosophy-title">
          <p className="dlavie-home__eyebrow" style={{ marginInline: 'auto' }}>The philosophy</p>
          <h2 id="philosophy-title" className="dlavie-home__section-heading" style={{ maxWidth: 640, marginInline: 'auto', marginBottom: 14 }}>
            One parent brand.<br />Connected intelligence.
          </h2>
          <p className="dlavie-home__section-copy" style={{ marginInline: 'auto' }}>
            DLavie designs connected digital systems under one cohesive brand — from agent workspaces to transaction rails.
          </p>
        </section>

        {/* ── DLavie OS features ── */}
        <section id="os" className="dlavie-home__section" aria-labelledby="os-title">
          <div className="dlavie-home__section-header">
            {/* Chrome shimmer pill */}
            <p className="dlv-eyebrow-pill">
              <span className="sweep" aria-hidden="true" />
              The core
            </p>
            <h2 id="os-title" className="dlavie-home__section-heading">DLavie OS</h2>
            <p className="dlavie-home__section-copy">
              Turns agents, models, memory, dashboards, and workflows into a single cinematic command mesh.
            </p>
          </div>

          <div className="dlavie-home__grid dlavie-home__grid--features">
            {coreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  className="dlavie-home__card dlavie-home__card--feature"
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  transition={SPRING}
                >
                  {/* Chrome icon with sweep shimmer */}
                  <div className="dlv-icon" style={{ '--delay': item.delay } as React.CSSProperties} aria-hidden="true">
                    <span className="sweep" />
                    <Icon size={20} strokeWidth={1.75} />
                  </div>

                  <h3 className="dlavie-home__card-title">{item.title}</h3>
                  <p className="dlavie-home__card-copy">{item.desc}</p>

                  {/* Chrome gradient animated text */}
                  <span className="dlv-chrome-text">
                    Learn more <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* ── Ecosystem ── */}
        <section id="ecosystem" className="dlavie-home__section dlavie-home__section--band" aria-labelledby="ecosystem-title">
          <div className="dlavie-home__section-header">
            <p className="dlv-section-chip">Unified by design</p>
            <h2 id="ecosystem-title" className="dlavie-home__section-heading">
              One ecosystem.<br />Zero friction.
            </h2>
          </div>
          <div className="dlavie-home__grid dlavie-home__grid--ecosystem" style={{ maxWidth: 1180, marginInline: 'auto' }}>
            {ecosystemCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="dlavie-home__card">
                  <div className="dlv-icon" style={{ '--delay': '0s' } as React.CSSProperties} aria-hidden="true">
                    <span className="sweep" />
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="dlavie-home__card-title">{item.title}</h3>
                  <p className="dlavie-home__card-copy">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── AI Workspace ── */}
        <section id="workspace" className="dlavie-home__section dlavie-home__section--center" aria-labelledby="workspace-title">
          <p className="dlv-eyebrow-pill" style={{ marginInline: 'auto' }}>
            <span className="sweep" aria-hidden="true" />
            The workspace
          </p>
          <h2 id="workspace-title" className="dlavie-home__section-heading">
            Experience the command layer.
          </h2>
          <p className="dlavie-home__section-copy dlavie-home__section-copy--wide" style={{ marginInline: 'auto', marginBottom: 32 }}>
            DLavie AI Workspace is where intelligence meets operations. Account-aware, context-rich, and built for real work.
          </p>
          <div className="dlavie-home__actions" style={{ justifyContent: 'center' }}>
            <a href="/ai" className="dlavie-home__button dlavie-home__button--primary">
              Open DLavie AI Workspace
            </a>
            <a href="#os" className="dlavie-home__button dlavie-home__button--secondary">
              Learn about DLavie OS
            </a>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="dlavie-home__section dlavie-home__section--center dlavie-home__section--cta" aria-labelledby="cta-title">
          <h2 id="cta-title" className="dlavie-home__cta-heading">
            Ready to build with intelligence?
          </h2>
          <p className="dlavie-home__section-copy" style={{ marginInline: 'auto', marginBottom: 32 }}>
            Start with DLavie OS or dive straight into the AI workspace.
          </p>
          <div className="dlavie-home__actions" style={{ justifyContent: 'center' }}>
            <a href="/account/register" className="dlavie-home__button dlavie-home__button--primary">
              Get Started Free
            </a>
            <a href="/ai" className="dlavie-home__button dlavie-home__button--secondary">
              Launch AI Workspace →
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="dlavie-home__footer">
          <div className="dlavie-home__footer-inner">
            <p>© {new Date().getFullYear()} DLavie. All rights reserved.</p>
            <div className="dlavie-home__footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="https://github.com/drmacze/dlaviecomerce">GitHub</a>
            </div>
            <p>Built with precision in Indonesia</p>
          </div>
        </footer>
      </main>
    </>
  );
}
