import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps } from 'next';
import type { Product } from '@/lib/types';

type Props = { products: Product[] };

export default function Home({ products }: Props) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl rounded-[2rem] border-2 border-slate-900 bg-white p-8 shadow-brutal">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-700">LUMINA</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight">Digital commerce premium untuk produk digital.</h1>
        <p className="mt-5 max-w-2xl text-lg font-semibold text-slate-600">Catalog di bawah membaca data langsung dari Supabase table products.</p>
      </section>
      <section className="mx-auto mt-8 grid max-w-6xl gap-5 md:grid-cols-3">
        {products.length ? products.map((product) => (
          <article key={product.id} className="rounded-3xl border-2 border-slate-900 bg-white p-5 shadow-brutal-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{product.category}</p>
            <h2 className="mt-2 text-2xl font-black">{product.name}</h2>
            <p className="mt-3 font-semibold text-slate-600">{product.description || 'Produk digital premium LUMINA.'}</p>
            <p className="mt-5 text-xl font-black">Rp {product.price.toLocaleString('id-ID')}</p>
          </article>
        )) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-400 bg-white p-8 font-bold text-slate-500 md:col-span-3">Belum ada produk published di Supabase.</div>
        )}
      </section>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { props: { products: [] } };
  const supabase = createClient(url, anonKey);
  const { data } = await supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(24);
  return { props: { products: (data || []) as Product[] } };
};
