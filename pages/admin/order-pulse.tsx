import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock3, CreditCard, PackageCheck, RefreshCw, ShoppingBag, Sparkles, TrendingUp, XCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order } from '@/lib/types';

function money(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function statusTone(status: string) {
  if (status === 'paid') return 'border-emerald-300/25 bg-emerald-400/15 text-emerald-100';
  if (status === 'fulfilled') return 'border-cyan-300/25 bg-cyan-400/15 text-cyan-100';
  if (status === 'cancelled') return 'border-rose-300/25 bg-rose-400/15 text-rose-100';
  return 'border-amber-300/25 bg-amber-400/15 text-amber-100';
}

function Metric({ label, value, detail, index }: { label: string; value: string; detail: string; index: number }) {
  const Icon = [ShoppingBag, TrendingUp, Clock3, PackageCheck][index] || ShoppingBag;
  const glow = ['bg-cyan-400/25', 'bg-emerald-400/25', 'bg-amber-400/20', 'bg-violet-500/25'][index] || 'bg-cyan-400/25';
  return <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_24px_80px_rgba(0,0,0,.26)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.105]"><div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${glow}`} /><div className="relative flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/42">{label}</p><h3 className="mt-3 text-3xl font-black tracking-tight text-white">{value}</h3><p className="mt-2 text-sm font-semibold leading-6 text-white/56">{detail}</p></div><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-inner"><Icon className="h-5 w-5" /></div></div></article>;
}

export default function OrderPulse() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(24);
    setLoading(false);
    if (error) setStatus(error.message);
    setOrders((data || []) as Order[]);
  }

  async function mark(id: string, next: Order['status']) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('orders').update({ status: next }).eq('id', id);
    setStatus(error ? error.message : 'Order pulse updated.');
    await load();
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
      setAllowed(Boolean(data.user?.email && admins.includes(data.user.email.toLowerCase())));
      setChecking(false);
    });
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed]);

  const stats = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const pending = orders.filter((order) => order.status === 'pending').length;
    const paid = orders.filter((order) => order.status === 'paid' || order.status === 'fulfilled').length;
    return [
      ['Orders', String(orders.length), 'Latest commerce activity loaded from Dlavie.'],
      ['Revenue', money(total), 'Total value from the visible recent orders.'],
      ['Pending', String(pending), 'Orders that still need attention.'],
      ['Cleared', String(paid), 'Paid or fulfilled orders in the current pulse.'],
    ];
  }, [orders]);

  if (checking) return <main className="min-h-screen bg-[#050811] p-6 text-white">Checking admin access...</main>;
  if (!allowed) return <main className="grid min-h-screen place-items-center bg-[#050811] p-6 text-white"><section className="max-w-lg rounded-[2.5rem] border border-white/10 bg-white/10 p-7 shadow-2xl backdrop-blur-xl"><p className="text-xs font-black uppercase tracking-[0.32em] text-white/40">DLAVIE SECURITY</p><h1 className="mt-3 text-4xl font-black">Admin Locked</h1><p className="mt-3 font-semibold leading-7 text-white/60">Login memakai email owner yang terdaftar sebagai admin.</p><a className="mt-6 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/login">Login</a></section></main>;

  return <main className="relative min-h-screen overflow-hidden bg-[#050811] px-4 py-6 text-white sm:px-6 lg:px-8"><div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-[120px]" /><div className="absolute right-[-12rem] top-24 h-[30rem] w-[30rem] rounded-full bg-violet-600/22 blur-[120px]" /><div className="absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[#dfff4f]/10 blur-[120px]" /><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.08),transparent_35%),linear-gradient(rgba(255,255,255,.032)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.032)_1px,transparent_1px)] bg-[size:auto,42px_42px,42px_42px]" /><section className="relative mx-auto max-w-7xl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><a href="/admin/signal" className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white/70 backdrop-blur-xl transition hover:bg-white/10">← Signal Center</a><button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white/70 transition hover:bg-white/10"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div><header className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-white/[0.07] p-6 shadow-[0_38px_110px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-8 lg:p-10"><div className="max-w-3xl"><div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-white/55"><Sparkles className="h-4 w-4 text-[#dfff4f]" />Dlavie Commerce Pulse</div><h1 className="mt-5 text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl lg:text-7xl">Order pulse yang premium dan responsif.</h1><p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/58 sm:text-lg">Pantau order terbaru dengan visual yang lebih hidup, ringkas, dan siap disambungkan ke alert real-time.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, detail], index) => <Metric key={label} label={label} value={value} detail={detail} index={index} />)}</div></header>{status && <p className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-4 font-bold text-white/65">{status}</p>}<section className="mt-6 rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_28px_90px_rgba(0,0,0,.28)] backdrop-blur-2xl md:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-100/55">Recent order stream</p><h2 className="mt-2 text-3xl font-black tracking-tight">Commerce timeline</h2></div><span className="rounded-full border border-emerald-300/25 bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-100">Live data</span></div><div className="mt-6 grid gap-4">{orders.map((order) => <article key={order.id} className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-950/35 p-4 transition hover:-translate-y-0.5 hover:bg-slate-950/55"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${statusTone(order.status)}`}>{order.status}</span><span className="text-xs font-bold text-white/35">#{String(order.id).slice(0, 8)}</span></div><p className="mt-3 truncate text-lg font-black text-white">{order.buyer_email}</p><p className="mt-1 text-sm font-semibold text-white/55">{money(Number(order.total_amount || 0))}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => mark(order.id, 'paid')} className="rounded-full bg-[#dfff4f] px-4 py-3 text-xs font-black text-slate-950"><CreditCard className="mr-1 inline h-4 w-4" />Paid</button><button onClick={() => mark(order.id, 'fulfilled')} className="rounded-full bg-white px-4 py-3 text-xs font-black text-slate-950"><CheckCircle2 className="mr-1 inline h-4 w-4" />Done</button><button onClick={() => mark(order.id, 'cancelled')} className="rounded-full border border-white/10 bg-white/[0.07] px-4 py-3 text-xs font-black text-white/70"><XCircle className="mr-1 inline h-4 w-4" />Cancel</button></div></div></article>)}{!orders.length && <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.045] p-8 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-white/30" /><p className="mt-4 text-xl font-black text-white">Belum ada order di pulse.</p><p className="mt-2 text-sm font-semibold text-white/50">Begitu order masuk, timeline ini akan terasa jauh lebih hidup.</p></div>}</div></section></section></main>;
}
