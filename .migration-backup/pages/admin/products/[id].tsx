import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Product } from '@/lib/types';

export default function EditProduct() {
  const router = useRouter();
  const id = String(router.query.id || '');
  const [token, setToken] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState('Loading product...');

  async function load(nextToken = token) {
    if (!id || !nextToken) return;
    const res = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat produk.');
    const found = (json.products || []).find((item: Product) => item.id === id) || null;
    setProduct(found);
    setStatus(found ? '' : 'Produk tidak ditemukan.');
  }

  async function save() {
    if (!product) return;
    setStatus('Saving product...');
    const res = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(product) });
    const json = await res.json();
    setStatus(res.ok ? 'Produk berhasil diperbarui.' : json.error || 'Update gagal.');
    if (res.ok) setProduct(json.product);
  }

  async function removeProduct() {
    if (!product || !window.confirm('Delete produk ini dari catalog?')) return;
    setStatus('Deleting product...');
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Delete gagal.');
    router.push('/admin/products');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (!nextToken) return setStatus('Login sebagai admin dulu.');
    });
  }, []);

  useEffect(() => { if (id && token) load(token); }, [id, token]);

  if (!product) return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-xl rounded-[2.5rem] p-6 md:p-8"><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Edit Product</h1><p className="mt-4 font-semibold text-slate-600">{status}</p><a className="mt-5 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/admin/products">Back to Products</a></section></main>;

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-4xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Edit Product</h1><p className="mt-2 break-all font-semibold text-slate-500">{product.id}</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/admin/products">Products</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href={`/product/${product.slug}`}>Preview</a></div></div><div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="grid gap-3"><input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Nama produk" /><textarea value={product.description || ''} onChange={(e) => setProduct({ ...product, description: e.target.value })} className="min-h-32 w-full rounded-[1.5rem] border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Deskripsi" /><div className="grid gap-3 md:grid-cols-2"><input value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Kategori" /><input value={product.price} onChange={(e) => setProduct({ ...product, price: Number(e.target.value || 0) })} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" type="number" placeholder="Harga" /></div><div className="grid gap-3 md:grid-cols-2"><input value={product.badge || ''} onChange={(e) => setProduct({ ...product, badge: e.target.value })} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Badge" /><input value={product.stock ?? 99} onChange={(e) => setProduct({ ...product, stock: Number(e.target.value || 0) })} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" type="number" placeholder="Stock" /></div><input value={product.image_url || ''} onChange={(e) => setProduct({ ...product, image_url: e.target.value })} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Image URL" /><input value={product.file_path || ''} onChange={(e) => setProduct({ ...product, file_path: e.target.value })} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Supabase Storage file_path" /></section><aside className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Publishing</p><label className="mt-5 flex items-center justify-between rounded-[1.4rem] bg-white/10 p-4 font-black ring-1 ring-white/10"><span>{product.is_published ? 'Published' : 'Draft'}</span><input type="checkbox" checked={product.is_published} onChange={(e) => setProduct({ ...product, is_published: e.target.checked })} /></label><button onClick={save} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950">Save Changes</button><button onClick={removeProduct} className="mt-3 w-full rounded-full bg-red-500/15 px-5 py-4 font-black text-red-100 ring-1 ring-red-300/20">Delete Product</button>{status && <p className="mt-4 rounded-[1.25rem] bg-white/10 p-4 text-sm font-bold text-white/70 ring-1 ring-white/10">{status}</p>}</aside></div></section></main>;
}
