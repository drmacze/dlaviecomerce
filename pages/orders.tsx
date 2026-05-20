import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order } from '@/lib/types';

type Item = { id: string; order_id: string; product_id: string; qty: number; price: number };

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
      setStatus('');
    });
  }, []);

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-4xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ORDERS</p><h1 className="mt-2 text-4xl font-black tracking-tight">Riwayat Pembelian</h1></div><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/download">Download</a></div>{email && <p className="mt-2 font-semibold text-slate-600">{email}</p>}{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{orders.map((order) => <div key={order.id} className="rounded-[1.7rem] bg-white/70 p-4 shadow-sm ring-1 ring-black/5"><p className="break-all font-black">Order ID: {order.id}</p><p className="mt-2 font-semibold text-slate-600">Total Rp {order.total_amount.toLocaleString('id-ID')} · Status {order.status}</p><div className="mt-3 space-y-2">{items.filter((item) => item.order_id === order.id).map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3 font-semibold ring-1 ring-black/5"><p>Product ID: {item.product_id}</p><p>Qty {item.qty} · Rp {item.price.toLocaleString('id-ID')}</p></div>)}</div>{order.status === 'fulfilled' && <a className="mt-4 inline-block rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm" href="/download">Ambil Download</a>}</div>)}{!orders.length && !status && <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/50 p-6 font-bold text-slate-500">Belum ada order untuk akun ini.</p>}</div></section></main>;
}
