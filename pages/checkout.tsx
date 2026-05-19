import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useCartStore } from '@/stores/cart-store';

export default function Checkout() {
  const { items, clear } = useCartStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  async function submit() {
    setStatus('Membuat order...');
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.from('orders').insert({ buyer_email: email, total_amount: total, status: 'pending' }).select('id').single();
    if (error) return setStatus(error.message);
    await supabase.from('order_items').insert(items.map((item) => ({ order_id: data.id, product_id: item.id, qty: item.qty, price: item.price })));
    clear();
    setStatus('Order berhasil dibuat. Admin akan memproses akses produk digital.');
  }

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Checkout LUMINA</h1><p className="mt-3 font-semibold text-slate-600">Total Rp {total.toLocaleString('id-ID')}</p><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-5 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Email pembeli" type="email" /><button onClick={submit} disabled={!items.length || !email} className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Buat Order</button>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
