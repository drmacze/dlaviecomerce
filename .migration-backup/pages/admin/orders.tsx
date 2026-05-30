import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order, OrderItem } from '@/lib/types';

type OrderStatus = Order['status'];
const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function AdminOrders() {
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState('Checking admin...');

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat orders.');
    setOrders(json.orders || []);
    setItems(json.items || []);
    setStatus('');
  }

  async function mark(id: string, next: OrderStatus) {
    setStatus(`Updating order to ${next}...`);
    const res = await fetch('/api/admin/order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId: id, status: next })
    });
    const json = await res.json();
    setStatus(res.ok ? 'Order status updated.' : json.error || 'Update gagal.');
    await load();
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (!nextToken) return setStatus('Login sebagai admin dulu.');
      load(nextToken);
    });
  }, []);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0), [orders]);
  const paid = orders.filter((order) => order.status === 'paid').length;
  const pending = orders.filter((order) => order.status === 'pending').length;
  const fulfilled = orders.filter((order) => order.status === 'fulfilled').length;

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Orders Monitor</h1><p className="mt-2 font-semibold text-slate-500">Kelola paid, fulfilled, dan cancelled order lewat protected admin API.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/admin">Hub</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/admin/topups">Topups</a><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/admin/users">Users</a></div></div><div className="mt-6 grid gap-3 md:grid-cols-5"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase tracking-widest text-white/40">Orders</p><p className="mt-2 text-3xl font-black">{orders.length}</p></div><div className="rounded-[1.5rem] bg-[#dfff4f] p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Revenue</p><p className="mt-2 text-2xl font-black">{rupiah(revenue)}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Pending</p><p className="mt-2 text-3xl font-black">{pending}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Paid</p><p className="mt-2 text-3xl font-black">{paid}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Fulfilled</p><p className="mt-2 text-3xl font-black">{fulfilled}</p></div></div>{status && <p className="mt-4 font-semibold text-slate-600">{status}</p>}<div className="mt-6 grid gap-4">{orders.map((order) => { const orderItems = items.filter((item) => item.order_id === order.id); return <article key={order.id} className="rounded-[1.8rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="break-all text-lg font-black">{order.id}</p><p className="mt-1 font-semibold text-slate-600">{order.buyer_email} · {rupiah(order.total_amount)}</p><p className="mt-1 text-sm font-bold text-slate-400">{new Date(order.created_at).toLocaleString('id-ID')} · {orderItems.length} item</p></div><span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">{order.status}</span></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => mark(order.id, 'paid')} className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950">Paid</button><button onClick={() => mark(order.id, 'fulfilled')} className="rounded-full bg-slate-950 px-4 py-3 font-black text-white">Fulfill</button><button onClick={() => mark(order.id, 'cancelled')} className="rounded-full bg-white px-4 py-3 font-black shadow-sm ring-1 ring-black/5">Cancel</button></div></article>; })}{!orders.length && <div className="rounded-[2rem] bg-white/75 p-8 font-bold text-slate-500 ring-1 ring-black/5">Belum ada order.</div>}</div></section></main>;
}
