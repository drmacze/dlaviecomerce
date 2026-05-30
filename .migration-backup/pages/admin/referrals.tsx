import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile, ReferralRow } from '@/lib/types';

export default function AdminReferrals() {
  const [token, setToken] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [status, setStatus] = useState('Loading referrals...');

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/referrals', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal memuat referral.');
    setProfiles(json.profiles || []);
    setReferrals(json.referrals || []);
    setStatus('');
  }

  async function review(referralId: string, action: 'approve' | 'reject') {
    setStatus(`${action} referral...`);
    const res = await fetch('/api/admin/referrals', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ referralId, action }) });
    const json = await res.json();
    setStatus(res.ok ? `Referral ${action} berhasil.` : json.error || 'Review gagal.');
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

  const enabled = profiles.filter((p) => p.affiliate_enabled).length;
  const vip = profiles.filter((p) => p.is_vip).length;

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-6xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE ADMIN</p><h1 className="mt-2 text-4xl font-black tracking-tight">Referral Control</h1><p className="mt-2 font-semibold text-slate-500">Audit referral code, affiliate rank, VIP boost, dan referral reward.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/admin">Products</a><a className="rounded-full bg-white/75 px-4 py-3 font-black ring-1 ring-black/5" href="/admin/users">Users</a><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950" href="/admin/topups">Topups</a></div></div><div className="mt-6 grid gap-3 md:grid-cols-4"><div className="rounded-[1.5rem] bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase tracking-widest text-white/40">Profiles</p><p className="mt-2 text-3xl font-black">{profiles.length}</p></div><div className="rounded-[1.5rem] bg-[#dfff4f] p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-widest text-slate-500">Affiliate</p><p className="mt-2 text-3xl font-black">{enabled}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">VIP</p><p className="mt-2 text-3xl font-black">{vip}</p></div><div className="rounded-[1.5rem] bg-white/75 p-5 ring-1 ring-black/5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Referrals</p><p className="mt-2 text-3xl font-black">{referrals.length}</p></div></div>{status && <p className="mt-4 font-semibold text-slate-600">{status}</p>}<div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="grid gap-4"><p className="font-black uppercase tracking-[0.2em] text-slate-400">Referral Codes</p>{profiles.map((profile) => <article key={profile.id} className="rounded-[1.6rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><p className="break-all font-black">{profile.email || profile.id}</p><p className="mt-2 font-mono text-sm font-bold text-slate-600">{profile.referral_code || 'NO-CODE'}</p><p className="mt-2 text-sm font-bold text-slate-400">Rank {profile.affiliate_rank || 'starter'} · Tier {profile.vip_level || profile.vip_tier || 'free'} · Earn {profile.referral_earnings || 0}</p></article>)}</section><section className="grid gap-4"><p className="font-black uppercase tracking-[0.2em] text-slate-400">Referral Events</p>{referrals.map((ref) => <article key={ref.id} className="rounded-[1.6rem] bg-white/75 p-5 shadow-sm ring-1 ring-black/5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">{ref.status}</p><p className="mt-1 text-sm font-bold text-slate-500">+{ref.reward_points} D-Points</p></div><div className="flex gap-2"><button onClick={() => review(ref.id, 'approve')} className="rounded-full bg-[#dfff4f] px-4 py-2 text-sm font-black text-slate-950">Approve</button><button onClick={() => review(ref.id, 'reject')} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">Reject</button></div></div></article>)}{!referrals.length && <div className="rounded-[1.6rem] bg-white/75 p-6 font-bold text-slate-500 ring-1 ring-black/5">Belum ada referral event.</div>}</section></div></section></main>;
}
