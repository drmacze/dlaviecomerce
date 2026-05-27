import { ReactNode } from 'react';

type Metric = { label: string; value: string; hint: string };
type Action = { label: string; href: string; primary?: boolean };

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: Metric[];
  actions: Action[];
  children: ReactNode;
  accent?: string;
};

export function DlavieEcosystemPage({ eyebrow, title, description, metrics, actions, children }: Props) {
  return (
    <main className="dlavie-lux-page min-h-screen overflow-hidden px-4 py-6 md:px-8">
      <div className="dlavie-mesh" />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="dlavie-holo-noise absolute inset-0" />
        <div className="dlavie-scanline absolute inset-0" />
      </div>

      <section className="dlavie-glass dlavie-edge-flow relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-5 md:p-10">
        <div className="pointer-events-none absolute right-8 top-8 hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/40 md:flex">
          <span className="dlavie-accent-dot" />
          Live System
        </div>

        <div className="dlv-reveal flex flex-wrap items-center justify-between gap-3">
          <a className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/[0.08]" href="/">
            ← DLAVIE
          </a>
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <a
                key={action.label}
                className={`dlavie-magnetic-cta rounded-full px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${action.primary ? 'bg-white text-[#050505]' : 'border border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]'}`}
                href={action.href}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-9 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
          <div className="dlv-reveal">
            <div className="mb-5 flex items-center gap-3">
              <span className="dlavie-accent-dot" />
              <p className="dlavie-eyebrow">{eyebrow}</p>
            </div>
            <h1 className="dlv-text-balance max-w-4xl text-[3.35rem] font-semibold leading-[.9] tracking-[-.07em] text-white md:text-7xl">
              {title}
            </h1>
            <p className="dlv-text-balance mt-6 max-w-2xl text-base font-medium leading-8 text-white/52 md:text-lg">
              {description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="dlv-reveal dlavie-soft-card dlavie-hover-lift rounded-[1.6rem] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/34">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-.04em] text-white md:text-4xl">{metric.value}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-white/42">{metric.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dlv-reveal mt-8 dlv-lazy-media">
          {children}
        </div>
      </section>
    </main>
  );
}
