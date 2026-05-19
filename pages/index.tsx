import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps } from 'next';
import { AudioSensor } from '@/components/audio-sensor';
import { ProductCard } from '@/components/product-card';
import { SecretLogoGate } from '@/components/secret-logo-gate';
import { VipStatusBanner } from '@/components/vip-status-banner';
import type { Product } from '@/lib/types';

type Props = { products: Product[] };
export default function Home({ products }: Props) {
  return <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950"><nav className="mx-auto mb-6 flex max-w-6xl flex-wrap items-center justify-between gap-3"><SecretLogoGate /><div className="flex flex-wrap gap-3"><AudioSensor /><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/profile">Profile</a><a className="rounded-xl border-2 border-slate-900 bg-amber-300 px-4 py-2 font-black shadow-brutal-sm" href="/premium">Premium</a><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/gift">Gift</a><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/ai">AI</a><a className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-2 font-black shadow-brutal-sm" href="/cart">Cart</a></div></nav><section className="mx-auto max-w-6xl rounded-[2rem] border-2 border-slate-900 bg-white p-8 shadow-brutal"><p className="font-black uppercase tracking-[0.3em] text-emerald-700">LUMINA</p><h1 className="mt-4 text-5xl font-black">Digital commerce premium.</h1><p className="mt-4 max-w-2xl font-semibold text-slate-600">Produk digital, reward, AI support, dan premium experience dalam satu platform.</p></section><VipStatusBanner /><section className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-3">{products.map((p) => <ProductCard key={p.id} product={p} />)}{!products.length && <div className="rounded-3xl border-2 border-dashed border-slate-400 bg-white p-8 font-bold text-slate-500 md:col-span-3">Belum ada produk published di Supabase.</div>}</section></main>;
}
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { props: { products: [] } };
  const supabase = createClient(url, anonKey);
  const { data } = await supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(24);
  return { props: { products: (data || []) as Product[] } };
};
