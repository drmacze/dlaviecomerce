import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type PpobOrder = {
  id: string;
  ref_id: string;
  sku_code: string;
  product_name: string;
  customer_no: string;
  selling_price: number;
  status: string;
  provider_status?: string | null;
  provider_message?: string | null;
  serial_number?: string | null;
  created_at: string;
  updated_at: string;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function AdminPpobPage() {
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<PpobOrder[]>([]);
  const [status, setStatus] = useState('Login sebagai admin untuk sinkron PPOB.');
  const [syncing, setSyncing] = useState(false);

  async function load(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/admin/ppob-orders', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat order PPOB.');
    setOrders(json.orders || []);
    setStatus('PPOB admin tersinkron.');
  }

  async function syncProducts() {
    if (!token) return setStatus('Login sebagai admin terlebih dahulu.');
    setSyncing(true);
    setStatus('Sinkronisasi produk Digiflazz...');
    try {
      const res = await fetch('/api/admin/ppob-sync', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setStatus(res.ok ? `Sync selesai: ${json.upserted || 0} produk diperbarui.` : json.error || 'Sync PPOB gagal.');
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
    });
  }, []);

  const pending = orders.filter((order) => order.status === 'pending');
  const success = orders.filter((order) => order.status === 'success');
  const failed = orders.filter((order) => order.status === 'failed');
  const gross = useMemo(() => success.reduce((sum, order) => sum + Number(order.selling_price || 0), 0), [success]);

  return <main className="min-h-screen p-4 md:p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.2rem] p-4 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">PPOB Automation Center</h1><p className="mt-2 text-sm font-semibold text-slate-500">Sinkron produk Digiflazz dan pantau transaksi PPOB otomatis.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 text-sm font-black ring-1 ring-black/5" href="/admin">Products</a><a className="rounded-full bg-white/75 px-4 py-3 text-sm font-black ring-1 ring-black/5" href="/admin/topups">Topups</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 text-sm font-black text-slate-950" href="/ppob">Open PPOB</a></div></div><div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-5"><div className="rounded-[1.35rem] bg-slate-950 p-4 text-white"><p className="text-[10px] font-black uppercase tracking-widest text-white/40">Orders</p><p className="mt-2 text-3xl font-black">{orders.length}</p></div><div className="rounded-[1.35rem] bg-[#dfff4f] p-4 text-slate-950"><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Success</p><p className="mt-2 text-xl font-black">{rupiah(gross)}</p></div><div className="rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending</p><p className="mt-2 text-3xl font-black">{pending.length}</p></div><div className="rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Success</p><p className="mt-2 text-3xl font-black">{success.length}</p></div><div className="rounded-[1.35rem] bg-white/75 p-4 ring-1 ring-black/5"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Failed</p><p className="mt-2 text-3xl font-black">{failed.length}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button disabled={syncing} onClick={syncProducts} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">{syncing ? 'Syncing...' : 'Sync Produk Digiflazz'}</button><button onClick={() => load()} className="rounded-full bg-white/75 px-5 py-3 text-sm font-black text-slate-950 ring-1 ring-black/5">Refresh Orders</button></div>{status && <p className="mt-4 rounded-[1.1rem] bg-white/70 p-3 text-sm font-bold text-slate-600 ring-1 ring-black/5">{status}</p>}<div className="mt-5 grid gap-4">{orders.map((order) => <article key={order.id} className="rounded-[1.55rem] bg-white/80 p-4 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="text-xl font-black">{order.product_name}</p><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${order.status === 'success' ? 'bg-green-100 text-green-700' : order.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span></div><p className="mt-1 break-all text-xs font-bold text-slate-400">{order.ref_id}</p><p className="mt-1 text-xs font-bold text-slate-500">{order.customer_no} · {order.sku_code} · {rupiah(order.selling_price)}</p></div><p className="text-right text-xs font-bold text-slate-400">{new Date(order.created_at).toLocaleString('id-ID')}</p></div>{order.provider_message && <p className="mt-3 rounded-[1rem] bg-slate-100 p-3 text-xs font-bold leading-5 text-slate-500">{order.provider_message}</p>}{order.serial_number && <p className="mt-3 break-all rounded-[1rem] bg-slate-950 p-3 text-xs font-bold leading-5 text-[#dfff4f]">SN: {order.serial_number}</p>}</article>)}{!orders.length && <div className="rounded-[2rem] bg-white/75 p-8 font-bold text-slate-500 ring-1 ring-black/5">Belum ada order PPOB.</div>}</div></section></main>;
}
