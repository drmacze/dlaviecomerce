import { useEffect, useMemo, useState } from 'react';
import { Activity, BellRing, Boxes, CheckCircle2, Clock3, Database, Gauge, RefreshCw, ShieldCheck, ShoppingBag, Sparkles, TicketPercent, TriangleAlert, Users, Zap } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Stats = {
  generatedAt?: string;
  counts?: Record<string, { count: number; error: string | null }>;
  commerce?: { revenueVisible?: number; statusBreakdown?: Record<string, number>; recentOrders?: Array<Record<string, unknown>> };
  catalog?: { recentProducts?: Array<Record<string, unknown>>; recentCoupons?: Array<Record<string, unknown>> };
  observability?: { notificationBreakdown?: Record<string, number>; recentNotifications?: Array<Record<string, unknown>>; recentAudits?: Array<Record<string, unknown>> };
  health?: { env?: Record<string, boolean>; tableErrors?: Record<string, string | null>; supabase?: string };
};

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function time(value?: unknown) {
  if (!value) return '-';
  try { return new Date(String(value)).toLocaleString('id-ID'); } catch { return String(value); }
}

function Metric({ label, value, detail, index }: { label: string; value: string; detail: string; index: number }) {
  const Icon = [ShoppingBag, Boxes, TicketPercent, Users, BellRing, ShieldCheck, Database, Gauge][index] || Activity;
  const glow = ['bg-cyan-400/25', 'bg-violet-500/25', 'bg-pink-400/20', 'bg-indigo-400/20', 'bg-emerald-400/25', 'bg-[#dfff4f]/20', 'bg-sky-400/20', 'bg-amber-400/20'][index] || 'bg-cyan-400/25';
  return <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,.26)] backdrop-blur-xl"><div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${glow}`} /><div className="relative flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/42">{label}</p><h3 className="mt-3 text-3xl font-black tracking-tight text-white">{value}</h3><p className="mt-2 text-sm font-semibold leading-6 text-white/56">{detail}</p></div><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-inner"><Icon className="h-5 w-5" /></div></div></article>;
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <section className="rounded-[2.4rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_28px_90px_rgba(0,0,0,.28)] backdrop-blur-2xl md:p-7"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]/60">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-tight">{title}</h2>{children}</section>;
}

