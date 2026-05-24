import { useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps } from 'next';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';

type Props = { products: Product[] };
type GridMode = 'comfy' | 'dense' | 'showcase';

const services = [
  { label: 'Pulsa', href: '/products?type=pulsa', tone: '#dfff4f', path: 'M7 4h10v16H7z M10 7h4 M11 17h2' },
  { label: 'Data', href: '/products?type=data', tone: '#75b3e5', path: 'M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16z M4 12h16 M12 4c2 2 3 5 3 8s-1 6-3 8 M12 4c-2 2-3 5-3 8s1 6 3 8' },
  { label: 'PLN', href: '/products?type=pln', tone: '#f8ffbd', path: 'M13 2 4 14h7l-1 8 10-13h-7z' },
  { label: 'Game', href: '/products?type=game', tone: '#c9b6ff', path: 'M7 13h3 M8.5 11.5v3 M15 12h.01 M17 14h.01 M6 8h12a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3l-2-2H8l-2 2a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3z' },
  { label: 'Voucher', href: '/products?type=voucher', tone: '#ffd6a3', path: 'M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z M9 9v6 M15 9v6' },
  { label: 'Wallet', href: '/wallet', tone: '#35cf72', path: 'M4 7h16v12H4z M16 12h4 M7 7V5h10v2' }
];

export default function ProductsPage({ products }: Props) {
  const [gridMode, setGridMode] = useState<GridMode>('comfy');
  const productGrid = useMemo(() => {
    if (gridMode === 'dense') return 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4';
    if (gridMode === 'showcase') return 'grid gap-6 lg:grid-cols-2';
    return 'grid gap-5 md:grid-cols-3';
  }, [gridMode]);

  return <main className="dlavie-system-page px-4 py-6 md:px-8">
    <div className="dlavie-mesh" />
    <section className="dlavie-mica dlavie-ring mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-5 md:p-8">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
        <article className="dlavie-wave-card relative overflow-hidden rounded-[2.1rem] bg-white/62 p-5 ring-1 ring-black/5 md:p-7">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#dfff4f]/50 blur-3xl dlavie-float-orb" />
          <p className="relative text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">DLAVIE PPOB</p>
          <h1 className="relative mt-3 max-w-3xl text-4xl font-black leading-[.95] tracking-[-.045em] md:text-6xl">Pilih layanan digital dengan cepat.</h1>
          <p className="relative mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 md:text-base">Pulsa, paket data, token PLN, game, voucher, dan produk digital lain ditampilkan seperti menu aplikasi. Ringkas, jelas, dan siap checkout.</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <a className="dlavie-lime-btn rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-1" href="/wallet">Isi D-Balance</a>
            <a className="dlavie-primary-btn rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-1" href="/cart">Buka Cart</a>
          </div>
        </article>

        <aside className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {services.map((service) => <a key={service.label} href={service.href} style={{ '--tone': service.tone } as React.CSSProperties} className="dlavie-service-glow dlavie-lift rounded-[1.55rem] bg-white/68 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
            <span className="grid h-12 w-12 place-items-center rounded-[1.15rem] bg-white shadow-sm ring-1 ring-black/5">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d={service.path} /></svg>
            </span>
            <p className="mt-4 text-lg font-black">{service.label}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">Tap untuk lihat produk</p>
          </a>)}
        </aside>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm ring-1 ring-black/5">{products.length} published products</div>
        <div className="dlavie-ring flex overflow-hidden rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <button onClick={() => setGridMode('comfy')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'comfy' ? 'bg-slate-950 text-[#dfff4f]' : 'text-slate-500 hover:text-slate-950'}`}>Comfy</button>
          <button onClick={() => setGridMode('dense')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'dense' ? 'bg-slate-950 text-[#dfff4f]' : 'text-slate-500 hover:text-slate-950'}`}>Dense</button>
          <button onClick={() => setGridMode('showcase')} className={`rounded-full px-4 py-2 text-xs font-black transition ${gridMode === 'showcase' ? 'bg-slate-950 text-[#dfff4f]' : 'text-slate-500 hover:text-slate-950'}`}>Show</button>
        </div>
      </div>

      <div className="mt-6"><div className={productGrid}>{products.map((p) => <ProductCard key={p.id} product={p} />)}{!products.length && <div className="dlavie-mica rounded-[2rem] p-8 font-bold text-slate-500 md:col-span-3"><p className="text-3xl font-black text-slate-900">Katalog masih kosong.</p><p className="mt-2">Tambahkan produk published dari admin panel agar layanan tampil di sini.</p></div>}</div></div>
    </section>
  </main>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { props: { products: [] } };
  const supabase = createClient(url, anonKey);
  const { data } = await supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(48);
  return { props: { products: (data || []) as Product[] } };
};