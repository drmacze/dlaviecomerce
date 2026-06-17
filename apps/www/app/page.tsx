'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Bot, Brain, Database,
  LayoutDashboard, Play, Users, Workflow,
  Zap, Shield, Globe, Home, Cpu, ChevronRight, X, Menu,
} from 'lucide-react';
import { ChromeIcon } from '../src/components/ui/ChromeIcon';
import { ChromePill } from '../src/components/ui/ChromePill';
import { ChromeText } from '../src/components/ui/ChromeText';

/* ─── Floating Sidebar (inline — no separate import needed) ─── */
const SIDEBAR_ITEMS = [
  { id: 'top',        icon: Home,  label: 'Home'         },
  { id: 'os',         icon: Cpu,   label: 'DLavie OS'    },
  { id: 'ecosystem',  icon: Globe, label: 'Ecosystem'     },
  { id: 'workspace',  icon: Bot,   label: 'AI Workspace' },
];

function FloatingSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [active,   setActive]   = useState('top');
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return (): void => { window.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SIDEBAR_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return (): void => { observers.forEach(o => o.disconnect()); };
  }, []);

  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActive(id);
    setExpanded(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="sidebar"
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className={`dlv-sidebar${expanded ? ' dlv-sidebar--expanded' : ''}`}
          aria-label="Page sections"
        >
          {/* Toggle */}
          <button
            className="dlv-sidebar__toggle"
            onClick={() => setExpanded(p => !p)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <motion.span style={{ display: 'flex' }}
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.25 }}>
              {expanded ? <X size={14} /> : <Menu size={14} />}
            </motion.span>
          </button>

          {/* Items */}
          <nav className="dlv-sidebar__nav">
            {SIDEBAR_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <motion.button
                  key={item.id}
                  className={`dlv-sidebar__item${isActive ? ' dlv-sidebar__item--active' : ''}`}
                  onClick={() => scrollTo(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'true' : undefined}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 + 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dlv-active"
                      className="dlv-sidebar__active-bg"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="dlv-sidebar__icon">
                    <Icon size={15} strokeWidth={isActive ? 2.4 : 1.8} />
                  </span>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.span
                        className="dlv-sidebar__label"
                        initial={{ opacity: 0, maxWidth: 0 }}
                        animate={{ opacity: 1, maxWidth: 120 }}
                        exit={{ opacity: 0, maxWidth: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!expanded && (
                    <span className="dlv-sidebar__tooltip" role="tooltip">
                      {item.label}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Expand hint */}
          {!expanded && (
            <button
              className="dlv-sidebar__chevron"
              onClick={() => setExpanded(true)}
              aria-label="Expand sidebar"
            >
              <ChevronRight size={11} />
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ─── Page data ─── */
const coreFeatures = [
  { icon: Bot,             title: 'AI Core',    delay: 0,   desc: 'Intelligent foundation powering reasoning, orchestration, and decision-making across the ecosystem.' },
  { icon: Users,           title: 'Agents',      delay: 0.4, desc: 'Autonomous agents that execute complex workflows, handle commerce, and respond to real-time signals.' },
  { icon: Brain,           title: 'Models',      delay: 0.8, desc: 'Flexible model routing with frontier models, fine-tuned agents, and local inference support.' },
  { icon: Database,        title: 'Memory',      delay: 1.2, desc: 'Persistent contextual memory that remembers conversations, transactions, and operational history.' },
  { icon: LayoutDashboard, title: 'Dashboards',  delay: 1.6, desc: 'Real-time command surfaces for monitoring agents, commerce metrics, and system health.' },
  { icon: Workflow,        title: 'Workflows',   delay: 2.0, desc: 'Visual and code-based orchestration of multi-step processes across AI, commerce, and automation.' },
];

const ecosystemCards = [
  { icon: Globe,  title: 'DLavie Commerce',  delay: 0,   desc: 'PPOB products, storefront flows, transaction rails, and automated settlement — all connected.' },
  { icon: Zap,    title: 'Automation Layer', delay: 0.3, desc: 'Triggers, agents, and commerce events stay synchronized from signal to final settlement.' },
  { icon: Shield, title: 'DLavie OS',        delay: 0.6, desc: 'The intelligent command layer that orchestrates everything into one unified experience.' },
];

const SPRING = { type: 'spring', stiffness: 280, damping: 22 } as const;

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <FloatingSidebar />

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
          <motion.p className="dlavie-home__eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            Intelligent operating system
          </motion.p>
          <motion.h1 id="hero-title" className="dlavie-home__title"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            DLavie OS
          </motion.h1>
          <motion.p className="dlavie-home__subtitle"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.34 }}>
            The cinematic command mesh for agents, models, memory, and intelligent operations.
          </motion.p>
          <motion.p className="dlavie-home__description"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.46 }}>
            One parent brand. One unified ecosystem. Decisions, transactions, and workflows — perfectly aligned.
          </motion.p>
          <motion.div className="dlavie-home__actions"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.55 }}>
            <a href="#os" className="dlavie-home__button dlavie-home__button--primary">Explore DLavie OS</a>
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

        {/* ── DLavie OS ── */}
        <section id="os" className="dlavie-home__section" aria-labelledby="os-title">
          <div className="dlavie-home__section-header">
            <ChromePill style={{ marginInline: 'auto' }}>The core</ChromePill>
            <h2 id="os-title" className="dlavie-home__section-heading">DLavie OS</h2>
            <p className="dlavie-home__section-copy">
              Turns agents, models, memory, dashboards, and workflows into a single cinematic command mesh.
            </p>
          </div>
          <div className="dlavie-home__grid dlavie-home__grid--features">
            {coreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article key={item.title}
                  className="dlavie-home__card dlavie-home__card--feature"
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  transition={SPRING}>
                  <ChromeIcon delay={item.delay}><Icon size={20} strokeWidth={1.75} /></ChromeIcon>
                  <h3 className="dlavie-home__card-title">{item.title}</h3>
                  <p className="dlavie-home__card-copy">{item.desc}</p>
                  <ChromeText>Learn more <ArrowRight size={12} aria-hidden="true" /></ChromeText>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* ── Ecosystem ── */}
        <section id="ecosystem" className="dlavie-home__section dlavie-home__section--band" aria-labelledby="ecosystem-title">
          <div className="dlavie-home__section-header">
            <p className="dlavie-home__eyebrow" style={{ marginInline: 'auto' }}>Unified by design</p>
            <h2 id="ecosystem-title" className="dlavie-home__section-heading">One ecosystem.<br />Zero friction.</h2>
          </div>
          <div className="dlavie-home__grid dlavie-home__grid--ecosystem" style={{ maxWidth: 1180, marginInline: 'auto' }}>
            {ecosystemCards.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="dlavie-home__card">
                  <ChromeIcon delay={item.delay}><Icon size={20} strokeWidth={1.75} /></ChromeIcon>
                  <h3 className="dlavie-home__card-title">{item.title}</h3>
                  <p className="dlavie-home__card-copy">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── AI Workspace ── */}
        <section id="workspace" className="dlavie-home__section dlavie-home__section--center" aria-labelledby="workspace-title">
          <ChromePill style={{ marginInline: 'auto' }}>The workspace</ChromePill>
          <h2 id="workspace-title" className="dlavie-home__section-heading">Experience the command layer.</h2>
          <p className="dlavie-home__section-copy dlavie-home__section-copy--wide" style={{ marginInline: 'auto', marginBottom: 32 }}>
            DLavie AI Workspace is where intelligence meets operations. Account-aware, context-rich, and built for real work.
          </p>
          <div className="dlavie-home__actions" style={{ justifyContent: 'center' }}>
            <a href="/ai" className="dlavie-home__button dlavie-home__button--primary">Open DLavie AI Workspace</a>
            <a href="#os" className="dlavie-home__button dlavie-home__button--secondary">Learn about DLavie OS</a>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="dlavie-home__section dlavie-home__section--center dlavie-home__section--cta" aria-labelledby="cta-title">
          <h2 id="cta-title" className="dlavie-home__cta-heading">Ready to build with intelligence?</h2>
          <p className="dlavie-home__section-copy" style={{ marginInline: 'auto', marginBottom: 32 }}>
            Start with DLavie OS or dive straight into the AI workspace.
          </p>
          <div className="dlavie-home__actions" style={{ justifyContent: 'center' }}>
            <a href="/account/register" className="dlavie-home__button dlavie-home__button--primary">Get Started Free</a>
            <a href="/ai" className="dlavie-home__button dlavie-home__button--secondary">Launch AI Workspace →</a>
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