export default function AdminIntelligence() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<Stats>({});
  const [status, setStatus] = useState('Loading intelligence...');
  const [loading, setLoading] = useState(false);

  async function load(nextToken = token) {
    if (!nextToken) return;
    setLoading(true);
    const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${nextToken}` } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setStatus(data.error || 'Failed to load stats.');
    setStats(data);
    setStatus(`Updated ${time(data.generatedAt)}`);
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || '';
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
      const ok = Boolean(email && admins.includes(email.toLowerCase()));
      setAllowed(ok);
      setToken(data.session?.access_token || '');
      setChecking(false);
      if (ok && data.session?.access_token) load(data.session.access_token);
      else setStatus('Login sebagai admin.');
    });
  }, []);

  const metrics = useMemo(() => {
    const c = stats.counts || {};
    return [
      ['Orders', String(c.orders?.count || 0), 'Total order records in database.'],
      ['Products', String(c.products?.count || 0), 'Catalog records available.'],
      ['Coupons', String(c.coupons?.count || 0), 'Promo rules in database.'],
      ['Profiles', String(c.profiles?.count || 0), 'Known member profiles.'],
      ['Notify Logs', String(c.notificationLogs?.count || 0), 'Telegram and delivery records.'],
      ['Audit Logs', String(c.auditLogs?.count || 0), 'Admin action records.'],
      ['Revenue View', money(stats.commerce?.revenueVisible || 0), 'Visible revenue from recent order batch.'],
      ['Health', stats.health?.supabase === 'reachable' ? 'OK' : 'Check', 'Supabase API health signal.'],
    ];
  }, [stats]);

  const envEntries = Object.entries(stats.health?.env || {});
  const tableErrors = Object.entries(stats.health?.tableErrors || {}).filter(([, error]) => Boolean(error));
  const orderBreakdown = Object.entries(stats.commerce?.statusBreakdown || {});
  const notifyBreakdown = Object.entries(stats.observability?.notificationBreakdown || {});

  if (checking) return <main className="min-h-screen bg-[#050811] p-6 text-white">Checking admin access...</main>;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-[#050811] p-6 text-white"><section className="max-w-lg rounded-[2.5rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-white/40">DLAVIE SECURITY</p><h1 className="mt-3 text-4xl font-black">Admin Locked</h1><p className="mt-3 font-semibold leading-7 text-white/60">Login memakai email owner yang terdaftar sebagai admin.</p><a className="mt-6 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/login">Login</a></section></main>;

  return <main className="relative min-h-screen overflow-hidden bg-[#050811] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-cyan-500/20 blur-[120px]" /><div className="absolute right-[-13rem] top-24 h-[32rem] w-[32rem] rounded-full bg-violet-600/22 blur-[120px]" /><div className="absolute bottom-[-12rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-[#dfff4f]/10 blur-[120px]" /><section className="relative mx-auto max-w-7xl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><a href="/admin/hub" className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white/70 backdrop-blur-xl transition hover:bg-white/10">← Admin Hub</a><button onClick={() => load()} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white/70"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh intelligence</button></div><header className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-white/[0.07] p-6 shadow-[0_38px_110px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-8 lg:p-10"><div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-white/55"><Sparkles className="h-4 w-4 text-[#dfff4f]" />Dlavie Admin Intelligence</div><h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl lg:text-7xl">Rincian sistem penting dalam satu pusat kendali.</h1><p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/58 sm:text-lg">{status}</p><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, detail], index) => <Metric key={label} label={label} value={value} detail={detail} index={index} />)}</div></header><div className="mt-6 grid gap-6 lg:grid-cols-2"><Panel eyebrow="Commerce" title="Order status breakdown"><div className="mt-5 grid gap-3">{orderBreakdown.map(([key, value]) => <div key={key} className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4"><span className="font-black uppercase tracking-[0.15em] text-white/60">{key}</span><span className="text-2xl font-black">{value}</span></div>)}{!orderBreakdown.length && <p className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.045] p-5 font-bold text-white/45">Belum ada order breakdown.</p>}</div></Panel><Panel eyebrow="Health" title="Environment readiness"><div className="mt-5 grid gap-3">{envEntries.map(([key, ok]) => <div key={key} className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4"><span className="font-black text-white/65">{key}</span><span className={`rounded-full px-3 py-1 text-xs font-black ${ok ? 'bg-emerald-400/15 text-emerald-100' : 'bg-rose-400/15 text-rose-100'}`}>{ok ? 'READY' : 'MISSING'}</span></div>)}</div></Panel><Panel eyebrow="Notification" title="Delivery breakdown"><div className="mt-5 grid gap-3">{notifyBreakdown.map(([key, value]) => <div key={key} className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4"><span className="font-black uppercase tracking-[0.15em] text-white/60">{key}</span><span className="text-2xl font-black">{value}</span></div>)}{!notifyBreakdown.length && <p className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.045] p-5 font-bold text-white/45">Belum ada notification breakdown.</p>}</div></Panel><Panel eyebrow="Integrity" title="Table readiness"><div className="mt-5 grid gap-3">{tableErrors.length ? tableErrors.map(([key, error]) => <div key={key} className="rounded-[1.4rem] border border-rose-300/20 bg-rose-400/10 p-4"><p className="font-black text-rose-100">{key}</p><p className="mt-1 text-sm font-semibold text-rose-100/65">{error}</p></div>) : <div className="flex items-center gap-3 rounded-[1.4rem] border border-emerald-300/20 bg-emerald-400/10 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-100" /><p className="font-black text-emerald-100">All checked tables are reachable.</p></div>}</div></Panel></div><div className="mt-6 grid gap-6 lg:grid-cols-3"><Panel eyebrow="Recent" title="Orders"><div className="mt-5 space-y-3">{(stats.commerce?.recentOrders || []).slice(0, 6).map((item) => <div key={String(item.id)} className="rounded-[1.35rem] border border-white/10 bg-slate-950/35 p-4"><p className="font-black text-white">{String(item.buyer_email || 'unknown')}</p><p className="mt-1 text-sm font-semibold text-white/45">{String(item.status || '-')} · {money(Number(item.total_amount || 0))}</p></div>)}</div></Panel><Panel eyebrow="Recent" title="Products"><div className="mt-5 space-y-3">{(stats.catalog?.recentProducts || []).slice(0, 6).map((item) => <div key={String(item.id)} className="rounded-[1.35rem] border border-white/10 bg-slate-950/35 p-4"><p className="font-black text-white">{String(item.name || 'unknown')}</p><p className="mt-1 text-sm font-semibold text-white/45">{money(Number(item.price || 0))}</p></div>)}</div></Panel><Panel eyebrow="Recent" title="Audits"><div className="mt-5 space-y-3">{(stats.observability?.recentAudits || []).slice(0, 6).map((item) => <div key={String(item.id)} className="rounded-[1.35rem] border border-white/10 bg-slate-950/35 p-4"><p className="font-black text-white">{String(item.action || 'audit')}</p><p className="mt-1 text-sm font-semibold text-white/45">{String(item.admin_email || 'system')}</p></div>)}</div></Panel></div></section></main>;
}
