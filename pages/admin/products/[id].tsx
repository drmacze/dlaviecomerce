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
    setStatus('Saving...');
    const res = await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(product) });
    const json = await res.json();
    setStatus(res.ok ? 'Produk berhasil diperbarui.' : json.error || 'Update gagal.');
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

  if (!product) return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Edit Product</h1><p className="mt-4 font-semibold">{status}</p><a className="mt-5 inline-block font-black text-emerald-700" href="/admin/products">Back</a></section></main>;

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-2xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Edit Product</h1><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/admin/products">Products</a></div><div className="mt-6 space-y-4"><input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Nama produk" /><textarea value={product.description || ''} onChange={(e) => setProduct({ ...product, description: e.target.value })} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Deskripsi" /><input value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Kategori" /><input value={product.price} onChange={(e) => setProduct({ ...product, price: Number(e.target.value || 0) })} className="w-full rounded-xl border-2 border-slate-900 p-3" type="number" placeholder="Harga" /><input value={product.image_url || ''} onChange={(e) => setProduct({ ...product, image_url: e.target.value })} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Image URL" /><input value={product.file_path || ''} onChange={(e) => setProduct({ ...product, file_path: e.target.value })} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Supabase Storage file_path" /><label className="flex items-center gap-3 font-black"><input type="checkbox" checked={product.is_published} onChange={(e) => setProduct({ ...product, is_published: e.target.checked })} /> Published</label><button onClick={save} className="w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Simpan Perubahan</button>{status && <p className="font-semibold">{status}</p>}</div></section></main>;
}
