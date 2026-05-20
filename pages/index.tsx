import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps } from 'next';
import { AudioSensor } from '@/components/audio-sensor';
import { ProductCard } from '@/components/product-card';
import { SecretLogoGate } from '@/components/secret-logo-gate';
import { VipStatusBanner } from '@/components/vip-status-banner';
import type { Product } from '@/lib/types';

type Props = { products: Product[] };

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function Home({ products }: Props) {
  return <main className="min-h-screen px-4 py-5 text-slate-950 md:px-8 md:py-8"><div className="mx-auto max-w-7xl"><nav className="dlavie-glass sticky top-4 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] px-4 py-3"><div className="flex items-center gap-3"><SecretLogoGate /><div><p className="text-xl font-black tracking-tight">DLAVIE</p><p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Digital Vault</p></div></div><div className="flex flex-wrap items-center gap-2"><AudioSensor /><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/profile">Profile</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/premium">Premium</a><a className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white" href="/ai">AI</a><a className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5" href="/cart">Cart</a></div></nav><section className="dlavie-glass relative overflow-hidden rounded-[2.5rem] p-6 md:p-10"><div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#dfff4f]/45 blur-3xl" /><div className="pointer-events-none absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-[#75b3e5]/35 blur-3xl" /><div className="relative grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><div className="flex min-h-[390px] flex-col justify-between"><div><p className="inline-flex rounded-full bg-white/65 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-slate-500 shadow-sm ring-1 ring-black/5">{timeGreeting()}, Dlavier</p><h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">Soft digital commerce for modern creators.</h1><p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-600">DLAVIE menggabungkan produk digital, D-Points, AI support, reward interaktif, dan pengalaman belanja premium yang smooth.</p></div><div className="mt-8 flex flex-wrap gap-3"><a className="rounded-full bg-[#dfff4f] px-6 py-4 text-sm font-black text-slate-950 shadow-[0_18px_45px_rgba(120,150,45,.20)] transition hover:-translate-y-1" href="#products">Explore Products</a><a className="rounded-full bg-white/75 px-6 py-4 text-sm font-black text-slate-950 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1" href="/premium">DLAVIE Premium</a></div></div><div className="grid gap-4"><div className="dlavie-soft-card rounded-[2rem] p-5"><p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Today Highlight</p><div className="mt-4 rounded-[1.5rem] bg-gradient-to-br from-[#2467c9] to-[#75b3e5] p-6 text-white"><p className="text-4xl font-black">D-Points</p><p className="mt-2 font-semibold text-white/80">Earn reward from every checkout, check-in, gift, and future scratch coupon.</p></div></div><div className="grid grid-cols-2 gap-4"><div className="dlavie-soft-card rounded-[1.7rem] p-5"><p className="text-3xl font-black">{products.length}</p><p className="mt-1 text-sm font-bold text-slate-500">Published products</p></div><div className="dlavie-soft-card rounded-[1.7rem] p-5"><p className="text-3xl font-black">AI</p><p className="mt-1 text-sm font-bold text-slate-500">Persistent support</p></div></div></div></div></section><VipStatusBanner /><section id="products" className="mx-auto mt-8 grid gap-5 md:grid-cols-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}{!products.length && <div className="dlavie-soft-card rounded-[2rem] p-8 font-bold text-slate-500 md:col-span-3"><p className="text-3xl font-black text-slate-900">DLAVIE Vault masih kosong.</p><p className="mt-2">Tambahkan produk published dari admin panel agar katalog tampil di sini.</p></div>}</section></div></main>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { props: { products: [] } };
  const supabase = createClient(url, anonKey);
  const { data } = await supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(24);
  return { props: { products: (data || []) as Product[] } };
};
