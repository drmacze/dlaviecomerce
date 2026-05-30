import { useEffect, useMemo, useState } from 'react';
import { OrdersEmptyState } from '@/components/orders-empty-state';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order } from '@/lib/types';

type Item = { id: string; order_id: string; product_id: string; qty: number; price: number };
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function statusTone(status: string) {
  if (status === 'fulfilled') return 'bg-emerald-300 text-slate-950';
  if (status === 'paid') return 'bg-sky-300 text-slate-950';
  if (status === 'pending') return 'bg-amber-200 text-slate-950';
  if (status === 'cancelled') return 'bg-red-200 text-red-900';
  return 'bg-white text-slate-950';
}

function statusLabel(status: string) {
  if (status === 'fulfilled') return 'Selesai';
  if (status === 'paid') return 'Dibayar';
  if (status === 'pending') return 'Diproses';
  if (status === 'cancelled') return 'Dibatalkan';
  return status || 'Menunggu';
}

function shortId(id: string) {
  return id ? `${id.slice(0, 8)}…${id.slice(-5)}` : 'ORDER';
}

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState('Login dulu untuk melihat riwayat pembelian.');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      setStatus('Memuat riwayat order...');
      const res = await fetch('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal memuat orders.');
      setEmail(json.email || '');
      setOrders((json.orders || []) as Order[]);
      setItems((json.items || []) as Item[]);
      setStatus('Riwayat order sudah tersinkron dengan akun.');
    }).catch(() => setStatus('Gagal membaca sesi login. Coba refresh atau login ulang.'));
  }, []);

  const fulfilled = orders.filter((order) => order.status === 'fulfilled').length;
  const pending = orders.filter((order) => order.status !== 'fulfilled').length;
  const total = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0), [orders]);
  const lastOrder = orders[0];
  const stats = [
    { label: 'Orders', value: String(orders.length), hint: email || 'Belum login' },
    { label: 'Selesai', value: String(fulfilled), hint: 'Fulfilled' },
    { label: 'Diproses', value: String(pending), hint: 'Pending' },
    { label: 'Total', value: rupiah(total), hint: 'Lifetime' }
  ];

  return (
    <main className="dlavie-system-page min-h-screen px-3 pb-36 pt-4 text-white md:px-6 md:pt-6">
      <div className="dlavie-mesh" />
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="dlv-reveal rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,.34)] backdrop-blur-2xl md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/36">DLAVIE ORDERS</p>
              <h1 className="mt-2 text-3xl font-semibold leading-none tracking-[-.06em] md:text-5xl">Receipt center.</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/48">Pantau semua transaksi PPOB dan top up. Status, total, dan detail item dibuat jelas agar mudah dicek.</p>
            </div>
            <div className="flex gap-2">
              <a href="/products" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950">Beli Produk</a>
              <a href="/wallet" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/70">Wallet</a>
            </div>
          </div>
        </header>

        <section className="dlv-reveal grid grid-cols-2 gap-2 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">{item.label}</p>
              <p className="mt-2 truncate text-xl font-semibold tracking-[-.04em] text-white md:text-2xl">{item.value}</p>
              <p className="mt-1 truncate text-xs font-medium text-white/36">{item.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
          <aside className="dlv-reveal rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-2xl md:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">Akun Receipt</p>
            <h2 className="mt-2 break-all text-2xl font-semibold tracking-[-.04em] text-white">{email || 'Belum login'}</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-white/48">{status}</p>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">Order Terakhir</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-.06em] text-white">{lastOrder ? shortId(lastOrder.id) : 'Belum ada'}</p>
              <p className="mt-2 text-sm font-medium text-white/44">{lastOrder ? `${rupiah(lastOrder.total_amount)} · ${statusLabel(lastOrder.status)}` : 'Transaksi akan tampil setelah checkout.'}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href="/products" className="rounded-[1.1rem] bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950">Cari Produk</a>
              <a href="/wallet" className="rounded-[1.1rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-center text-sm font-semibold text-white/72">Isi Wallet</a>
            </div>
          </aside>

          <section className="dlv-reveal space-y-3">
            {orders.length ? orders.map((order, index) => {
              const orderItems = items.filter((item) => item.order_id === order.id);
              return (
                <article key={order.id} className="rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_20px_70px_rgba(0,0,0,.26)] backdrop-blur-2xl md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/32">Receipt #{String(index + 1).padStart(2, '0')}</p>
                      <h3 className="mt-1 break-all text-xl font-semibold tracking-[-.035em] text-white">{shortId(order.id)}</h3>
                      <p className="mt-1 text-sm font-medium text-white/44">{rupiah(order.total_amount)} · {orderItems.length} item</p>
                    </div>
                    <span className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusTone(order.status)}`}>{statusLabel(order.status)}</span>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {orderItems.length ? orderItems.map((item) => (
                      <div key={item.id} className="grid gap-2 rounded-[1.2rem] border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="min-w-0">
                          <p className="break-all text-sm font-semibold text-white">Product {shortId(item.product_id)}</p>
                          <p className="mt-1 text-xs font-medium text-white/40">Qty {item.qty}</p>
                        </div>
                        <p className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-950">{rupiah(item.price)}</p>
                      </div>
                    )) : <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-3 text-sm font-medium text-white/42">Item detail belum tersedia.</div>}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-white/72" href="/orders">Refresh status</a>
                    <a className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950" href="/products">Beli lagi</a>
                  </div>
                </article>
              );
            }) : <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-2xl"><OrdersEmptyState /></div>}
          </section>
        </section>
      </div>
    </main>
  );
}
