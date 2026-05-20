import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';

export default function Checkout() {
  const { items, clear } = useCartStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState('');
  const [orderId, setOrderId] = useState('');
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - discount);

  async function redeem() {
    const res = await fetch('/api/coupons/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Coupon gagal.');
    setDiscount(data.discountAmount || 0);
    setStatus('Coupon aktif. Total final akan divalidasi ulang saat order dibuat.');
  }

  async function submit() {
    setStatus('Membuat order...');
    setOrderId('');
    const res = await fetch('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyer_email: email, coupon_code: code && discount > 0 ? code : null, items: items.map((item) => ({ product_id: item.id, qty: item.qty })) }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Order gagal dibuat.');
    clear();
    setDiscount(Number(data.discount || 0));
    setOrderId(String(data.orderId || ''));
    setStatus(`Order berhasil. Total final Rp ${Number(data.total || 0).toLocaleString('id-ID')}`);
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] p-6 md:p-8"><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE CHECKOUT</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Secure Checkout</h1><div className="mt-6 grid gap-3 rounded-[2rem] bg-white/60 p-4 ring-1 ring-black/5"><div className="flex items-center justify-between gap-4"><p className="font-semibold text-slate-500">Subtotal</p><p className="font-black">Rp {subtotal.toLocaleString('id-ID')}</p></div><div className="flex items-center justify-between gap-4"><p className="font-semibold text-slate-500">Diskon</p><p className="font-black text-[#2467c9]">Rp {discount.toLocaleString('id-ID')}</p></div><div className="flex items-center justify-between gap-4 border-t border-black/5 pt-3"><p className="text-lg font-black">Total</p><p className="text-2xl font-black">Rp {total.toLocaleString('id-ID')}</p></div></div><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-5 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Email pembeli" type="email" /><div className="mt-3 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Coupon" /><button onClick={redeem} disabled={!items.length || !code} className="rounded-full bg-white/80 px-5 py-3 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">Redeem</button></div><button onClick={submit} disabled={!items.length || !email} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">Buat Order</button>{status && <p className="mt-4 font-semibold text-slate-700">{status}</p>}{orderId && <div className="mt-5 rounded-[2rem] bg-emerald-50/90 p-5 shadow-sm ring-1 ring-emerald-900/10"><p className="break-all font-black">Order ID: {orderId}</p><p className="mt-2 font-semibold text-slate-600">Admin perlu mark fulfilled sebelum download aktif.</p><div className="mt-4 flex flex-wrap gap-2"><a className="rounded-full bg-white px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/orders">Lihat Orders</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm" href="/download">Ke Download</a></div></div>}</section></main>;
}
