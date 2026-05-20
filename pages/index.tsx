import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps } from 'next';
import { ProductCard } from '@/components/product-card';
import { SecretLogoGate } from '@/components/secret-logo-gate';
import { VipStatusBanner } from '@/components/vip-status-banner';
import type { Product } from '@/lib/types';

type Props = { products: Product[] };
type GridMode = 'comfy' | 'dense' | 'showcase';

const ONLINE_USERS = 128;
const VERSION = 'v1.0.0';

const ads = [
  { title: 'Scratch Coupon Soon', text: 'Gosok coupon broadcast owner dan klaim D-Points atau diskon rahasia.', tone: 'from-[#dfff4f] via-[#f5ffd0] to-white' },
  { title: 'DLAVIE Premium', text: 'Aura avatar, booster D-Points, dan akses fitur reward eksklusif.', tone: 'from-[#75b3e5] via-white to-[#eef4ee]' },
  { title: 'Digital Vault', text: 'Produk digital, AI support, checkout aman, dan download setelah fulfilled.', tone: 'from-[#ffd6a3] via-white to-[#eef4ee]' }
];

export default function Home({ products }: Props) {
  const [gridMode, setGridMode] = useState<GridMode>('comfy');
  const [adIndex, setAdIndex] = useState(0);
  const [waveKey, setWaveKey] = useState(0);
  const [clock, setClock] = useState('--:--');
  const [infoOpen, setInfoOpen] = useState(false);
  const activeAd = adIndex % ads.length;
  const currentAd = ads[activeAd];
  const productGrid = useMemo(() => {
    if (gridMode === 'dense') return 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4';
    if (gridMode === 'showcase') return 'grid gap-6 lg:grid-cols-2';
    return 'grid gap-5 md:grid-cols-3';
  }, [gridMode]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const timer = window.setInterval(tick, 1000 * 20);
    return () => window.clearInterval(timer);
  }, []);

  function nextAd() {
    setWaveKey((v) => v + 1);
    setAdIndex((v) => (v + 1) % ads.length);
  }

  function selectAd(index: number) {
    setWaveKey((v) => v + 1);
    setAdIndex(index);
  }

  return <main className="min-h-screen px-4 py-5 text-slate-950 md:px-8 md:py-8"><aside className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 rounded-[2rem] bg-white/70 p-2 shadow-[0_20px_60px_rgba(65,78,74,.18)] ring-1 ring-black/5 backdrop-blur-xl lg:flex lg:flex-col lg:gap-2"><a className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-sm font-black text-[#dfff4f] transition hover:-translate-y-1" href="/">D</a><a className="grid h-12 w-12 place-items-center rounded-full bg-white text-xs font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1" href="#products">Shop</a><a className="grid h-12 w-12 place-items-center rounded-full bg-white text-xs font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1" href="/rewards">Gift</a><a className="grid h-12 w-12 place-items-center rounded-full bg-white text-xs font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1" href="/ai">AI</a><a className="grid h-12 w-12 place-items-center rounded-full bg-[#dfff4f] text-xs font-black text-slate-950 shadow-sm transition hover:-translate-y-1" href="/cart">Cart</a></aside><div className="mx-auto max-w-7xl lg:pl-20"><nav className="dlavie-glass dlavie-glint dlavie-edge-flow dlavie-x-scroll sticky top-4 z-30 flex items-center gap-3 rounded-[2rem] px-4 py-3"><div className="flex min-w-max items-center gap-3"><SecretLogoGate /><div><p className="text-xl font-black tracking-tight">DLAVIE</p><p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Digital Vault</p></div></div><div className="ml-auto flex min-w-max items-center gap-2"><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/login">Login</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/profile">Profile</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/premium">Premium</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/ai">AI</a><a className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5" href="/cart">Cart</a></div></nav><div className="relative z-20 mb-6 mt-3 flex items-start justify-between gap-3 px-2 md:px-4"><div className="min-w-0 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#35cf72] dlavie-live-dot" />{ONLINE_USERS} online</span><span className="text-slate-300">/</span><span>{clock} WIB</span><span className="text-slate-300">/</span><span>{VERSION}</span></div>{infoOpen && <div className="dlavie-info-pop mt-2 max-w-[340px] rounded-[1.4rem] bg-white/80 p-4 text-[11px] font-bold normal-case tracking-normal text-slate-600 shadow-[0_24px_70px_rgba(65,78,74,.16)] ring-1 ring-black/5 backdrop-blur-xl"><p className="font-black uppercase tracking-[0.22em] text-slate-950">DLAVIE Info</p><p className="mt-2 leading-6">{clock} WIB · {VERSION} · {ONLINE_USERS} users online.</p><p className="mt-1 leading-6 text-slate-400">Copyright © DLAVIE 2026. All rights reserved.</p></div>}</div><button onClick={() => setInfoOpen((v) => !v)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-lg font-black text-[#dfff4f] shadow-[0_12px_35px_rgba(15,23,42,.18)] transition hover:-translate-y-0.5 active:scale-95" aria-label="Show DLAVIE info">⌄</button></div><section className="dlavie-glass dlavie-edge-flow dlavie-reveal relative overflow-hidden rounded-[2.5rem] p-6 md:p-10"><div className="dlavie-aurora pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#dfff4f]/45 blur-3xl" /><div className="dlavie-aurora pointer-events-none absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-[#75b3e5]/35 blur-3xl" /><div className="pointer-events-none absolute left-6 top-6 h-3 w-3 rounded-full bg-[#dfff4f] shadow-[0_0_24px_rgba(223,255,79,.9)] dlavie-corner-dot" /><div className="pointer-events-none absolute right-8 top-8 h-2.5 w-2.5 rounded-full bg-[#75b3e5] shadow-[0_0_24px_rgba(117,179,229,.9)] dlavie-corner-dot" /><div className="pointer-events-none absolute bottom-8 right-10 h-3 w-3 rounded-full bg-[#ff9f43] shadow-[0_0_24px_rgba(255,159,67,.65)] dlavie-corner-dot" /><div className="pointer-events-none absolute left-[54%] top-12 hidden h-20 w-20 rounded-full border border-white/70 shadow-inner dlavie-orbit md:block"><span className="absolute -top-1 left-1/2 h-2.5 w-2.5 rounded-full bg-slate-950" /></div><div className="relative grid gap-8 lg:grid-cols-[1.08fr_.92fr]"><div className="flex min-h-[390px] flex-col justify-between"><div><div className="mb-5 flex flex-wrap gap-2"><span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm ring-1 ring-black/5">Live Commerce</span><span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm ring-1 ring-black/5">D-Points Ready</span></div><h1 className="dlavie-text-glow max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">Soft digital commerce for modern creators.</h1><p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">DLAVIE menggabungkan produk digital, D-Points, AI support, reward interaktif, dan pengalaman belanja premium yang smooth.</p></div><div className="mt-8 flex flex-wrap gap-3"><a className="dlavie-hover-lift rounded-full bg-[#dfff4f] px-6 py-4 text-sm font-black text-slate-950 shadow-[0_18px_45px_rgba(120,150,45,.20)]" href="#products">Explore Products</a><a className="dlavie-hover-lift rounded-full bg-white/75 px-6 py-4 text-sm font-black text-slate-950 shadow-sm ring-1 ring-black/5" href="/premium">DLAVIE Premium</a></div></div><div className="grid gap-4"><div className={`dlavie-soft-card dlavie-edge-flow dlavie-shimmer dlavie-glint dlavie-wave is-active relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${currentAd.tone} p-5`} key={waveKey}><div className="pointer-events-none absolute right-5 top-5 text-4xl dlavie-sparkle">✦</div><div className="pointer-events-none absolute bottom-5 left-5 text-2xl dlavie-sparkle">✧</div><div className="dlavie-ad-slide flex items-start justify-between gap-3" key={`content-${activeAd}-${waveKey}`}><div><p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Ads Spotlight</p><h2 className="mt-3 text-3xl font-black tracking-tight">{currentAd.title}</h2><p className="mt-2 font-semibold leading-7 text-slate-600">{currentAd.text}</p></div><button onClick={nextAd} className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-1 active:scale-95">Next</button></div><div className="mt-5 flex gap-2">{ads.map((_, index) => <button key={index} onClick={() => selectAd(index)} className={`h-2.5 rounded-full transition-all duration-500 ${index === activeAd ? 'w-10 bg-slate-950 shadow-[0_0_18px_rgba(15,23,42,.24)]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`} aria-label={`Show ad ${index + 1}`} />)}</div></div><div className="grid grid-cols-2 gap-4"><div className="dlavie-soft-card dlavie-edge-flow dlavie-hover-lift dlavie-glint relative overflow-hidden rounded-[1.7rem] p-5"><span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#35cf72] dlavie-corner-dot" /><p className="text-3xl font-black">{products.length}</p><p className="mt-1 text-sm font-bold text-slate-500">Published products</p></div><div className="dlavie-soft-card dlavie-edge-flow dlavie-hover-lift dlavie-glint relative overflow-hidden rounded-[1.7rem] p-5"><span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-[#75b3e5] dlavie-corner-dot" /><p className="text-3xl font-black">AI</p><p className="mt-1 text-sm font-bold text-slate-500">Persistent support</p></div></div></div></div></section><VipStatusBanner /><section id="products" className="mt-8"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">DLAVIE Vault</p><h2 className="mt-2 text-3xl font-black tracking-tight">Produk Digital</h2></div><div className="dlavie-glint dlavie-edge-flow flex overflow-hidden rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur"><button onClick={() => setGridMode('comfy')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'comfy' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>Comfy</button><button onClick={() => setGridMode('dense')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'dense' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>Dense</button><button onClick={() => setGridMode('showcase')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'showcase' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>Show</button></div></div><div className={productGrid}>{products.map((p) => <ProductCard key={p.id} product={p} />)}{!products.length && <div className="dlavie-soft-card rounded-[2rem] p-8 font-bold text-slate-500 md:col-span-3"><p className="text-3xl font-black text-slate-900">DLAVIE Vault masih kosong.</p><p className="mt-2">Tambahkan produk published dari admin panel agar katalog tampil di sini.</p></div>}</div></section></div></main>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { props: { products: [] } };
  const supabase = createClient(url, anonKey);
  const { data } = await supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(24);
  return { props: { products: (data || []) as Product[] } };
};
