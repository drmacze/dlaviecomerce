import { useEffect, useState } from 'react';
import { Activity, ArrowRight, CheckCircle2, Clock3, Command, Gauge, Layers3, Sparkles, Zap } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const metrics = [
  ['Signal Flow', 'Live', 'Aktivitas penting Dlavie siap dipantau.'],
  ['Priority', 'Smart', 'Event penting dibuat lebih menonjol.'],
  ['Speed', 'Fast', 'Ringkasan dibuat cepat dan mudah dibaca.'],
  ['Quality', 'Premium', 'Tampilan tetap detail tanpa terasa kaku.'],
];

const stream = [
  ['Order activity lane', 'Area ini disiapkan untuk pesanan baru dan aktivitas checkout.'],
  ['Payment activity lane', 'Area ini disiapkan untuk konfirmasi pembayaran dan status transaksi.'],
  ['System activity lane', 'Area ini disiapkan untuk pemantauan sistem dan event penting.'],
  ['Admin activity lane', 'Area ini disiapkan untuk ringkasan tindakan admin.'],
];

function Tile({ label, value, text, index }: { label: string; value: string; text: string; index: number }) {
  const Icon = [Activity, Layers3, Gauge, Zap][index] || Activity;
  const glow = ['bg-cyan-400/25', 'bg-violet-500/25', 'bg-emerald-400/25', 'bg-[#dfff4f]/20'][index] || 'bg-cyan-400/25';
  return <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,.26)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.105]"><div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${glow}`} /><div className="relative flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/42">{label}</p><h3 className="mt-3 text-3xl font-black tracking-tight text-white">{value}</h3><p className="mt-2 text-sm font-semibold leading-6 text-white/56">{text}</p></div><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-inner"><Icon className="h-5 w-5" /></div></div></article>;
}

export default function AdminSignal() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || '';
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase());
      setAllowed(Boolean(email && admins.includes(email.toLowerCase())));
      setChecking(false);
    });
  }, []);

  if (checking) return <main className="min-h-screen bg-[#050811] p-6 text-white">Checking admin access...</main>;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-[#050811] p-6 text-white"><section className="max-w-lg rounded-[2.5rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-white/40">DLAVIE SECURITY</p><h1 className="mt-3 text-4xl font-black">Admin Locked</h1><p className="mt-3 font-semibold leading-7 text-white/60">Login memakai email owner yang terdaftar sebagai admin.</p><a className="mt-6 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/login">Login</a></section></main>;

  return <main className="relative min-h-screen overflow-hidden bg-[#050811] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="absolute left-[-14rem] top-[-12rem] h-[30rem] w-[30rem] rounded-full bg-cyan-500/20 blur-[120px]" /><div className="absolute right-[-12rem] top-32 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/20 blur-[120px]" /><div className="absolute bottom-[-10rem] left-1/4 h-[26rem] w-[26rem] rounded-full bg-[#dfff4f]/10 blur-[120px]" /><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.08),transparent_35%),linear-gradient(rgba(255,255,255,.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.032)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px]" /><section className="relative mx-auto max-w-7xl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><a href="/admin/control-center" className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white/70 backdrop-blur-xl transition hover:bg-white/10">← Control Center</a><span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-cyan-100"><span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(165,243,252,.9)]" />Signal Lab</span></div><header className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-white/[0.07] p-6 shadow-[0_38px_110px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-8 lg:p-10"><div className="max-w-3xl"><div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-white/55"><Sparkles className="h-4 w-4 text-[#dfff4f]" />Dlavie Signal Intelligence</div><h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl lg:text-7xl">Signal center yang hidup, rapi, dan futuristik.</h1><p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/58 sm:text-lg">Panel ini disiapkan untuk memantau aktivitas penting Dlavie dengan gaya modern, unik, rinci, dan tidak terasa seperti dashboard lama.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, text], index) => <Tile key={label} label={label} value={value} text={text} index={index} />)}</div></header><div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><section className="rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_28px_90px_rgba(0,0,0,.28)] backdrop-blur-2xl md:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]/60">Workflow stages</p><h2 className="mt-2 text-3xl font-black tracking-tight">Priority routing</h2></div><div className="grid h-14 w-14 place-items-center rounded-3xl border border-white/10 bg-white/10 text-[#dfff4f]"><Command className="h-6 w-6" /></div></div><div className="mt-6 grid gap-3">{['Capture activity', 'Classify priority', 'Deliver insight'].map((title, index) => <div key={title} className="flex items-start gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 font-black text-[#dfff4f]">{index + 1}</div><div><p className="font-black text-white">{title}</p><p className="mt-1 text-sm font-semibold leading-6 text-white/55">DLAVIE operational layer dibuat lebih jelas, cepat, dan enak dipantau.</p></div></div>)}</div></section><section className="rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_28px_90px_rgba(0,0,0,.28)] backdrop-blur-2xl md:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-violet-100/55">Live preview</p><h2 className="mt-2 text-3xl font-black tracking-tight">Signal timeline</h2></div><Clock3 className="h-7 w-7 text-white/35" /></div><div className="mt-6 space-y-3">{stream.map(([title, text]) => <article key={title} className="group flex items-start gap-4 rounded-[1.6rem] border border-white/10 bg-slate-950/35 p-4 transition hover:bg-slate-950/55"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white"><CheckCircle2 className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-black text-white">{title}</p><p className="mt-1 text-sm font-semibold leading-6 text-white/55">{text}</p></div><ArrowRight className="mt-3 h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#dfff4f]" /></article>)}</div></section></div></section></main>;
}
