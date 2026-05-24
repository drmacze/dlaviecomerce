import { useEffect, useMemo, useState } from 'react';
import { DlavieCompactPage } from '@/components/dlavie-compact-page';
import { OrdersEmptyState } from '@/components/orders-empty-state';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order } from '@/lib/types';

type Item = { id: string; order_id: string; product_id: string; qty: number; price: number };
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function statusClass(status: string) {
  if (status === 'fulfilled') return 'bg-[#dfff4f] text-slate-950';
  if (status === 'paid') return 'bg-[#45d5ff] text-slate-950';
  if (status === 'pending') return 'bg-yellow-200 text-slate-950';
  if (status === 'cancelled') return 'bg-red-100 text-red-700';
  return 'bg-slate-950 text-white';
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
    });
  }, []);

  const fulfilled = orders.filter((order) => order.status === 'fulfilled').length;
  const pending = orders.filter((order) => order.status !== 'fulfilled').length;
  const total = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0), [orders]);
  const lastOrder = orders[0];

  return (
    <DlavieCompactPage
      eyebrow="DLAVIE ORDERS"
      title="Riwayat transaksi yang gampang dicek."
      description="Order dibuat seperti receipt center: status terlihat cepat, total jelas, dan akses download tidak tenggelam."
      metrics={[
        { label: 'Orders', value: String(orders.length), hint: email || 'Login to sync' },
        { label: 'Fulfilled', value: String(fulfilled), hint: 'Ready' },
        { label: 'Pending', value: String(pending), hint: 'Need process' },
        { label: 'Total', value: rupiah(total), hint: 'Lifetime' }
      ]}
      actions={[
        { label: 'Produk', href: '/products', primary: true },
        { label: 'Downloads', href: '/downloads' },
        { label: 'Wallet', href: '/wallet' }
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[.86fr_1.14fr]">
        <section className="dlavie-mica dlavie-wave-card relative overflow-hidden rounded-[2rem] p-5 md:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#dfff4f]/35 blur-3xl dlavie-float-orb" />
          <div className="pointer-events-none absolute -left-16 bottom-6 h-56 w-56 rounded-full bg-[#45d5ff]/24 blur-3xl" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Receipt Account</p>
            <h2 className="mt-2 break-all text-3xl font-black tracking-tight">{email || 'Belum login'}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{status}</p>

            <div className="mt-5 rounded-[1.45rem] bg-slate-950 p-4 text-white shadow-[0_22px_60px_rgba(15,23,42,.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Last Order</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">{lastOrder ? shortId(lastOrder.id) : 'Belum ada order'}</p>
                  <p className="mt-1 text-xs font-bold text-white/42">{lastOrder ? `${rupiah(lastOrder.total_amount)} · ${lastOrder.status}` : 'Transaksi akan muncul setelah checkout.'}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#dfff4f] text-lg font-black text-slate-950 shadow-[0_0_28px_rgba(223,255,79,.34)]">R</div>
              </div>
              <div className="dlavie-progress-line mt-4 h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-full rounded-full bg-[#dfff4f]" /></div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <a href="/products" className="dlavie-lime-btn rounded-[1.3rem] p-4 text-sm font-black transition hover:-translate-y-1">Cari produk</a>
              <a href="/downloads" className="dlavie-primary-btn rounded-[1.3rem] p-4 text-sm font-black transition hover:-translate-y-1">Downloads</a>
              <a href="/wallet" className="rounded-[1.3rem] bg-white/70 p-4 text-sm font-black ring-1 ring-black/5 backdrop-blur-xl transition hover:-translate-y-1">Wallet</a>
              <a href="/security" className="rounded-[1.3rem] bg-white/70 p-4 text-sm font-black ring-1 ring-black/5 backdrop-blur-xl transition hover:-translate-y-1">Security</a>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {orders.length ? orders.map((order, index) => {
            const orderItems = items.filter((item) => item.order_id === order.id);
            return (
              <article key={order.id} className="dlavie-mica dlavie-lift relative overflow-hidden rounded-[1.85rem] p-4 md:p-5">
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#dfff4f]/24 blur-2xl" />
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Receipt #{String(index + 1).padStart(2, '0')}</p>
                    <h3 className="mt-1 break-all text-xl font-black text-slate-950">{shortId(order.id)}</h3>
                    <p className="mt-1 text-sm font-bold text-slate-500">{rupiah(order.total_amount)} · {orderItems.length} item</p>
                  </div>
                  <span className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-widest ${statusClass(order.status)}`}>{order.status}</span>
                </div>

                <div className="relative mt-4 grid gap-2">
                  {orderItems.length ? orderItems.map((item) => <div key={item.id} className="grid gap-2 rounded-[1.2rem] bg-white/72 p-3 ring-1 ring-black/5 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0"><p className="break-all text-sm font-black text-slate-950">Product {shortId(item.product_id)}</p><p className="mt-1 text-xs font-bold text-slate-500">Qty {item.qty}</p></div>
                    <p className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white">{rupiah(item.price)}</p>
                  </div>) : <div className="rounded-[1.2rem] bg-white/72 p-3 text-sm font-bold text-slate-500 ring-1 ring-black/5">Item detail belum tersedia.</div>}
                </div>

                <div className="relative mt-4 flex flex-wrap gap-2">
                  {order.status === 'fulfilled' && <a className="dlavie-lime-btn rounded-full px-4 py-3 text-sm font-black" href="/downloads">Open Download Library</a>}
                  <a className="rounded-full bg-white/70 px-4 py-3 text-sm font-black text-slate-950 ring-1 ring-black/5 backdrop-blur-xl" href="/orders">Refresh status</a>
                </div>
              </article>
            );
          }) : <div className="dlavie-mica rounded-[2rem] p-4"><OrdersEmptyState /></div>}
        </section>
      </div>
    </DlavieCompactPage>
  );
}
