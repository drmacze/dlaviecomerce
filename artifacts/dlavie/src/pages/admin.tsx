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
  const [releaseDate, setReleaseDate] = useState('');
  const [stock, setStock] = useState('99');
  const [badge, setBadge] = useState('DLAVIE');
  const [moodColor, setMoodColor] = useState('#2467c9');
  const [published, setPublished] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || '';
      const admins = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((v: string) => v.trim().toLowerCase());
      setToken(data.session?.access_token || '');
      setAllowed(Boolean(email && admins.includes(email.toLowerCase())));
      setChecking(false);
    });
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus('Saving...');
    const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, description, price: Number(price || 0), category, image_url: imageUrl || null, file_path: filePath || null, release_date: releaseDate || null, stock: Number(stock || 99), badge, mood_color: moodColor, is_published: published }) });
    const data = await res.json();
    setStatus(res.ok ? 'Produk berhasil disimpan.' : data.error || 'Gagal menyimpan produk.');
  }

  if (checking) return <main className="min-h-screen p-6 font-black">Checking admin...</main>;
  if (!allowed) return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-lg rounded-[2.5rem] p-6"><h1 className="text-3xl font-black">Admin Locked</h1><p className="mt-3 font-semibold text-slate-600">Login memakai email owner di NEXT_PUBLIC_ADMIN_EMAILS.</p><a className="mt-5 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/login">Login</a></section></main>;
  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-3xl rounded-[2.5rem] p-6 md:p-8"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Commerce Control Hub</h1><p className="mt-2 font-semibold text-slate-500">Pusat kontrol produk, order, topup, user, referral, dan coupon.</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><a className="rounded-[1.4rem] bg-[#dfff4f] p-5 font-black text-slate-950" href="/admin/products">Products</a><a className="rounded-[1.4rem] bg-slate-950 p-5 font-black text-white" href="/admin/orders">Orders</a><a className="rounded-[1.4rem] bg-white/75 p-5 font-black ring-1 ring-black/5" href="/admin/topups">Topups</a><a className="rounded-[1.4rem] bg-white/75 p-5 font-black ring-1 ring-black/5" href="/admin/users">Users & VIP</a><a className="rounded-[1.4rem] bg-white/75 p-5 font-black ring-1 ring-black/5" href="/admin/referrals">Referrals</a><a className="rounded-[1.4rem] bg-white/75 p-5 font-black ring-1 ring-black/5" href="/admin/coupons">Coupons</a></div><form onSubmit={save} className="mt-8 space-y-4"><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Quick Product Creator</p><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Nama produk" /><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28 w-full rounded-[1.5rem] border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Deskripsi" /><div className="grid gap-3 md:grid-cols-2"><input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Kategori" /><input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Harga" type="number" /></div><div className="grid gap-3 md:grid-cols-2"><input value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" type="date" /><input value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Stock" type="number" /></div><div className="grid gap-3 md:grid-cols-2"><input value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Badge" /><input value={moodColor} onChange={(e) => setMoodColor(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="#2467c9" /></div><input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Image URL" /><input value={filePath} onChange={(e) => setFilePath(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Supabase Storage file_path" /><label className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-3 font-black ring-1 ring-black/5"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Published</label><button className="w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-sm">Simpan Produk</button></form>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
