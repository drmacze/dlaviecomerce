import { useEffect, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Profile = { affiliate_enabled?: boolean; affiliate_rank?: string | null; vip_level?: string | null };
type Commission = { id: string; amount: number; status: string };
type Click = { id: string; converted: boolean };

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function AffiliatePage() {
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [status, setStatus] = useState('Login untuk sinkron Affiliate Engine.');

  async function load(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/affiliate', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal membaca affiliate.');
    setProfile(json.profile);
    setClicks(json.clicks || []);
    setCommissions(json.commissions || []);
    setStatus('Affiliate Engine tersinkron dengan Supabase.');
  }

  async function enableAffiliate() {
    if (!token) return setStatus('Login dulu untuk mengaktifkan affiliate.');
    const res = await fetch('/api/affiliate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal mengaktifkan affiliate.');
    setProfile(json.profile);
    setStatus('Affiliate aktif. Link campaign siap digunakan.');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
    });
  }, []);

  const commission = commissions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const converted = clicks.filter((item) => item.converted).length;
  const conv = clicks.length ? `${Math.round((converted / clicks.length) * 1000) / 10}%` : '8.9%';
  const rank = profile?.affiliate_rank || 'starter';
  const boost = profile?.vip_level && profile.vip_level !== 'free' ? '2x' : '1x';

  return <DlavieEcosystemPage eyebrow="VIP AFFILIATE ENGINE" title="Biarkan user ikut menjual DLAVIE." description="Affiliate dashboard untuk tracking klik, konversi, komisi, payout, dan VIP multiplier. User bukan hanya pembeli, tapi partner pertumbuhan." accent="#35cf72" metrics={[{ label: 'Commission', value: commission ? rupiah(commission) : 'Rp 536K', hint: profile ? 'Live commission' : 'Preview earned revenue' }, { label: 'Clicks', value: String(clicks.length || 1072), hint: 'Tracked affiliate traffic' }, { label: 'Conv.', value: conv, hint: 'Campaign conversion' }, { label: 'VIP Boost', value: boost, hint: 'Gold+ multiplier' }]} actions={[{ label: 'Referral', href: '/referral' }, { label: 'Wallet', href: '/wallet' }, { label: 'Create Link', href: '/login', primary: true }]}><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="dlavie-soft-card rounded-[2rem] p-6"><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Affiliate Status</p><div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-[1.4rem] bg-white p-4 font-black shadow-sm">Rank: {rank}</div><div className="rounded-[1.4rem] bg-white p-4 font-black shadow-sm">Clicks: {clicks.length || 1072}</div><div className="rounded-[1.4rem] bg-white p-4 font-black shadow-sm">Conv: {conv}</div></div><p className="mt-5 font-semibold text-slate-600">{status}</p></div><div className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#35cf72]">Affiliate Link Generator</p><div className="mt-5 rounded-[1.4rem] bg-white/10 p-4 font-mono text-sm ring-1 ring-white/10">dlavie.com/r/DLV-{rank.toUpperCase()}</div><div className="mt-4 grid gap-3"><button onClick={enableAffiliate} className="rounded-full bg-[#35cf72] px-5 py-4 font-black text-slate-950">{profile?.affiliate_enabled ? 'Affiliate Active' : 'Activate Affiliate'}</button><button className="rounded-full bg-white/10 px-5 py-4 font-black ring-1 ring-white/10">Request Payout</button></div></div></div></DlavieEcosystemPage>;
}
