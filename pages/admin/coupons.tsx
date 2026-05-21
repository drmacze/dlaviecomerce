import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Coupon } from '@/lib/types';

export default function AdminCoupons() {
  const [token, setToken] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('10');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [minAmount, setMinAmount] = useState('0');
  const [limit, setLimit] = useState('');
  const [status, setStatus] = useState('Login sebagai admin dulu.');

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/coupons', { headers: { Authorization: `Bearer ${nextToken}` } });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Gagal memuat coupon.');
    setCoupons(data.coupons || []);
    setStatus('');
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

  async function save() {
    setStatus('Saving coupon...');
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code, discount_type: type, amount: Number(amount), min_amount: Number(minAmount || 0), usage_limit: limit ? Number(limit) : null })
    });
    const data = await res.json();
    setStatus(res.ok ? 'Coupon berhasil dibuat.' : data.error || 'Gagal membuat coupon.');
    if (res.ok) {
      setCode('');
      await load();
    }
  }

  async function toggle(coupon: Coupon) {
    setStatus('Updating coupon...');
    const res = await fetch('/api/admin/coupon-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active })
    });
    const data = await res.json();
    setStatus(res.ok ? 'Coupon status updated.' : data.error || 'Gagal update coupon.');
    await load();
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Coupons</h1><p className="mt-2 font-semibold text-slate-500">Buat, monitor, dan aktif/nonaktifkan coupon checkout.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/admin">Hub</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/checkout">Checkout</a></div></div><div className="mt-6 grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><section className="rounded-[2rem] bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Create Coupon</p><input value={code} onChange={(e) => setCode(e.target.value)} className="mt-5 w-full rounded-full border border-white/10 bg-white/10 p-4 font-semibold outline-none placeholder:text-white/35" placeholder="Kode: DLAVIE10" /><select value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')} className="mt-3 w-full rounded-full border border-white/10 bg-white/10 p-4 font-semibold outline-none"><option value="percent">Percent</option><option value="fixed">Fixed</option></select><input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 w-full rounded-full border border-white/10 bg-white/10 p-4 font-semibold outline-none placeholder:text-white/35" placeholder="Amount" type="number" /><input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="mt-3 w-full rounded-full border border-white/10 bg-white/10 p-4 font-semibold outline-none placeholder:text-white/35" placeholder="Minimum belanja" type="number" /><input value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-3 w-full rounded-full border border-white/10 bg-white/10 p-4 font-semibold outline-none placeholder:text-white/35" placeholder="Usage limit kosong = unlimited" type="number" /><button onClick={save} disabled={!token || !code} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-sm disabled:opacity-50">Simpan Coupon</button>{status && <p className="mt-4 rounded-[1.25rem] bg-white/10 p-4 text-sm font-bold text-white/70 ring-1 ring-white/10">{status}</p>}</section><section className="grid gap-4"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Coupons</p><p className="mt-2 text-3xl font-black">{coupons.length}</p></div><div className="rounded-[1.5rem] bg-[#dfff4f] p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Active</p><p className="mt-2 text-3xl font-black">{coupons.filter((c) => c.is_active).length}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Used</p><p className="mt-2 text-3xl font-black">{coupons.reduce((s, c) => s + Number(c.redeemed_count || 0), 0)}</p></div></div>{coupons.map((coupon) => <article key={coupon.id} className="rounded-[1.6rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-lg font-black">{coupon.code}</p><p className="mt-1 text-sm font-bold text-slate-500">{coupon.discount_type} · {coupon.amount} · min Rp {Number(coupon.min_amount || 0).toLocaleString('id-ID')}</p><p className="mt-1 text-xs font-bold text-slate-400">Used {coupon.redeemed_count}/{coupon.usage_limit ?? '∞'}</p></div><button onClick={() => toggle(coupon)} className={`rounded-full px-4 py-3 font-black ${coupon.is_active ? 'bg-slate-950 text-white' : 'bg-[#dfff4f] text-slate-950'}`}>{coupon.is_active ? 'Disable' : 'Enable'}</button></div></article>)}{!coupons.length && <div className="rounded-[2rem] bg-white/75 p-8 font-bold text-slate-500 ring-1 ring-black/5">Belum ada coupon.</div>}</section></div></section></main>;
}
