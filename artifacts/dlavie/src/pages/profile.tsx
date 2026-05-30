import { useEffect, useState } from 'react';
import { useRouter } from '@/lib/router';
import { AccountSystemCard } from '@/components/account-system-card';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/types';

type SecurityData = {
  user?: { email?: string | null; email_confirmed_at?: string | null; last_sign_in_at?: string | null };
  events?: { id: string; risk_level: string; created_at: string }[];
};

type TrustedDevice = { id: string; label: string | null; last_seen_at: string | null };

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function formatDate(value?: string | null) {
  if (!value) return 'Belum tersedia';
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [status, setStatus] = useState('Loading profile...');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return setStatus('Login dulu untuk melihat profil.');
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, securityRes, deviceRes] = await Promise.all([
        fetch('/api/profile', { headers }),
        fetch('/api/security', { headers }),
        fetch('/api/trusted-devices', { headers })
      ]);
      if (profileRes.ok) {
        const json = await profileRes.json();
        setProfile(json.profile);
      }
      if (securityRes.ok) setSecurity(await securityRes.json());
      if (deviceRes.ok) {
        const json = await deviceRes.json();
        setDevices(json.devices || []);
      }
      setStatus('Profile tersinkron dengan data akun.');
    });
  }, []);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const email = profile?.email || security?.user?.email || 'Akun Dlavie';
  const name = profile?.display_name || email.split('@')[0] || 'Dlavier';
  const verified = Boolean(security?.user?.email_confirmed_at);
  const events = security?.events || [];

  return (
    <DlavieEcosystemPage
      eyebrow="DLAVIE PROFILE"
      title={`${profile ? greeting() : 'Akun Saya'}, ${profile ? name : 'Dlavier'}`}
      description="Profil member untuk melihat identitas akun, D-Points, premium status, dan shortcut penting dalam ekosistem DLAVIE."
      accent="#75b3e5"
      metrics={[
        { label: 'D-Points', value: String(profile?.l_points ?? 0), hint: 'Reward balance' },
        { label: 'Premium', value: profile?.is_vip ? 'ON' : 'OFF', hint: 'Membership status' },
        { label: 'Verified', value: verified ? 'YES' : 'CHECK', hint: 'Email status' },
        { label: 'Devices', value: String(devices.length), hint: 'Trusted devices' }
      ]}
      actions={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Security', href: '/security', primary: true },
        { label: 'Orders', href: '/orders' }
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#75b3e5]">Member Identity</p>
          <h2 className="mt-4 break-all text-3xl font-black tracking-tight">{email}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/55">{status}</p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-widest text-white/40">Display Name</p><p className="mt-2 text-xl font-black">{name}</p></div>
            <div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-widest text-white/40">Last Sign In</p><p className="mt-2 text-xl font-black">{formatDate(security?.user?.last_sign_in_at)}</p></div>
          </div>
          <button onClick={logout} className="mt-5 rounded-full bg-white/10 px-5 py-3 text-sm font-black ring-1 ring-white/10 transition hover:bg-white/15">Logout</button>
        </section>

        <section className="grid gap-4">
          <AccountSystemCard status={status} verified={verified} trustedCount={devices.length} eventCount={events.length} />
          <div className="grid gap-4 md:grid-cols-2">
            <a href="/checkin" className="rounded-[1.6rem] bg-[#dfff4f] p-5 font-black text-slate-950 shadow-[0_14px_38px_rgba(120,150,45,.16)] transition hover:-translate-y-1">Daily Check-in</a>
            <a href="/wallet" className="dlavie-soft-card rounded-[1.6rem] p-5 font-black transition hover:-translate-y-1">Wallet</a>
            <a href="/gift" className="dlavie-soft-card rounded-[1.6rem] p-5 font-black transition hover:-translate-y-1">Gift Center</a>
            <a href="/premium" className="dlavie-soft-card rounded-[1.6rem] p-5 font-black transition hover:-translate-y-1">Premium</a>
          </div>
        </section>
      </div>
    </DlavieEcosystemPage>
  );
}
