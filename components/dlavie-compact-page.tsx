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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map((metric) => <div key={metric.label} className="dlavie-soft-card rounded-[1.25rem] p-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{metric.label}</p><p className="mt-1 text-lg font-black tracking-tight md:text-2xl">{metric.value}</p><p className="mt-1 truncate text-[10px] font-bold text-slate-500">{metric.hint}</p></div>)}
          </div>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}
