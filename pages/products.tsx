import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps } from 'next';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

type Props = { products: Product[] };
type GridMode = 'comfy' | 'dense' | 'showcase';

export default function ProductsPage({ products }: Props) {
  const [gridMode, setGridMode] = useState<GridMode>('comfy');
  const productGrid = useMemo(() => {
    if (gridMode === 'dense') return 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4';
    if (gridMode === 'showcase') return 'grid gap-6 lg:grid-cols-2';
    return 'grid gap-5 md:grid-cols-3';
  }, [gridMode]);

  return <main className="min-h-screen overflow-hidden px-4 py-6 text-slate-950 md:px-8"><div className="pointer-events-none fixed inset-0 -z-10"><div className="dlavie-aurora absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#dfff4f]/25 blur-3xl" /><div className="dlavie-aurora absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full bg-[#75b3e5]/25 blur-3xl" /><div className="absolute inset-0 dlavie-grid-bg opacity-40" /></div><section className="dlavie-glass dlavie-edge-flow mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE CATALOG</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Produk Digital</h1><p className="mt-3 max-w-2xl font-semibold leading-7 text-slate-600">Katalog khusus untuk menjelajah produk DLAVIE tanpa membuat homepage terasa panjang.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-slate-950 px-5 py-3 font-black text-[#dfff4f] shadow-sm" href="/">Home</a><a className="rounded-full bg-white/75 px-5 py-3 font-black shadow-sm ring-1 ring-black/5" href="/cart">Cart</a></div></div><div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div className="rounded-full bg-white/65 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm ring-1 ring-black/5">{products.length} published products</div><div className="dlavie-glint dlavie-edge-flow flex overflow-hidden rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur"><button onClick={() => setGridMode('comfy')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'comfy' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>Comfy</button><button onClick={() => setGridMode('dense')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'dense' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>Dense</button><button onClick={() => setGridMode('showcase')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'showcase' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>Show</button></div></div><div className="mt-6"><div className={productGrid}>{products.map((p) => <ProductCard key={p.id} product={p} />)}{!products.length && <div className="dlavie-soft-card rounded-[2rem] p-8 font-bold text-slate-500 md:col-span-3"><p className="text-3xl font-black text-slate-900">DLAVIE Catalog masih kosong.</p><p className="mt-2">Tambahkan produk published dari admin panel agar katalog tampil di sini.</p></div>}</div></div></section></main>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { props: { products: [] } };
  const supabase = createClient(url, anonKey);
  const { data } = await supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(48);
  return { props: { products: (data || []) as Product[] } };
};
