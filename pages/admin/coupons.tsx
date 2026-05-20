import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AdminCoupons() {
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('10');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [minAmount, setMinAmount] = useState('0');
  const [limit, setLimit] = useState('');
  const [status, setStatus] = useState('Login sebagai admin dulu.');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      setStatus(nextToken ? '' : 'Login sebagai admin dulu.');
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
  }

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-xl rounded-[2.5rem] p-6 md:p-8"><div className="flex items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Coupons</h1></div><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/admin">Admin</a></div><input value={code} onChange={(e) => setCode(e.target.value)} className="mt-5 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Kode: DLAVIE10" /><select value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')} className="mt-3 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none"><option value="percent">Percent</option><option value="fixed">Fixed</option></select><input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Amount" type="number" /><input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="mt-3 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Minimum belanja" type="number" /><input value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-3 w-full rounded-full border border-black/5 bg-white/80 p-4 font-semibold outline-none" placeholder="Usage limit kosong = unlimited" type="number" /><button onClick={save} disabled={!token} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-sm disabled:opacity-50">Simpan Coupon</button>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
