import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

export default function AdminCoupons() {
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('10');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [minAmount, setMinAmount] = useState('0');
  const [limit, setLimit] = useState('');
  const [status, setStatus] = useState('');

  async function save() {
    setStatus('Saving coupon...');
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('coupons').insert({ code: code.trim().toUpperCase(), discount_type: type, amount: Number(amount), min_amount: Number(minAmount || 0), usage_limit: limit ? Number(limit) : null, redeemed_count: 0, is_active: true });
    setStatus(error ? error.message : 'Coupon berhasil dibuat.');
  }

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><h1 className="text-3xl font-black">Admin Coupons</h1><input value={code} onChange={(e) => setCode(e.target.value)} className="mt-5 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Kode: LUMINA10" /><select value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3"><option value="percent">Percent</option><option value="fixed">Fixed</option></select><input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Amount" type="number" /><input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Minimum belanja" type="number" /><input value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-3 w-full rounded-xl border-2 border-slate-900 p-3" placeholder="Usage limit kosong = unlimited" type="number" /><button onClick={save} className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">Simpan Coupon</button>{status && <p className="mt-4 font-semibold">{status}</p>}</section></main>;
}
