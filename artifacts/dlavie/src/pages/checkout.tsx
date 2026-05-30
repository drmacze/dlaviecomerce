import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useCartStore } from '@/stores/cart-store';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function Checkout() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState('Menyiapkan checkout aman...');
  const [token, setToken] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'd_balance'>('manual');
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const qty = items.reduce((s, i) => s + i.qty, 0);
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setToken(session?.access_token || '');
      if (session?.user.email) {
        setEmail(session.user.email);
        setStatus('Checkout tersambung ke akun login.');
      } else {
        setStatus('Login diperlukan sebelum membuat order.');
      }
    }).catch(() => setStatus('Gagal membaca session login. Refresh atau login ulang.'));
  }, []);

  async function redeem() {
    const res = await fetch('/api/coupons/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Coupon gagal.');
    setDiscount(data.discountAmount || 0);
    setStatus('Coupon aktif. Total final akan divalidasi ulang saat order dibuat.');
  }

  async function submit() {
    if (!token) return setStatus('Session belum siap. Login ulang sebelum checkout.');
    setStatus(paymentMethod === 'd_balance' ? 'Membayar dengan D-Balance...' : 'Membuat order...');
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const res = await fetch('/api/orders/create', { method: 'POST', headers, body: JSON.stringify({ coupon_code: code && discount > 0 ? code : null, payment_method: paymentMethod, items: items.map((item) => ({ product_id: item.id, qty: item.qty })) }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Order gagal dibuat.');
    clear();
    router.push(`/order/success?orderId=${encodeURIComponent(String(data.orderId || ''))}&status=${encodeURIComponent(String(data.status || 'pending'))}&total=${encodeURIComponent(String(data.total || 0))}`);
  }

  return (
    <DlavieEcosystemPage
      eyebrow="DLAVIE CHECKOUT"
      title="Secure checkout untuk produk digital."
      description="Validasi akun, coupon, D-Balance, dan order sebelum masuk ke receipt DLAVIE."
      accent="#dfff4f"
      metrics={[
        { label: 'Items', value: String(items.length), hint: `${qty} qty` },
        { label: 'Subtotal', value: rupiah(subtotal), hint: 'Before coupon' },
        { label: 'Discount', value: rupiah(discount), hint: code || 'No coupon' },
        { label: 'Total', value: rupiah(total), hint: paymentMethod }
      ]}
      actions={[
        { label: 'Cart', href: '/cart' },
        { label: 'Orders', href: '/orders' },
        { label: 'Pay Now', href: '#checkout-form', primary: true }
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <aside className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Order Summary</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight">{rupiah(total)}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/55">Manual order akan pending untuk review admin. D-Balance bisa langsung paid jika saldo cukup.</p>
          <div className="mt-6 grid gap-3">
            {items.map((item) => <div key={item.id} className="rounded-[1.25rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="font-black">{item.name}</p><p className="mt-1 text-sm font-semibold text-white/55">Qty {item.qty} · {rupiah(item.price * item.qty)}</p></div>)}
            {!items.length && <p className="rounded-[1.25rem] bg-white/10 p-4 font-bold text-white/45 ring-1 ring-white/10">Cart kosong. Tambahkan produk dulu.</p>}
          </div>
        </aside>

        <section id="checkout-form" className="dlavie-soft-card rounded-[2rem] p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Payment Method</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button onClick={() => setPaymentMethod('manual')} className={`rounded-[1.5rem] p-4 text-left font-black ring-1 ring-black/5 transition ${paymentMethod === 'manual' ? 'bg-slate-950 text-white' : 'bg-white/80 text-slate-950'}`}>Manual / Admin<span className="mt-1 block text-xs font-bold opacity-60">Order pending, admin fulfill.</span></button>
            <button onClick={() => setPaymentMethod('d_balance')} className={`rounded-[1.5rem] p-4 text-left font-black ring-1 ring-black/5 transition ${paymentMethod === 'd_balance' ? 'bg-[#dfff4f] text-slate-950 shadow-sm' : 'bg-white/80 text-slate-950'}`}>D-Balance<span className="mt-1 block text-xs font-bold opacity-60">Instant paid jika saldo cukup.</span></button>
          </div>
          <div className="mt-5 rounded-full border border-black/5 bg-white/80 p-4 font-semibold text-slate-500">{email || 'Membaca akun login...'}</div>
          <div className="mt-3 flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Coupon" /><button onClick={redeem} disabled={!items.length || !code} className="rounded-full bg-white/80 px-5 py-3 font-black shadow-sm ring-1 ring-black/5 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">Redeem</button></div>
          <button onClick={submit} disabled={!items.length || !token} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.18)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">{paymentMethod === 'd_balance' ? 'Pay with D-Balance' : 'Buat Order'}</button>
          {status && <p className="mt-4 rounded-[1.35rem] bg-white/75 p-4 text-sm font-bold leading-6 text-slate-600 ring-1 ring-black/5">{status}</p>}
        </section>
      </div>
    </DlavieEcosystemPage>
  );
}
