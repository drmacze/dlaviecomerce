import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { WalletTransaction } from '@/lib/types';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function AdminTopups() {
  const [token, setToken] = useState('');
  const [topups, setTopups] = useState<WalletTransaction[]>([]);
  const [status, setStatus] = useState('Loading topups...');

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/topups', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat topup.');
    setTopups(json.topups || []);
    setStatus('');
  }

  async function review(id: string, action: 'approve' | 'reject') {
    setStatus(`${action} topup...`);
    const res = await fetch('/api/admin/topups', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, action }) });
    const json = await res.json();
    setStatus(res.ok ? `Topup ${action} berhasil.` : json.error || 'Review gagal.');
    await load();
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

  const pending = topups.filter((tx) => tx.status === 'pending');
  const approved = topups.filter((tx) => tx.status === 'approved');
  const totalPending = useMemo(() => pending.reduce((sum, tx) => sum + Number(tx.amount || 0), 0), [pending]);

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Pending Topups</h1><p className="mt-2 font-semibold text-slate-500">Approve topup manual untuk menambah D-Balance user.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/admin">Products</a><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/admin/users">Users</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/admin/referrals">Referrals</a></div></div><div className="mt-6 grid gap-3 md:grid-cols-4"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase tracking-widest text-white/40">Pending</p><p className="mt-2 text-3xl font-black">{pending.length}</p></div><div className="rounded-[1.5rem] bg-[#dfff4f] p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Amount</p><p className="mt-2 text-2xl font-black">{rupiah(totalPending)}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Approved</p><p className="mt-2 text-3xl font-black">{approved.length}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Total</p><p className="mt-2 text-3xl font-black">{topups.length}</p></div></div>{status && <p className="mt-4 font-semibold text-slate-600">{status}</p>}<div className="mt-6 grid gap-4">{topups.map((tx) => <article key={tx.id} className="rounded-[1.8rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-lg font-black">{rupiah(tx.amount)}</p><p className="mt-1 break-all text-sm font-bold text-slate-500">User: {tx.user_id}</p><p className="mt-1 text-sm font-bold text-slate-400">{tx.provider || 'manual'} · {new Date(tx.created_at).toLocaleString('id-ID')}</p></div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-4 py-2 text-xs font-black ${tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : tx.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{tx.status}</span>{tx.status === 'pending' && <><button onClick={() => review(tx.id, 'approve')} className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950">Approve</button><button onClick={() => review(tx.id, 'reject')} className="rounded-full bg-slate-950 px-4 py-3 font-black text-white">Reject</button></>}</div></div></article>)}{!topups.length && <div className="rounded-[2rem] bg-white/75 p-8 font-bold text-slate-500 ring-1 ring-black/5">Belum ada topup.</div>}</div></section></main>;
}
