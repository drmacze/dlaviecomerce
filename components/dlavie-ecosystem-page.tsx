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

export function DlavieEcosystemPage({ eyebrow, title, description, metrics, actions, children, accent = '#dfff4f' }: Props) {
  return <main className="min-h-screen overflow-hidden px-4 py-6 text-slate-950 md:px-8"><style jsx global>{`
    .dlavie-orbit-core { animation: dlavieEcoOrbit 18s linear infinite; }
    .dlavie-orbit-reverse { animation: dlavieEcoOrbitReverse 26s linear infinite; }
    .dlavie-float-chip { animation: dlavieEcoFloat 5.8s ease-in-out infinite; }
    .dlavie-scanline { animation: dlavieEcoScan 3.2s ease-in-out infinite; }
    @keyframes dlavieEcoOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes dlavieEcoOrbitReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    @keyframes dlavieEcoFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    @keyframes dlavieEcoScan { 0%,100% { transform: translateY(-110%); opacity: 0; } 50% { transform: translateY(110%); opacity: .65; } }
  `}</style><div className="pointer-events-none fixed inset-0 -z-10"><div className="dlavie-aurora absolute -left-28 -top-28 h-96 w-96 rounded-full blur-3xl" style={{ background: `${accent}55` }} /><div className="dlavie-aurora absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full bg-[#75b3e5]/25 blur-3xl" /><div className="absolute inset-0 dlavie-grid-bg opacity-40" /></div><section className="dlavie-glass dlavie-edge-flow relative mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] p-6 md:p-10"><div className="pointer-events-none absolute right-8 top-8 h-3 w-3 rounded-full dlavie-corner-dot" style={{ background: accent, boxShadow: `0 0 28px ${accent}` }} /><div className="flex flex-wrap items-center justify-between gap-3"><a className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-[#dfff4f]" href="/">← DLAVIE</a><div className="flex flex-wrap gap-2">{actions.map((action) => <a key={action.label} className={`rounded-full px-4 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 ${action.primary ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/75 text-slate-950 ring-1 ring-black/5'}`} href={action.href}>{action.label}</a>)}</div></div><div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_.95fr]"><div><p className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">{eyebrow}</p><h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.94] tracking-tight md:text-7xl">{title}</h1><p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">{description}</p></div><div className="grid gap-3 sm:grid-cols-2">{metrics.map((metric) => <div key={metric.label} className="dlavie-soft-card dlavie-hover-lift rounded-[1.75rem] p-5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">{metric.label}</p><p className="mt-2 text-4xl font-black tracking-tight">{metric.value}</p><p className="mt-2 text-sm font-bold text-slate-500">{metric.hint}</p></div>)}</div></div><div className="mt-8">{children}</div></section></main>;
}
