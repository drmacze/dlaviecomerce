import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

const tiers = ['free', 'silver', 'gold', 'platinum', 'black'];

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [status, setStatus] = useState('Loading users...');
  const [token, setToken] = useState('');
  const [bonus, setBonus] = useState<Record<string, string>>({});

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat users.');
    setUsers(json.users || []);
    setStatus('');
  }

  async function setTier(user: Profile, vipLevel: string) {
    setStatus(`Updating ${user.email || user.id} to ${vipLevel}...`);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: user.id, vipLevel, bonusPoints: Number(bonus[user.id] || 0) })
    });
    const json = await res.json();
    setStatus(res.ok ? 'User premium setting updated.' : json.error || 'Update gagal.');
    setBonus((prev) => ({ ...prev, [user.id]: '' }));
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

  const vipCount = users.filter((user) => user.is_vip).length;

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Users & VIP Tiers</h1><p className="mt-2 font-semibold text-slate-500">Atur user premium sebagai tier, bukan sekadar ON/OFF.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/admin">Products</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/admin/topups">Topups</a><a className="rounded-full bg-white/75 px-4 py-3 font-black shadow-sm ring-1 ring-black/5" href="/admin/referrals">Referrals</a></div></div><div className="mt-6 grid gap-3 md:grid-cols-4"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase tracking-widest text-white/40">Users</p><p className="mt-2 text-3xl font-black">{users.length}</p></div><div className="rounded-[1.5rem] bg-[#dfff4f] p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-widest text-slate-500">VIP</p><p className="mt-2 text-3xl font-black">{vipCount}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Black Tier</p><p className="mt-2 text-3xl font-black">{users.filter((u) => (u.vip_level || u.vip_tier) === 'black').length}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Status</p><p className="mt-2 text-sm font-black">{status || 'Ready'}</p></div></div>{status && <p className="mt-4 font-semibold text-slate-600">{status}</p>}<div className="mt-6 grid gap-4">{users.map((user) => { const level = String(user.vip_level || user.vip_tier || (user.is_vip ? 'silver' : 'free')); return <article key={user.id} className="rounded-[1.8rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="break-all text-lg font-black">{user.email || user.id}</p><p className="mt-1 font-semibold text-slate-600">{user.l_points} points · tier {level} · cashback {user.cashback_rate || 0}%</p><p className="mt-1 text-sm font-bold text-slate-400">Referral: {user.referral_code || '-'} · Rank: {user.affiliate_rank || 'starter'}</p></div><div className="grid min-w-[280px] gap-3"><select value={level} onChange={(e) => setTier(user, e.target.value)} className="rounded-full bg-white px-4 py-3 font-black ring-1 ring-black/5">{tiers.map((tier) => <option key={tier} value={tier}>{tier.toUpperCase()}</option>)}</select><input value={bonus[user.id] || ''} onChange={(e) => setBonus((prev) => ({ ...prev, [user.id]: e.target.value }))} className="rounded-full bg-white px-4 py-3 font-bold ring-1 ring-black/5" placeholder="Bonus points optional" type="number" /><button onClick={() => setTier(user, level)} className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950">Save Tier + Bonus</button></div></div></article>; })}</div></section></main>;
}
