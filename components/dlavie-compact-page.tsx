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
};

export function DlavieCompactPage({ eyebrow, title, description, metrics, actions, children }: Props) {
  const mainMetric = metrics[0];
  const miniMetrics = metrics.slice(1);

  return (
    <main className="min-h-screen overflow-hidden px-3 py-3 text-slate-950 md:px-6 md:py-5">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#dfff4f]/25 blur-3xl" />
        <div className="absolute -right-24 top-36 h-96 w-96 rounded-full bg-[#75b3e5]/20 blur-3xl" />
        <div className="absolute inset-0 dlavie-grid-bg opacity-35" />
      </div>
      <section className="dlavie-glass relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <a className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-[#dfff4f]" href="/">← DLAVIE</a>
          <div className="flex max-w-[70%] gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {actions.map((action) => <a key={action.label} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black shadow-sm ${action.primary ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/75 text-slate-950 ring-1 ring-black/5'}`} href={action.href}>{action.label}</a>)}
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-black leading-[0.98] tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>
          </div>
          {mainMetric && <div className="relative overflow-hidden rounded-[1.55rem] bg-slate-950 p-4 text-white shadow-[0_22px_60px_rgba(15,23,42,.18)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#dfff4f]/20 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">{mainMetric.label}</p>
                <p className="mt-1 truncate text-3xl font-black tracking-tight md:text-4xl">{mainMetric.value}</p>
                <p className="mt-1 text-xs font-bold text-white/45">{mainMetric.hint}</p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dfff4f] text-lg font-black text-slate-950 shadow-[0_0_28px_rgba(223,255,79,.28)]">D</div>
            </div>
            <div className="relative mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {miniMetrics.map((metric) => <div key={metric.label} className="min-w-[6.4rem] rounded-[1rem] bg-white/10 px-3 py-2 ring-1 ring-white/10"><p className="truncate text-[9px] font-black uppercase tracking-widest text-white/35">{metric.label}</p><p className="mt-1 truncate text-base font-black text-white">{metric.value}</p><p className="truncate text-[10px] font-bold text-white/35">{metric.hint}</p></div>)}
            </div>
          </div>}
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}