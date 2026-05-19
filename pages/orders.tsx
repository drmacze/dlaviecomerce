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
    supabase.auth.getUser().then(async ({ data }) => {
      const userEmail = data.user?.email || '';
      if (!userEmail) return;
      setEmail(userEmail);
      setStatus('Memuat orders...');
      const orderResult = await supabase.from('orders').select('*').eq('buyer_email', userEmail).order('created_at', { ascending: false });
      if (orderResult.error) return setStatus(orderResult.error.message);
      const loadedOrders = (orderResult.data || []) as Order[];
      setOrders(loadedOrders);
      const ids = loadedOrders.map((order) => order.id);
      if (ids.length) {
        const itemResult = await supabase.from('order_items').select('*').in('order_id', ids);
        if (!itemResult.error) setItems((itemResult.data || []) as Item[]);
      }
      setStatus('');
    });
  }, []);

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-4xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Riwayat Pembelian</h1><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/download">Download</a></div>{email && <p className="mt-2 font-semibold text-slate-600">{email}</p>}{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{orders.map((order) => <div key={order.id} className="rounded-2xl border-2 border-slate-900 p-4"><p className="break-all font-black">Order ID: {order.id}</p><p className="mt-2 font-semibold text-slate-600">Total Rp {order.total_amount.toLocaleString('id-ID')} · Status {order.status}</p><div className="mt-3 space-y-2">{items.filter((item) => item.order_id === order.id).map((item) => <div key={item.id} className="rounded-xl bg-slate-100 p-3 font-semibold"><p>Product ID: {item.product_id}</p><p>Qty {item.qty} · Rp {item.price.toLocaleString('id-ID')}</p></div>)}</div>{order.status === 'fulfilled' && <a className="mt-4 inline-block rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-2 font-black shadow-brutal-sm" href="/download">Ambil Download</a>}</div>)}{!orders.length && !status && <p className="rounded-2xl border-2 border-dashed border-slate-300 p-6 font-bold text-slate-500">Belum ada order untuk akun ini.</p>}</div></section></main>;
}
