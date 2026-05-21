import { useEffect, useMemo, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { OrdersEmptyState } from '@/components/orders-empty-state';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order } from '@/lib/types';

type Item = { id: string; order_id: string; product_id: string; qty: number; price: number };
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

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
      setStatus('Memuat orders...');
      const res = await fetch('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal memuat orders.');
      setEmail(json.email || '');
      setOrders((json.orders || []) as Order[]);
      setItems((json.items || []) as Item[]);
      setStatus('Orders tersinkron dengan akun.');
    });
  }, []);

  const fulfilled = orders.filter((order) => order.status === 'fulfilled').length;
  const pending = orders.filter((order) => order.status !== 'fulfilled').length;
  const total = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0), [orders]);

  return (
    <DlavieEcosystemPage
      eyebrow="DLAVIE ORDERS"
      title="Riwayat pembelian yang siap download."
      description="Pantau status order, item pembelian, dan akses download produk digital dari satu halaman akun."
      accent="#dfff4f"
      metrics={[
        { label: 'Orders', value: String(orders.length), hint: email || 'Login to sync' },
        { label: 'Fulfilled', value: String(fulfilled), hint: 'Ready to download' },
        { label: 'Pending', value: String(pending), hint: 'Waiting process' },
        { label: 'Total', value: rupiah(total), hint: 'Lifetime value' }
      ]}
      actions={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Wallet', href: '/wallet' },
        { label: 'Download', href: '/download', primary: true }
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Order Account</p>
          <h2 className="mt-4 break-all text-3xl font-black tracking-tight">{email || 'Login required'}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/55">{status}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="/#products" className="rounded-[1.4rem] bg-[#dfff4f] p-5 font-black text-slate-950 transition hover:-translate-y-1">Explore Products</a>
            <a href="/download" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Download Center</a>
            <a href="/wallet" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Wallet</a>
            <a href="/security" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Security</a>
          </div>
        </section>

        <section className="grid gap-4">
          {orders.length ? orders.map((order) => {
            const orderItems = items.filter((item) => item.order_id === order.id);
            return (
              <article key={order.id} className="dlavie-soft-card rounded-[1.7rem] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-xs font-black uppercase tracking-widest text-slate-400">Order ID</p><p className="mt-1 break-all text-lg font-black text-slate-950">{order.id}</p></div>
                  <span className={`rounded-full px-3 py-2 text-xs font-black ${order.status === 'fulfilled' ? 'bg-[#dfff4f] text-slate-950' : 'bg-slate-950 text-white'}`}>{order.status}</span>
                </div>
                <p className="mt-3 font-bold text-slate-500">Total {rupiah(order.total_amount)} · {orderItems.length} item</p>
                <div className="mt-4 grid gap-2">
                  {orderItems.map((item) => <div key={item.id} className="rounded-[1.15rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><p className="break-all text-sm text-slate-950">Product ID: {item.product_id}</p><p className="mt-1 text-sm text-slate-500">Qty {item.qty} · {rupiah(item.price)}</p></div>)}
                </div>
                {order.status === 'fulfilled' && <a className="mt-4 inline-flex rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm" href="/download">Ambil Download</a>}
              </article>
            );
          }) : <OrdersEmptyState />}
        </section>
      </div>
    </DlavieEcosystemPage>
  );
}
