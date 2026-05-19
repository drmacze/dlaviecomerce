import { FormEvent, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function Admin() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('digital');
  const [imageUrl, setImageUrl] = useState('');
  const [filePath, setFilePath] = useState('');
  const [published, setPublished] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || '';
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
      setToken(data.session?.access_token || '');
      setAllowed(Boolean(email && admins.includes(email.toLowerCase())));
      setChecking(false);
    });
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus('Saving...');
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, price: Number(price || 0), category, image_url: imageUrl || null, file_path: filePath || null, is_published: published })
    });
    const data = await res.json();
    setStatus(res.ok ? 'Produk berhasil disimpan.' : data.error || 'Gagal menyimpan produk.');
  }

  if (checking) return <main className="min-h-screen bg-slate-50 p-6 font-black">Checking admin...</main>;
  if (!allowed) return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-lg rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Admin Locked</h1><p className="mt-3 font-semibold text-slate-600">Login memakai email owner di NEXT_PUBLIC_ADMIN_EMAILS.</p><a className="mt-5 inline-block rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm" href="/login">Login</a></section></main>;
  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-2xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Admin Produk</h1><div className="flex flex-wrap gap-2"><a className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-2 font-black shadow-brutal-sm" href="/admin/products">Products</a><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/admin/orders">Orders</a><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/admin/users">Users</a><a className="rounded-xl border-2 border-slate-900 bg-amber-300 px-4 py-2 font-black shadow-brutal-sm" href="/admin/coupons">Coupons</a></div></div><form onSubmit={save} className="mt-6 space-y-4"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Nama produk" /><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Deskripsi" /><input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Kategori" /><input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Harga" type="number" /><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Image URL" /><input value={filePath} onChange={(e) => setFilePath(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Supabase Storage file_path" /><label className="flex items-center gap-3 font-black"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label><button className="w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Simpan Produk</button></form>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
