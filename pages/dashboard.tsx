import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AccountSystemCard } from '@/components/account-system-card';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Profile = {
  email?: string | null;
  display_name?: string | null;
  l_points?: number | null;
  is_vip?: boolean | null;
};

type SecurityData = {
  user?: {
    email?: string | null;
    email_confirmed_at?: string | null;
    last_sign_in_at?: string | null;
  };
  events?: { id: string; risk_level: string; created_at: string }[];
};

type TrustedDevice = { id: string; label: string | null; last_seen_at: string | null };

function formatDate(value?: string | null) {
  if (!value) return 'Belum tersedia';
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [status, setStatus] = useState('Memuat dashboard akun...');

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, securityRes, deviceRes] = await Promise.all([
        fetch('/api/profile', { headers }),
        fetch('/api/security', { headers }),
        fetch('/api/trusted-devices', { headers })
      ]);

      if (profileRes.ok) {
        const profileJson = await profileRes.json();
        setProfile(profileJson.profile || null);
      }

      if (securityRes.ok) setSecurity(await securityRes.json());
      if (deviceRes.ok) {
        const deviceJson = await deviceRes.json();
        setDevices(deviceJson.devices || []);
      }

      setStatus('Dashboard akun tersinkron dengan Supabase.');
    }

    load();
  }, [router]);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const email = profile?.email || security?.user?.email || 'Akun Dlavie';
  const name = profile?.display_name || email.split('@')[0] || 'Dlavier';
  const verified = Boolean(security?.user?.email_confirmed_at);
  const events = security?.events || [];
  const riskEvents = events.filter((event) => event.risk_level !== 'low').length;

  return (
    <DlavieEcosystemPage
      eyebrow="DLAVIE MEMBER DASHBOARD"
      title={`${greeting()}, ${name}`}
      description="Pusat akun untuk wallet, order, reward, premium, AI, dan Security Center dengan visual redesign DLAVIE terbaru."
      accent="#dfff4f"
      metrics={[
        { label: 'D-Points', value: String(profile?.l_points ?? 0), hint: 'Reward balance' },
        { label: 'Premium', value: profile?.is_vip ? 'ON' : 'OFF', hint: 'Membership status' },
        { label: 'Security', value: verified ? 'Verified' : 'Check', hint: 'Email confirmation' },
        { label: 'Trusted', value: String(devices.length), hint: 'Saved devices' }
      ]}
      actions={[
        { label: 'Shop', href: '/' },
        { label: 'Profile', href: '/profile' },
        { label: 'Security', href: '/security', primary: true }
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Account Overview</p>
          <h2 className="mt-4 break-all text-3xl font-black tracking-tight">{email}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/55">{status}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="/security" className="rounded-[1.4rem] bg-[#dfff4f] p-5 font-black text-slate-950 transition hover:-translate-y-1">Open Security Center</a>
            <a href="/orders" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">View Orders</a>
            <a href="/wallet" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">Wallet</a>
            <a href="/ai" className="rounded-[1.4rem] bg-white/10 p-5 font-black text-white ring-1 ring-white/10 transition hover:-translate-y-1">DLAVIE AI</a>
          </div>
          <button onClick={logout} className="mt-4 rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-white/15">Logout</button>
        </section>

        <section className="grid gap-4">
          <AccountSystemCard status={status} verified={verified} trustedCount={devices.length} eventCount={events.length} />
          <div className="dlavie-soft-card rounded-[1.6rem] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Security Snapshot</p>
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><span>Risk events</span><span>{riskEvents}</span></div>
              <div className="flex items-center justify-between rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><span>Last sign in</span><span className="text-right text-xs">{formatDate(security?.user?.last_sign_in_at)}</span></div>
            </div>
          </div>
          <div className="dlavie-soft-card rounded-[1.6rem] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Access</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a className="rounded-full bg-white/75 px-4 py-3 text-sm font-black ring-1 ring-black/5" href="/checkin">Check-in</a>
              <a className="rounded-full bg-white/75 px-4 py-3 text-sm font-black ring-1 ring-black/5" href="/gift">Gift</a>
              <a className="rounded-full bg-white/75 px-4 py-3 text-sm font-black ring-1 ring-black/5" href="/premium">Premium</a>
              <a className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white" href="/security">Security</a>
            </div>
          </div>
        </section>
      </div>
    </DlavieEcosystemPage>
  );
}
