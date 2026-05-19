import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';

export default function Checkout() {
  const { items, clear } = useCartStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState('');
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
    const res = await fetch('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyer_email: email, coupon_code: code && discount > 0 ? code : null, items: items.map((item) => ({ product_id: item.id, qty: item.qty })) }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Order gagal dibuat.');
    clear();
    setDiscount(Number(data.discount || 0));
    setStatus(`Order berhasil. ID: ${data.orderId}. Total final Rp ${Number(data.total || 0).toLocaleString('id-ID')}`);
  }

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Checkout LUMINA</h1><p className="mt-3 font-semibold">Subtotal Rp {subtotal.toLocaleString('id-ID')}</p><p className="font-semibold">Diskon Rp {discount.toLocaleString('id-ID')}</p><p className="text-2xl font-black">Total Rp {total.toLocaleString('id-ID')}</p><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-5 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Email pembeli" type="email" /><div className="mt-3 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Coupon" /><button onClick={redeem} disabled={!items.length || !code} className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm">Redeem</button></div><button onClick={submit} disabled={!items.length || !email} className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Buat Order</button>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
