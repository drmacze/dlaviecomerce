import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function SecurityCenter() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || '';
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
      setAllowed(Boolean(email && admins.includes(email.toLowerCase())));
      setChecking(false);
    });
  }, []);

  if (checking) return <main className="min-h-screen bg-[#050811] p-6 text-white">Checking admin access...</main>;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-[#050811] p-6 text-white"><section className="max-w-lg rounded-[2.5rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-white/40">DLAVIE SECURITY</p><h1 className="mt-3 text-4xl font-black">Admin Locked</h1><p className="mt-3 font-semibold leading-7 text-white/60">Login memakai email owner yang terdaftar sebagai admin.</p><a className="mt-6 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/login">Login</a></section></main>;

  return <main className="relative min-h-screen overflow-hidden bg-[#050811] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-emerald-500/20 blur-[120px]" /><div className="absolute right-[-12rem] top-24 h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-[120px]" /><section className="relative mx-auto max-w-6xl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><a href="/admin/hub" className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white/70 backdrop-blur-xl transition hover:bg-white/10">← Admin Hub</a><span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-100"><span className="h-2 w-2 rounded-full bg-emerald-200" />Security Layer</span></div><header className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-white/[0.07] p-6 shadow-[0_38px_110px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-8 lg:p-10"><div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-white/55"><Sparkles className="h-4 w-4 text-[#dfff4f]" />Dlavie Security Center</div><h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl">Security foundation aktif.</h1><p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/58 sm:text-lg">Panel ini menjadi pusat observability untuk notification logs, audit logs, admin guard, dan health checks Dlavie.</p><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5"><ShieldCheck className="h-7 w-7 text-emerald-200" /><p className="mt-4 text-2xl font-black">Guarded</p><p className="mt-2 text-sm font-semibold text-white/50">Admin route dilindungi email owner.</p></div><div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5"><CheckCircle2 className="h-7 w-7 text-cyan-200" /><p className="mt-4 text-2xl font-black">Logged</p><p className="mt-2 text-sm font-semibold text-white/50">Foundation log sudah tersedia.</p></div><div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5"><RefreshCw className="h-7 w-7 text-[#dfff4f]" /><p className="mt-4 text-2xl font-black">Expandable</p><p className="mt-2 text-sm font-semibold text-white/50">Siap dihubungkan ke data real-time.</p></div></div></header></section></main>;
}
