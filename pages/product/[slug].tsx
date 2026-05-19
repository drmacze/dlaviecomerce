import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps } from 'next';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/lib/types';

type Props = { product: Product | null };

export default function ProductDetail({ product }: Props) {
  const add = useCartStore((s) => s.add);
  if (!product) return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Produk tidak ditemukan</h1><a className="mt-5 inline-block font-black text-emerald-700" href="/">Kembali ke katalog</a></section></main>;
  return <main className="min-h-screen bg-slate-50 p-6 text-slate-950"><section className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border-2 border-slate-900 bg-white p-6 shadow-brutal md:grid-cols-2"><div className="rounded-[1.5rem] border-2 border-slate-900 bg-slate-100 p-5">{product.image_url ? <img src={product.image_url} alt={product.name} className="aspect-square w-full rounded-2xl object-cover" /> : <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-slate-400 text-center text-3xl font-black text-slate-400">LUMINA</div>}</div><div className="flex flex-col justify-center"><p className="font-black uppercase tracking-[0.3em] text-emerald-700">{product.category}</p><h1 className="mt-3 text-5xl font-black">{product.name}</h1><p className="mt-5 whitespace-pre-wrap text-lg font-semibold text-slate-600">{product.description || 'Produk digital premium LUMINA.'}</p><p className="mt-6 text-4xl font-black">Rp {product.price.toLocaleString('id-ID')}</p><div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-2xl border-2 border-slate-900 p-3 font-bold">Akses digital</div><div className="rounded-2xl border-2 border-slate-900 p-3 font-bold">Checkout aman</div><div className="rounded-2xl border-2 border-slate-900 p-3 font-bold">Download setelah fulfilled</div></div><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => add(product)} className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Tambah ke Cart</button><a href="/cart" className="rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-black shadow-brutal-sm">Lihat Cart</a><a href="/" className="rounded-xl border-2 border-slate-900 bg-white px-5 py-3 font-black shadow-brutal-sm">Katalog</a></div></div></section></main>;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || !slug) return { props: { product: null } };
  const supabase = createClient(url, anonKey);
  const { data } = await supabase.from('products').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();
  return { props: { product: (data || null) as Product | null } };
};
