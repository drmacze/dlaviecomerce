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

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-5xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Admin Products</h1><a className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-2 font-black shadow-brutal-sm" href="/admin">Tambah Produk</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{products.map((product) => <div key={product.id} className="rounded-2xl border-2 border-slate-900 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{product.name}</p><p className="font-semibold text-slate-600">Rp {product.price.toLocaleString('id-ID')} · {product.category} · {product.is_published ? 'Published' : 'Draft'}</p><p className="break-all text-sm font-semibold text-slate-500">{product.id}</p></div><div className="flex flex-wrap gap-2"><a href={`/admin/products/${product.id}`} className="rounded-xl border-2 border-slate-900 bg-white px-3 py-2 font-black shadow-brutal-sm">Edit</a><button onClick={() => toggle(product)} className="rounded-xl border-2 border-slate-900 bg-amber-300 px-3 py-2 font-black shadow-brutal-sm">Toggle Publish</button></div></div></div>)}</div></section></main>;
}
