import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Order } from '@/lib/types';

export default function AdminOrders() {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');

  async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) setStatus(error.message);
    setOrders((data || []) as Order[]);
  }

  async function mark(id: string, next: Order['status']) {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('orders').update({ status: next }).eq('id', id);
    setStatus(error ? error.message : 'Order diperbarui.');
    await load();
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
      setAllowed(Boolean(data.user?.email && admins.includes(data.user.email.toLowerCase())));
      setChecking(false);
    });
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed]);

  if (checking) return <main className="min-h-screen bg-slate-50 p-6 font-black">Checking admin...</main>;
  if (!allowed) return <main className="min-h-screen bg-slate-50 p-6 font-black">Admin locked.</main>;

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-5xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">Order Admin</h1><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/admin">Produk</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{orders.map((order) => <div key={order.id} className="rounded-2xl border-2 border-slate-900 p-4"><p className="font-black">{order.buyer_email}</p><p className="font-semibold text-slate-600">Rp {order.total_amount.toLocaleString('id-ID')} · {order.status}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => mark(order.id, 'paid')} className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-3 py-2 font-black">Paid</button><button onClick={() => mark(order.id, 'fulfilled')} className="rounded-xl border-2 border-slate-900 bg-amber-300 px-3 py-2 font-black">Fulfilled</button><button onClick={() => mark(order.id, 'cancelled')} className="rounded-xl border-2 border-slate-900 bg-white px-3 py-2 font-black">Cancel</button></div></div>)}{!orders.length && <p className="rounded-2xl border-2 border-dashed border-slate-300 p-6 font-bold text-slate-500">Belum ada order.</p>}</div></section></main>;
}
