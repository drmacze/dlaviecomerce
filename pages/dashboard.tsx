import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AccountSystemCard } from '@/components/account-system-card';
import { DlavieCompactPage } from '@/components/dlavie-compact-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Profile = {
  email?: string | null;
  display_name?: string | null;
  l_points?: number | null;
  d_points?: number | null;
  d_balance?: number | null;
  is_vip?: boolean | null;
  vip_level?: string | null;
};

type SecurityData = {
  user?: { email?: string | null; email_confirmed_at?: string | null; last_sign_in_at?: string | null };
  events?: { id: string; risk_level: string; created_at: string }[];
};

type TrustedDevice = { id: string; label: string | null; last_seen_at: string | null };
type LoadState = 'loading' | 'ready' | 'partial' | 'error';

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

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

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

function stateBadge(state: LoadState) {
  if (state === 'ready') return 'bg-[#dfff4f] text-slate-950';
  if (state === 'partial') return 'bg-yellow-200 text-slate-950';
  if (state === 'loading') return 'bg-white/60 text-slate-600 ring-1 ring-black/5';
  return 'bg-red-400 text-white';
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [status, setStatus] = useState('Memuat dashboard akun...');

  useEffect(() => {
    let alive = true;
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const results = await Promise.allSettled([
        fetch('/api/profile', { headers }),
        fetch('/api/security', { headers }),
        fetch('/api/trusted-devices', { headers })
      ]);
      if (!alive) return;

      let successCount = 0;
      const [profileResult, securityResult, deviceResult] = results;

      if (profileResult.status === 'fulfilled' && profileResult.value.ok) {
        const json = await safeJson(profileResult.value);
        setProfile(json?.profile || null);
        successCount += 1;
      }

      if (securityResult.status === 'fulfilled' && securityResult.value.ok) {
        const json = await safeJson(securityResult.value);
        setSecurity(json || null);
        successCount += 1;
      }

      if (deviceResult.status === 'fulfilled' && deviceResult.value.ok) {
        const json = await safeJson(deviceResult.value);
        setDevices(json?.devices || []);
        successCount += 1;
      }

      if (successCount === 3) {
        setState('ready');
        setStatus('Akun tersinkron. Semua modul utama siap dipakai.');
      } else if (successCount > 0) {
        setState('partial');
        setStatus('Sebagian data berhasil dimuat. Refresh jika ada modul yang belum lengkap.');
      } else {
        setState('error');
        setStatus('Dashboard gagal memuat data. Coba refresh atau login ulang.');
      }
    }

    load().catch(() => {
      if (!alive) return;
      setState('error');
      setStatus('Dashboard gagal memuat data. Coba refresh atau login ulang.');
    });
    return () => { alive = false; };
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
  const points = profile?.d_points ?? profile?.l_points ?? 0;
  const modules = useMemo(() => [
    { label: 'Wallet', href: '/wallet', desc: 'Saldo, topup, aktivitas', primary: true, tone: '#dfff4f' },
    { label: 'Orders', href: '/orders', desc: 'Cek status pembelian', tone: '#75b3e5' },
    { label: 'Downloads', href: '/downloads', desc: 'Akses produk digital', tone: '#c9b6ff' },
    { label: 'Security', href: '/security', desc: 'Event dan device trust', primary: true, tone: '#dfff4f' },
    { label: 'Rewards', href: '/rewards', desc: 'D-Points dan vault', tone: '#f8ffbd' },
    { label: 'Referral', href: '/referral', desc: 'Kode dan komisi', tone: '#ffd6a3' },
    { label: 'Premium', href: '/premium', desc: 'Benefit VIP', tone: '#75b3e5' },
    { label: 'Profile', href: '/profile', desc: 'Data akun', tone: '#ffffff' }
  ], []);

  return (
    <DlavieCompactPage
      eyebrow="DLAVIE DASHBOARD"
      title={`${greeting()}, ${name}`}
      description="Pusat kontrol akun dibuat ringkas: saldo, order, keamanan, reward, dan fitur penting selalu mudah ditemukan."
      metrics={[
        { label: 'Balance', value: rupiah(profile?.d_balance || 0), hint: 'D-Balance' },
        { label: 'Points', value: String(points), hint: 'Reward' },
        { label: 'VIP', value: profile?.is_vip || profile?.vip_level ? 'ON' : 'OFF', hint: profile?.vip_level || 'Membership' },
        { label: 'Security', value: verified ? 'OK' : 'Check', hint: `${riskEvents} risk` }
      ]}
      actions={[
        { label: 'Wallet', href: '/wallet', primary: true },
        { label: 'Orders', href: '/orders' },
        { label: 'Security', href: '/security' }
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_.92fr]">
        <section className="dlavie-mica dlavie-wave-card relative overflow-hidden rounded-[2rem] p-4 md:p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#dfff4f]/35 blur-3xl dlavie-float-orb" />
          <div className="pointer-events-none absolute -left-16 bottom-6 h-56 w-56 rounded-full bg-[#75b3e5]/24 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Account Core</p>
              <h2 className="mt-2 break-all text-2xl font-black tracking-tight md:text-3xl">{email}</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">{status}</p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest ${stateBadge(state)}`}>{state}</span>
          </div>
          <div className="relative mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
            {modules.slice(0, 4).map((module) => <a key={module.href} href={module.href} style={{ '--tone': module.tone } as React.CSSProperties} className={`dlavie-service-glow dlavie-lift rounded-[1.2rem] p-3 text-sm font-black ring-1 ring-black/5 ${module.primary ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/68 text-slate-950 backdrop-blur-xl'}`}>{module.label}<span className="mt-1 block text-[10px] font-bold text-slate-500">{module.desc}</span></a>)}
          </div>
          <div className="relative mt-5 flex flex-wrap items-center gap-2">
            <button onClick={logout} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_18px_48px_rgba(16,19,21,.18)] transition hover:-translate-y-1">Logout</button>
            <a href="/profile" className="rounded-full bg-white/70 px-5 py-3 text-sm font-black text-slate-950 ring-1 ring-black/5 backdrop-blur-xl transition hover:-translate-y-1">Edit profile</a>
          </div>
        </section>

        <section className="grid gap-3">
          <AccountSystemCard status={status} verified={verified} trustedCount={devices.length} eventCount={events.length} />
          <div className="dlavie-mica rounded-[1.65rem] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Active Modules</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {modules.slice(4).map((module) => <a key={module.href} href={module.href} style={{ '--tone': module.tone } as React.CSSProperties} className="dlavie-service-glow dlavie-lift rounded-[1.12rem] bg-white/70 p-3 text-sm font-black shadow-sm ring-1 ring-black/5 backdrop-blur-xl">{module.label}<span className="mt-1 block text-[10px] font-bold text-slate-400">{module.desc}</span></a>)}
            </div>
          </div>
          <div className="dlavie-mica rounded-[1.65rem] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Security Snapshot</p>
              <span className="rounded-full bg-[#dfff4f] px-3 py-1.5 text-[10px] font-black text-slate-950">{verified ? 'Verified' : 'Check email'}</span>
            </div>
            <div className="mt-3 grid gap-2">
              <div className="flex items-center justify-between rounded-[1rem] bg-white/72 p-3 text-sm font-bold ring-1 ring-black/5"><span>Risk events</span><span>{riskEvents}</span></div>
              <div className="flex items-center justify-between rounded-[1rem] bg-white/72 p-3 text-sm font-bold ring-1 ring-black/5"><span>Trusted devices</span><span>{devices.length}</span></div>
              <div className="rounded-[1rem] bg-white/72 p-3 text-sm font-bold ring-1 ring-black/5"><span className="block text-slate-500">Last sign in</span><span className="mt-1 block text-xs">{formatDate(security?.user?.last_sign_in_at)}</span></div>
            </div>
          </div>
        </section>
      </div>
    </DlavieCompactPage>
  );
}