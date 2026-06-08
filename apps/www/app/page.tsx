import {
  ArrowRight,
  Bot,
  Brain,
  Database,
  LayoutDashboard,
  Play,
  Users,
  Workflow,
} from 'lucide-react';

const coreFeatures = [
  {
    icon: <Bot aria-hidden="true" />,
    title: 'AI Core',
    desc: 'The intelligent foundation that powers reasoning, orchestration, and decision-making across the entire ecosystem.',
  },
  {
    icon: <Users aria-hidden="true" />,
    title: 'Agents',
    desc: 'Autonomous agents that execute complex workflows, handle commerce operations, and respond to real-time signals.',
  },
  {
    icon: <Brain aria-hidden="true" />,
    title: 'Models',
    desc: 'Flexible model routing with support for frontier models, fine-tuned agents, and local inference when needed.',
  },
  {
    icon: <Database aria-hidden="true" />,
    title: 'Memory',
    desc: 'Persistent, contextual memory layer that remembers conversations, transactions, and operational history.',
  },
  {
    icon: <LayoutDashboard aria-hidden="true" />,
    title: 'Dashboards',
    desc: 'Beautiful, real-time command surfaces for monitoring agents, commerce metrics, and system health.',
  },
  {
    icon: <Workflow aria-hidden="true" />,
    title: 'Workflows',
    desc: 'Visual and code-based orchestration of multi-step processes across AI, commerce, and automation layers.',
  },
];

const ecosystemCards = [
  {
    title: 'DLavie Commerce',
    desc: 'PPOB products, storefront flows, transaction rails, and automated settlement — all connected.',
  },
  {
    title: 'Automation Layer',
    desc: 'Triggers, agents, and commerce events stay synchronized from signal to final settlement.',
  },
  {
    title: 'DLavie OS',
    desc: 'The intelligent command layer that orchestrates everything into one cinematic experience.',
  },
];

export default function DLavieRedesigned() {
  return (
    <main className="dlavie-home">
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
            <a href="#os" className="dlavie-home__button dlavie-home__button--primary dlavie-home__button--compact">
              Launch DLavie OS
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </nav>

      <section id="top" className="dlavie-home__hero" aria-labelledby="dlavie-home-title">
        <p className="dlavie-home__eyebrow">Intelligent operating system</p>

        <h1 id="dlavie-home-title" className="dlavie-home__title">DLavie OS</h1>

        <p className="dlavie-home__subtitle">
          The cinematic command mesh for agents, models, memory, and intelligent operations.
        </p>

        <p className="dlavie-home__description">
          One parent brand. One unified ecosystem. Decisions, transactions, and workflows — perfectly aligned.
        </p>

        <div className="dlavie-home__actions">
          <a href="#os" className="dlavie-home__button dlavie-home__button--primary">
            Explore DLavie OS
          </a>
          <a href="/ai" className="dlavie-home__button dlavie-home__button--secondary">
            <Play aria-hidden="true" />
            Open AI Workspace
          </a>
        </div>

        <p className="dlavie-home__meta">Built for founders • operators • intelligent systems</p>
      </section>

      <section className="dlavie-home__section dlavie-home__section--center dlavie-home__section--band" aria-labelledby="philosophy-title">
        <p className="dlavie-home__eyebrow">The philosophy</p>
        <h2 id="philosophy-title" className="dlavie-home__section-heading">
          One parent brand.<br />Connected intelligence.
        </h2>
        <p className="dlavie-home__section-copy">
          DLavie designs connected digital systems under one cohesive brand — from agent workspaces to transaction rails.
        </p>
      </section>

      <section id="os" className="dlavie-home__section" aria-labelledby="os-title">
        <div className="dlavie-home__section-header">
          <p className="dlavie-home__eyebrow dlavie-home__eyebrow--pill">The core</p>
          <h2 id="os-title" className="dlavie-home__section-heading">DLavie OS</h2>
          <p className="dlavie-home__section-copy">
            Turns agents, models, memory, dashboards, and workflows into a single cinematic command mesh.
          </p>
        </div>

        <div className="dlavie-home__grid dlavie-home__grid--features">
          {coreFeatures.map((item) => (
            <article
              key={item.title}
              className="dlavie-home__card dlavie-home__card--feature"
            >
              <div className="dlavie-home__card-icon">{item.icon}</div>
              <h3 className="dlavie-home__card-title">{item.title}</h3>
              <p className="dlavie-home__card-copy">{item.desc}</p>
              <span className="dlavie-home__card-link">
                Learn more <ArrowRight aria-hidden="true" />
              </span>
            </article>
          ))}
        </div>
      </section>

      <section id="ecosystem" className="dlavie-home__section dlavie-home__section--band" aria-labelledby="ecosystem-title">
        <div className="dlavie-home__section-header">
          <p className="dlavie-home__eyebrow">Unified by design</p>
          <h2 id="ecosystem-title" className="dlavie-home__section-heading">
            One ecosystem.<br />Zero friction.
          </h2>
        </div>

        <div className="dlavie-home__grid dlavie-home__grid--ecosystem">
          {ecosystemCards.map((item) => (
            <article key={item.title} className="dlavie-home__card">
              <h3 className="dlavie-home__card-title">{item.title}</h3>
              <p className="dlavie-home__card-copy">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workspace" className="dlavie-home__section dlavie-home__section--center" aria-labelledby="workspace-title">
        <p className="dlavie-home__eyebrow dlavie-home__eyebrow--pill">The workspace</p>
        <h2 id="workspace-title" className="dlavie-home__section-heading">Experience the command layer.</h2>
        <p className="dlavie-home__section-copy dlavie-home__section-copy--wide">
          DLavie AI Workspace is where intelligence meets operations. Account-aware, context-rich, and built for real work.
        </p>

        <div className="dlavie-home__actions">
          <a href="/ai" className="dlavie-home__button dlavie-home__button--primary">
            Open DLavie AI Workspace
          </a>
          <a href="#os" className="dlavie-home__button dlavie-home__button--secondary">
            Learn about DLavie OS
          </a>
        </div>
      </section>

      <section className="dlavie-home__section dlavie-home__section--center dlavie-home__section--cta" aria-labelledby="cta-title">
        <h2 id="cta-title" className="dlavie-home__cta-heading">Ready to build with intelligence?</h2>
        <p className="dlavie-home__section-copy">Start with DLavie OS or dive straight into the AI workspace.</p>

        <div className="dlavie-home__actions">
          <a href="#os" className="dlavie-home__button dlavie-home__button--primary">Explore DLavie OS</a>
          <a href="/ai" className="dlavie-home__button dlavie-home__button--secondary">Launch AI Workspace →</a>
        </div>
      </section>

      <footer className="dlavie-home__footer">
        <div className="dlavie-home__footer-inner">
          <p>© {new Date().getFullYear()} DLavie. All rights reserved.</p>
          <div className="dlavie-home__footer-links">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="https://github.com/drmacze/dlaviecomerce">GitHub</a>
          </div>
          <p>Built with precision in Indonesia</p>
        </div>
      </footer>
    </main>
  );
}
