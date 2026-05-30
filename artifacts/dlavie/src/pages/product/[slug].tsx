import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from '@/lib/types';

function price(value: number) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export default function ProductDetail() {
  const [_match, params] = useRoute('/product/:slug');
  const slug = params?.slug || '';
  const add = useCartStore((s) => s.add);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) { setLoading(false); return; }
    const supabase = createClient(url, anonKey);
    void supabase.from('products').select('*').eq('slug', slug).eq('is_published', true).maybeSingle()
      .then(({ data, error }) => {
        if (!error) setProduct((data || null) as Product | null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <main className="min-h-screen p-6 flex items-center justify-center"><div className="text-slate-400 font-black">Memuat produk...</div></main>;
  if (!product) return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-xl rounded-[2.5rem] p-6"><h1 className="text-3xl font-black">Produk tidak ditemukan</h1><a className="mt-5 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black" href="/">Kembali ke katalog</a></section></main>;
  const points = Math.max(5, Math.floor(Number(product.price || 0) / 10000));
  return <main className="min-h-screen p-6 text-slate-950"><section className="dlavie-glass relative mx-auto grid max-w-6xl gap-8 overflow-hidden rounded-[2.5rem] p-6 md:grid-cols-2 md:p-8"><div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#dfff4f]/45 blur-3xl" /><div className="pointer-events-none absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-[#75b3e5]/35 blur-3xl" /><div className="relative rounded-[2rem] bg-white/55 p-4 ring-1 ring-black/5">{product.image_url ? <img src={product.image_url} alt={product.name} className="aspect-square w-full rounded-[1.5rem] object-cover shadow-[0_18px_55px_rgba(65,78,74,.16)]" /> : <div className="flex aspect-square items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#f8fbf2] to-[#dfe8e2] text-center text-5xl font-black text-slate-300">DLAVIE</div>}</div><div className="relative flex flex-col justify-center"><p className="inline-flex w-fit rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.26em] text-slate-500 ring-1 ring-black/5">{product.category}</p><h1 className="mt-5 text-5xl font-black leading-tight tracking-tight md:text-6xl">{product.name}</h1><p className="mt-5 whitespace-pre-wrap text-lg font-semibold leading-8 text-slate-600">{product.description || 'Produk digital premium DLAVIE dengan akses cepat, aman, dan siap digunakan setelah order fulfilled.'}</p><p className="mt-6 text-4xl font-black">{price(product.price)}</p><div className="mt-6 grid gap-3 md:grid-cols-3"><div className="dlavie-soft-card rounded-[1.4rem] p-4 font-bold">Akses digital</div><div className="dlavie-soft-card rounded-[1.4rem] p-4 font-bold">Secure checkout</div><div className="dlavie-soft-card rounded-[1.4rem] p-4 font-bold">+{points} D-Points</div></div><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => add(product)} className="rounded-full bg-[#dfff4f] px-6 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1">Tambah ke Cart</button><a href="/cart" className="rounded-full bg-slate-950 px-6 py-4 font-black text-white shadow-sm transition hover:-translate-y-1">Lihat Cart</a><a href="/" className="rounded-full bg-white/75 px-6 py-4 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white">Katalog</a></div></div></section></main>;
}

