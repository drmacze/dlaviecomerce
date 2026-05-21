import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Row = {
  order?: { id: string; created_at: string } | null;
  product?: { id: string; name: string; slug: string; file_path?: string | null } | null;
  ready: boolean;
};

export default function DownloadsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('Login untuk melihat download library.');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/download/my', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal memuat downloads.');
      setRows(json.downloads || []);
      setStatus('Produk fulfilled yang siap masuk download library.');
    });
  }, []);

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-5xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE DOWNLOADS</p><h1 className="mt-2 text-4xl font-black tracking-tight">Download Library</h1><p className="mt-2 font-semibold text-slate-500">{status}</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/orders">Orders</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/download">Vault</a></div></div><div className="mt-6 grid gap-4">{rows.map((row) => <article key={`${row.order?.id}-${row.product?.id}`} className="rounded-[1.7rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">{row.ready ? 'Ready' : 'File Missing'}</p><h2 className="mt-2 text-2xl font-black text-slate-950">{row.product?.name || 'Produk digital'}</h2><p className="mt-1 break-all text-sm font-bold text-slate-500">Order: {row.order?.id}</p><a className="mt-4 inline-flex rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/download">Open Vault</a></article>)}{!rows.length && <div className="rounded-[2rem] bg-white/75 p-8 font-bold text-slate-500 ring-1 ring-black/5">Belum ada produk fulfilled untuk download.</div>}</div></section></main>;
}
