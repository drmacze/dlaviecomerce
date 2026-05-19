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

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex items-center justify-between gap-3"><h1 className="text-3xl font-black">Admin Coupons</h1><a className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm" href="/admin">Admin</a></div><input value={code} onChange={(e) => setCode(e.target.value)} className="mt-5 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Kode: LUMINA10" /><select value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3"><option value="percent">Percent</option><option value="fixed">Fixed</option></select><input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Amount" type="number" /><input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Minimum belanja" type="number" /><input value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Usage limit kosong = unlimited" type="number" /><button onClick={save} disabled={!token} className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Simpan Coupon</button>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
