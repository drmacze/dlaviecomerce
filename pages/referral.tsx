import { useEffect, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type ReferralProfile = { referral_code?: string | null; d_points?: number; vip_level?: string | null };
type ReferralRow = { id: string; status: string; reward_points: number; created_at: string };

const milestones = ['Invite 1 buyer', 'Invite 3 buyers', 'Invite 7 buyers', 'Unlock Galaxy Bonus'];

export default function ReferralPage() {
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [status, setStatus] = useState('Login untuk sinkron Referral Galaxy.');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/referral', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal membaca referral.');
      setProfile(json.profile);
      setReferrals(json.referrals || []);
      setStatus('Referral Galaxy tersinkron dengan Supabase.');
    });
  }, []);

  const code = profile?.referral_code || 'DLV-128';
  const totalReward = referrals.reduce((sum, item) => sum + Number(item.reward_points || 0), 0);
  const inviteCount = referrals.length;

  return <DlavieEcosystemPage eyebrow="REFERRAL GALAXY" title="Referral yang terasa seperti progress game." description="Setiap user punya kode referral, progress milestone, reward D-Points, cashback, dan orbit tree agar invite terasa menyenangkan dan viral." accent="#75b3e5" metrics={[{ label: 'Code', value: code, hint: profile ? 'Live referral code' : 'Login to sync' }, { label: 'Invites', value: `${inviteCount}/7`, hint: 'Next galaxy reward' }, { label: 'Reward', value: `+${totalReward || 1500}`, hint: 'D-Points potential' }, { label: 'Boost', value: profile?.vip_level && profile.vip_level !== 'free' ? 'VIP x2' : 'Free x1', hint: 'Multiplier for VIP users' }]} actions={[{ label: 'Wallet', href: '/wallet' }, { label: 'Affiliate', href: '/affiliate' }, { label: 'Invite Now', href: '/login', primary: true }]}><div className="grid gap-5 lg:grid-cols-[1fr_.9fr]"><div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white"><div className="dlavie-orbit-core absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#75b3e5]/30" /><div className="dlavie-orbit-reverse absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dfff4f]/30" /><div className="relative z-10 grid h-full place-items-center"><div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center text-slate-950 shadow-[0_0_80px_rgba(117,179,229,.28)]"><div><p className="text-xs font-black uppercase tracking-widest text-slate-400">Your Code</p><p className="mt-2 text-2xl font-black">{code}</p></div></div></div>{['A','B','C','D','E'].map((n,i)=><div key={n} className="absolute grid h-12 w-12 place-items-center rounded-full bg-white font-black text-slate-950 shadow-xl" style={{left:`${18 + (i*17)%68}%`,top:`${18 + (i*23)%58}%`}}>{n}</div>)}<p className="absolute bottom-5 left-6 right-6 text-center text-sm font-semibold text-white/55">{status}</p></div><div className="grid gap-4">{milestones.map((m,i)=><div key={m} className="dlavie-soft-card rounded-[1.6rem] p-5"><div className="flex items-center justify-between"><p className="font-black">{m}</p><p className="text-sm font-black text-slate-400">{inviteCount >= [1,3,7,10][i] ? 'Done' : 'Locked'}</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#75b3e5]" style={{width:`${Math.min(100, (inviteCount / [1,3,7,10][i]) * 100 || (i+1)*18)}%`}} /></div></div>)}{referrals.slice(0, 3).map((item) => <div key={item.id} className="rounded-[1.3rem] bg-white/70 p-4 font-bold ring-1 ring-black/5">{item.status} · +{item.reward_points} DP</div>)}</div></div></DlavieEcosystemPage>;
}
