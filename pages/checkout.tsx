import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useCartStore } from '@/stores/cart-store';

export default function Checkout() {
  const { items, clear } = useCartStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState('');
  const [orderId, setOrderId] = useState('');
  const [token, setToken] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'd_balance'>('manual');
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setToken(session?.access_token || '');
      if (session?.user.email) setEmail(session.user.email);
    });
  }, []);

  async function redeem() {
    const res = await fetch('/api/coupons/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Coupon gagal.');
    setDiscount(data.discountAmount || 0);
    setStatus('Coupon aktif. Total final akan divalidasi ulang saat order dibuat.');
  }

  async function submit() {
    setStatus(paymentMethod === 'd_balance' ? 'Membayar dengan D-Balance...' : 'Membuat order...');
    setOrderId('');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch('/api/orders/create', { method: 'POST', headers, body: JSON.stringify({ buyer_email: email, coupon_code: code && discount > 0 ? code : null, payment_method: paymentMethod, items: items.map((item) => ({ product_id: item.id, qty: item.qty })) }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Order gagal dibuat.');
    clear();
    setDiscount(Number(data.discount || 0));
    setOrderId(String(data.orderId || ''));
    const paidText = data.status === 'paid' ? `Paid by D-Balance. +${Number(data.pointsEarned || 0)} D-Points.` : 'Menunggu admin/payment manual.';
    setStatus(`Order berhasil. Total final Rp ${Number(data.total || 0).toLocaleString('id-ID')}. ${paidText}`);
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] p-6 md:p-8"><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE CHECKOUT</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Secure Checkout</h1><div className="mt-6 grid gap-3 rounded-[2rem] bg-white/60 p-4 ring-1 ring-black/5"><div className="flex items-center justify-between gap-4"><p className="font-semibold text-slate-500">Subtotal</p><p className="font-black">Rp {subtotal.toLocaleString('id-ID')}</p></div><div className="flex items-center justify-between gap-4"><p className="font-semibold text-slate-500">Diskon</p><p className="font-black text-[#2467c9]">Rp {discount.toLocaleString('id-ID')}</p></div><div className="flex items-center justify-between gap-4 border-t border-black/5 pt-3"><p className="text-lg font-black">Total</p><p className="text-2xl font-black">Rp {total.toLocaleString('id-ID')}</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2"><button onClick={() => setPaymentMethod('manual')} className={`rounded-[1.5rem] p-4 text-left font-black ring-1 ring-black/5 transition ${paymentMethod === 'manual' ? 'bg-slate-950 text-white' : 'bg-white/80 text-slate-950'}`}>Manual / Admin<span className="mt-1 block text-xs font-bold opacity-60">Order pending, admin fulfill.</span></button><button onClick={() => setPaymentMethod('d_balance')} className={`rounded-[1.5rem] p-4 text-left font-black ring-1 ring-black/5 transition ${paymentMethod === 'd_balance' ? 'bg-[#dfff4f] text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.18)]' : 'bg-white/80 text-slate-950'}`}>D-Balance<span className="mt-1 block text-xs font-bold opacity-60">Instant paid jika saldo cukup.</span></button></div><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-5 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email pembeli" type="email" /><div className="mt-3 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Coupon" /><button onClick={redeem} disabled={!items.length || !code} className="rounded-full bg-white/80 px-5 py-3 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">Redeem</button></div><button onClick={submit} disabled={!items.length || !email} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">{paymentMethod === 'd_balance' ? 'Pay with D-Balance' : 'Buat Order'}</button>{status && <p className="mt-4 font-semibold text-slate-700">{status}</p>}{paymentMethod === 'd_balance' && !token && <p className="mt-3 rounded-[1.5rem] bg-amber-50 p-4 font-bold text-amber-700 ring-1 ring-amber-900/10">Login diperlukan untuk memakai D-Balance.</p>}{orderId && <div className="mt-5 rounded-[2rem] bg-emerald-50/90 p-5 shadow-sm ring-1 ring-emerald-900/10"><p className="break-all font-black">Order ID: {orderId}</p><p className="mt-2 font-semibold text-slate-600">Jika paid by D-Balance, status order langsung paid dan tercatat di wallet ledger.</p><div className="mt-4 flex flex-wrap gap-2"><a className="rounded-full bg-white px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/orders">Lihat Orders</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm" href="/wallet">Wallet</a><a className="rounded-full bg-slate-950 px-4 py-3 font-black text-white shadow-sm" href="/download">Download</a></div></div>}</section></main>;
}
