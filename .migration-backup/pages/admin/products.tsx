import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Product } from '@/lib/types';

export default function AdminProducts() {
  const [token, setToken] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState('Loading products...');

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat produk.');
    setProducts(json.products || []);
    setStatus('');
  }

  async function toggle(product: Product) {
    const res = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: product.id, is_published: !product.is_published }) });
    const json = await res.json();
    setStatus(res.ok ? 'Produk diperbarui.' : json.error || 'Update gagal.');
    await load();
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (!nextToken) return setStatus('Login sebagai admin dulu.');
      load(nextToken);
    });
  }, []);

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-5xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Products</h1></div><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm" href="/admin">Tambah Produk</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{products.map((product) => <div key={product.id} className="rounded-[1.7rem] bg-white/70 p-4 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{product.name}</p><p className="font-semibold text-slate-600">Rp {product.price.toLocaleString('id-ID')} · {product.category} · {product.is_published ? 'Published' : 'Draft'}</p><p className="mt-1 text-sm font-semibold text-slate-500">{product.badge || 'DLAVIE'} · Stock {product.stock ?? 99}</p><p className="break-all text-xs font-semibold text-slate-400">{product.id}</p></div><div className="flex flex-wrap gap-2"><a href={`/admin/products/${product.id}`} className="rounded-full bg-white px-4 py-3 font-black shadow-sm ring-1 ring-black/5">Edit</a><button onClick={() => toggle(product)} className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm">Toggle Publish</button></div></div></div>)}{!products.length && !status && <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/50 p-6 font-bold text-slate-500">Belum ada produk.</p>}</div></section></main>;
}
