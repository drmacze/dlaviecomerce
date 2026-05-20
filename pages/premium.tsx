import { useEffect, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

const tiers = [
  { name: 'Silver', price: 'Rp 29K', boost: '1.2x', color: '#e5e7eb', perks: ['Starter aura', 'Daily bonus', 'Basic drops'] },
  { name: 'Gold', price: 'Rp 59K', boost: '1.5x', color: '#f6c453', perks: ['Gold aura', 'Cashback+', 'Affiliate boost'] },
  { name: 'Platinum', price: 'Rp 129K', boost: '2x', color: '#75b3e5', perks: ['Secret products', 'Priority AI', 'Mystery vault'] },
  { name: 'Black', price: 'Invite', boost: '3x', color: '#111827', perks: ['Elite lounge', 'Private drops', 'Founder badge'] }
];

export default function PremiumPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setProfile(json.profile);
    });
  }, []);

  return <DlavieEcosystemPage eyebrow="DLAVIE VIP ORBIT" title="VIP bukan badge. VIP adalah mode elite." description="Setiap tier membuka aura, D-Points multiplier, cashback, secret drops, affiliate boost, reward vault, dan pengalaman checkout yang terasa lebih premium." accent="#f6c453" metrics={[{ label: 'Status', value: profile?.is_vip ? 'ACTIVE' : 'FREE', hint: profile ? 'Loaded from profile' : 'Login to sync status' }, { label: 'Boost', value: '3x max', hint: 'D-Points multiplier' }, { label: 'Cashback', value: '10%', hint: 'Black tier potential' }, { label: 'Drops', value: 'Secret', hint: 'VIP-only product drops' }]} actions={[{ label: 'Wallet', href: '/wallet' }, { label: 'Affiliate', href: '/affiliate' }, { label: 'Upgrade', href: '/login', primary: true }]}><div className="grid gap-5 lg:grid-cols-[1fr_.9fr]"><div className="grid gap-4 md:grid-cols-2">{tiers.map((tier, index) => <div key={tier.name} className="dlavie-edge-flow relative overflow-hidden rounded-[2rem] bg-white/82 p-6 shadow-[0_20px_70px_rgba(65,78,74,.14)] ring-1 ring-black/5"><div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl" style={{ background: `${tier.color}88` }} /><div className="relative flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Tier {index + 1}</p><h2 className="mt-2 text-3xl font-black">{tier.name}</h2></div><div className="rounded-full px-4 py-2 text-sm font-black" style={{ background: tier.color, color: tier.name === 'Black' ? '#fff' : '#0f172a' }}>{tier.boost}</div></div><p className="mt-4 text-4xl font-black">{tier.price}</p><div className="mt-5 space-y-2">{tier.perks.map((perk)=><p key={perk} className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-black/5">◇ {perk}</p>)}</div></div>)}</div><div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,.24)]"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#f6c453]">VIP Orbit Card</p><div className="relative mx-auto mt-8 grid h-72 w-72 place-items-center"><div className="dlavie-orbit-core absolute inset-0 rounded-full border border-[#f6c453]/35" /><div className="dlavie-orbit-reverse absolute inset-10 rounded-full border border-[#dfff4f]/30" />{tiers.map((tier, i)=><span key={tier.name} className="absolute grid h-14 w-14 place-items-center rounded-full text-xs font-black shadow-xl" style={{ background: tier.color, color: tier.name === 'Black' ? '#fff' : '#111827', transform: `rotate(${i * 90}deg) translateX(130px) rotate(-${i * 90}deg)` }}>{tier.name[0]}</span>)}<div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center text-slate-950 shadow-[0_0_80px_rgba(246,196,83,.28)]"><div><p className="text-xs font-black uppercase tracking-widest text-slate-400">Current</p><p className="mt-2 text-3xl font-black">{profile?.is_vip ? 'VIP' : 'FREE'}</p></div></div></div><p className="mt-6 text-sm font-semibold leading-7 text-white/55">Next: sambungkan upgrade VIP ke payment/topup balance supaya user bisa membeli membership langsung dari D-Balance.</p></div></div></DlavieEcosystemPage>;
}
