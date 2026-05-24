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
    <main className="dlavie-system-page px-3 py-3 md:px-6 md:py-5">
      <div className="dlavie-mesh" />
      <section className="dlavie-mica dlavie-ring relative mx-auto max-w-7xl overflow-hidden rounded-[2.35rem] p-4 md:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#dfff4f]/35 blur-3xl dlavie-float-orb" />
        <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#75b3e5]/24 blur-3xl dlavie-float-orb" />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <a className="dlavie-primary-btn rounded-full px-3 py-2 text-xs font-black transition hover:-translate-y-1" href="/">← DLAVIE</a>
          <div className="flex max-w-[70%] gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {actions.map((action) => <a key={action.label} className={`dlavie-lift shrink-0 rounded-full px-3 py-2 text-xs font-black shadow-sm ${action.primary ? 'dlavie-lime-btn' : 'bg-white/72 text-slate-950 ring-1 ring-black/5 backdrop-blur-xl'}`} href={action.href}>{action.label}</a>)}
          </div>
        </div>
        <div className="relative z-10 mt-5 grid gap-4 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black leading-[0.96] tracking-[-0.035em] md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
          </div>
          {mainMetric && <div className="dlavie-wave-card relative overflow-hidden rounded-[1.85rem] bg-slate-950 p-4 text-white shadow-[0_22px_60px_rgba(15,23,42,.18)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#dfff4f]/25 blur-2xl dlavie-float-orb" />
            <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-[#75b3e5]/18 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">{mainMetric.label}</p>
                <p className="mt-1 truncate text-3xl font-black tracking-tight md:text-4xl">{mainMetric.value}</p>
                <p className="mt-1 text-xs font-bold text-white/45">{mainMetric.hint}</p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dfff4f] text-lg font-black text-slate-950 shadow-[0_0_28px_rgba(223,255,79,.34)]">D</div>
            </div>
            <div className="relative mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {miniMetrics.map((metric) => <div key={metric.label} className="min-w-[6.4rem] rounded-[1rem] bg-white/10 px-3 py-2 ring-1 ring-white/10 backdrop-blur-xl"><p className="truncate text-[9px] font-black uppercase tracking-widest text-white/35">{metric.label}</p><p className="mt-1 truncate text-base font-black text-white">{metric.value}</p><p className="truncate text-[10px] font-bold text-white/35">{metric.hint}</p></div>)}
            </div>
            <div className="dlavie-progress-line relative mt-3 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-full rounded-full bg-[#dfff4f]" /></div>
          </div>}
        </div>
        <div className="relative z-10 mt-5">{children}</div>
      </section>
    </main>
  );
}
