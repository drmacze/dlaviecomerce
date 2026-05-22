import { useEffect, useMemo, useState } from 'react';
import { DlavieCompactPage } from '@/components/dlavie-compact-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type PpobProduct = {
  id: string;
  sku_code: string;
  product_name: string;
  category: string;
  brand?: string | null;
  product_type?: string | null;
  description?: string | null;
  selling_price: number;
  stock: number;
  unlimited_stock: boolean;
};

type PpobOrder = {
  id: string;
  ref_id: string;
  product_name: string;
  customer_no: string;
  selling_price: number;
  status: string;
  provider_message?: string | null;
  serial_number?: string | null;
  created_at: string;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function PpobPage() {
  const [token, setToken] = useState('');
  const [products, setProducts] = useState<PpobProduct[]>([]);
  const [orders, setOrders] = useState<PpobOrder[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [customerNo, setCustomerNo] = useState('');
  const [status, setStatus] = useState('Login, pilih produk PPOB, lalu bayar otomatis dengan D-Balance.');
  const [loading, setLoading] = useState(false);

  const selected = useMemo(() => products.find((item) => item.id === selectedId) || null, [products, selectedId]);
  const categories = useMemo(() => Array.from(new Set(products.map((item) => item.category).filter(Boolean))).slice(0, 10), [products]);
  const latestOrders = orders.slice(0, 5);

  async function loadProducts(nextSearch = search, nextCategory = category) {
    const params = new URLSearchParams({ limit: '80' });
    if (nextSearch) params.set('search', nextSearch);
    if (nextCategory) params.set('category', nextCategory);
    const res = await fetch(`/api/ppob/products?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat produk PPOB.');
    setProducts(json.products || []);
    if (!selectedId && json.products?.[0]?.id) setSelectedId(json.products[0].id);
  }

  async function loadOrders(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/ppob/order', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat riwayat PPOB.');
    setOrders(json.orders || []);
  }

  async function buy() {
    if (!token) return setStatus('Login dulu sebelum transaksi PPOB.');
    if (!selected) return setStatus('Pilih produk PPOB terlebih dahulu.');
    if (customerNo.trim().length < 3) return setStatus('Isi nomor HP/User ID/nomor pelanggan dengan benar.');

    setLoading(true);
    setStatus('Memproses transaksi PPOB...');
    try {
      const res = await fetch('/api/ppob/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: selected.id, customer_no: customerNo })
      });
      const json = await res.json();
      if (!res.ok && res.status !== 202) return setStatus(json.error || 'Transaksi PPOB gagal dibuat.');
      await loadOrders(token);
      setStatus(json.warning || `Transaksi ${json.refId || ''} berstatus ${json.status || 'pending'}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts('', '');
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) loadOrders(nextToken);
    });
  }, []);

  return <DlavieCompactPage eyebrow="DLAVIE PPOB" title="Topup game, pulsa, dan data otomatis." description="Produk PPOB tersinkron dari supplier, checkout memakai D-Balance, dan status transaksi diperbarui lewat webhook provider." metrics={[{ label: 'Produk', value: String(products.length), hint: 'Aktif tampil' }, { label: 'Order', value: String(orders.length), hint: 'Riwayat kamu' }, { label: 'Selected', value: selected ? rupiah(selected.selling_price) : '-', hint: selected?.sku_code || 'Pilih produk' }, { label: 'Status', value: token ? 'Online' : 'Login', hint: 'Supabase auth' }]} actions={[{ label: 'Wallet', href: '/wallet' }, { label: 'Orders', href: '/orders' }, { label: 'PPOB', href: '/ppob', primary: true }]}><div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]"><section className="relative overflow-hidden rounded-[1.7rem] bg-slate-950 p-4 text-white shadow-[0_24px_70px_rgba(15,23,42,.22)]"><div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dfff4f]/20 blur-3xl" /><div className="relative"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">PPOB Checkout</p><h2 className="mt-2 text-2xl font-black">Bayar otomatis via D-Balance</h2><div className="mt-4 grid gap-2 md:grid-cols-[1fr_.7fr]"><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') loadProducts(); }} className="rounded-[1rem] border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/35" placeholder="Cari ML, FF, Telkomsel, PLN..." /><button onClick={() => loadProducts()} className="rounded-[1rem] bg-[#dfff4f] px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5">Cari Produk</button></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{categories.map((item) => <button key={item} onClick={() => { setCategory(item); loadProducts(search, item); }} className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${category === item ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white/60 ring-1 ring-white/10'}`}>{item}</button>)}</div><div className="mt-4 max-h-[26rem] space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{products.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-[1.15rem] p-3 text-left transition ${selectedId === item.id ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15'}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{item.product_name}</p><p className="mt-1 text-[11px] font-bold opacity-60">{item.category} · {item.brand || 'Digital'} · {item.sku_code}</p></div><span className="shrink-0 text-sm font-black">{rupiah(item.selling_price)}</span></div></button>))}</div></div></section><section className="grid gap-3"><div className="dlavie-soft-card rounded-[1.45rem] p-4"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Detail Transaksi</p><h3 className="mt-2 text-2xl font-black">{selected?.product_name || 'Pilih produk'}</h3><p className="mt-1 text-sm font-bold text-slate-500">{selected ? `${selected.category} · ${selected.brand || 'Digital'} · ${selected.sku_code}` : 'Produk belum dipilih.'}</p><input value={customerNo} onChange={(event) => setCustomerNo(event.target.value)} className="mt-4 w-full rounded-[1rem] border border-black/10 bg-white px-4 py-3 text-sm font-bold outline-none" placeholder="Nomor HP / User ID / ID Pelanggan" /><button disabled={loading || !selected} onClick={buy} className="mt-3 w-full rounded-[1rem] bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">{loading ? 'Memproses...' : `Bayar ${selected ? rupiah(selected.selling_price) : ''}`}</button><p className="mt-3 rounded-[1rem] bg-slate-100 p-3 text-xs font-bold leading-5 text-slate-500">{status}</p></div><div className="dlavie-soft-card rounded-[1.45rem] p-4"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Riwayat PPOB</p><div className="mt-3 space-y-2">{latestOrders.length ? latestOrders.map((order) => <div key={order.id} className="rounded-[1rem] bg-white p-3 text-sm font-bold shadow-sm ring-1 ring-black/5"><div className="flex items-start justify-between gap-2"><span>{order.product_name}</span><span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] uppercase text-[#dfff4f]">{order.status}</span></div><p className="mt-1 text-xs text-slate-400">{order.customer_no} · {rupiah(order.selling_price)}</p>{order.serial_number && <p className="mt-1 break-all text-xs text-slate-500">SN: {order.serial_number}</p>}</div>) : <p className="rounded-[1rem] bg-white p-4 text-sm font-bold text-slate-400 shadow-sm ring-1 ring-black/5">Belum ada transaksi PPOB.</p>}</div></div></section></div></DlavieCompactPage>;
}
