import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Row = {
  order?: { id: string; buyer_email: string; created_at: string } | null;
  product?: { id: string; name: string; slug: string; file_path?: string | null } | null;
  item?: { id: string; product_id: string } | null;
  ready: boolean;
};

export default function DownloadsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('Login untuk melihat download library.');
  const [loadingId, setLoadingId] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/download/my', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal memuat downloads.');
      setRows(json.downloads || []);
      setStatus('Produk fulfilled yang siap diunduh dari library.');
    });
  }, []);

  async function claim(row: Row) {
    if (!row.order || !row.product) return;
    setLoadingId(row.item?.id || row.product.id);
    setStatus('Membuat secure download link...');
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: row.order.id, productId: row.product.id, buyerEmail: row.order.buyer_email })
    });
    const json = await res.json();
    setLoadingId('');
    if (!res.ok) return setStatus(json.error || 'Gagal membuat link download.');
    window.location.href = json.url;
  }

  const readyCount = rows.filter((row) => row.ready).length;

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-5xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE DOWNLOADS</p><h1 className="mt-2 text-4xl font-black tracking-tight">Download Library</h1><p className="mt-2 font-semibold text-slate-500">{status}</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/orders">Orders</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/download">Vault</a></div></div><div className="mt-6 grid gap-3 md:grid-cols-3"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase tracking-widest text-white/40">Items</p><p className="mt-2 text-3xl font-black">{rows.length}</p></div><div className="rounded-[1.5rem] bg-[#dfff4f] p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Ready</p><p className="mt-2 text-3xl font-black">{readyCount}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Expiry</p><p className="mt-2 text-3xl font-black">10m</p></div></div><div className="mt-6 grid gap-4">{rows.map((row) => <article key={`${row.order?.id}-${row.product?.id}`} className="rounded-[1.7rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-widest text-slate-400">{row.ready ? 'Ready Download' : 'File Missing'}</p><h2 className="mt-2 text-2xl font-black text-slate-950">{row.product?.name || 'Produk digital'}</h2><p className="mt-1 break-all text-sm font-bold text-slate-500">Order: {row.order?.id}</p></div><button disabled={!row.ready || loadingId === row.item?.id} onClick={() => claim(row)} className="rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950 shadow-sm transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">{loadingId === row.item?.id ? 'Preparing...' : 'Download'}</button></div></article>)}{!rows.length && <div className="rounded-[2rem] bg-white/75 p-8 font-bold text-slate-500 ring-1 ring-black/5">Belum ada produk fulfilled untuk download.</div>}</div></section></main>;
}
