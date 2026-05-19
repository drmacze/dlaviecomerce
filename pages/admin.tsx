import { FormEvent, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function Admin() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
      setAllowed(Boolean(data.user?.email && admins.includes(data.user.email.toLowerCase())));
      setChecking(false);
    });
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus('Saving...');
    const supabase = createSupabaseBrowserClient();
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await supabase.from('products').insert({ name, slug, price: Number(price || 0), category: 'digital', is_published: true });
    setStatus(error ? error.message : 'Produk berhasil disimpan.');
  }

  if (checking) return <main className="min-h-screen bg-slate-50 p-6 font-black">Checking admin...</main>;
  if (!allowed) return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-lg rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Admin Locked</h1><p className="mt-3 font-semibold text-slate-600">Login memakai email owner yang terdaftar di NEXT_PUBLIC_ADMIN_EMAILS.</p><a className="mt-5 inline-block rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm" href="/login">Login</a></section></main>;

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-lg rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Admin Produk</h1><form onSubmit={save} className="mt-6 space-y-4"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Nama produk" /><input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Harga" type="number" /><button className="w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Simpan Produk</button></form>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
