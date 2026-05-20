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

  if (checking) return <main className="min-h-screen p-6 font-black">Checking admin...</main>;
  if (!allowed) return <main className="min-h-screen p-6 font-black">Admin locked.</main>;

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-5xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Orders</h1></div><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/admin">Produk</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-4">{orders.map((order) => <div key={order.id} className="rounded-[1.7rem] bg-white/70 p-4 shadow-sm ring-1 ring-black/5"><p className="font-black">{order.buyer_email}</p><p className="font-semibold text-slate-600">Rp {order.total_amount.toLocaleString('id-ID')} · {order.status}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => mark(order.id, 'paid')} className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950">Paid</button><button onClick={() => mark(order.id, 'fulfilled')} className="rounded-full bg-slate-950 px-4 py-3 font-black text-white">Fulfilled</button><button onClick={() => mark(order.id, 'cancelled')} className="rounded-full bg-white px-4 py-3 font-black shadow-sm ring-1 ring-black/5">Cancel</button></div></div>)}{!orders.length && <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/50 p-6 font-bold text-slate-500">Belum ada order.</p>}</div></section></main>;
}
