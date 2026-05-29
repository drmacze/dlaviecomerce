import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AccountSystemCard } from '@/components/account-system-card';
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
  if (state === 'ready') return 'bg-white text-slate-950';
  if (state === 'partial') return 'bg-amber-200 text-slate-950';
  if (state === 'loading') return 'bg-white/10 text-white/56 ring-1 ring-white/10';
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
        setStatus('Akun tersinkron. Modul utama siap dipakai.');
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

  const primaryModules = useMemo(() => [
    { label: 'Products', href: '/products', desc: 'Beli pulsa, data, PLN, game, dan voucher', tone: 'bg-white text-slate-950' },
    { label: 'Wallet', href: '/wallet', desc: 'Saldo, topup, dan aktivitas D-Balance', tone: 'bg-[#bcff6a] text-slate-950' },
    { label: 'Orders', href: '/orders', desc: 'Pantau status transaksi dan receipt', tone: 'bg-white text-slate-950' },
    { label: 'Security', href: '/security', desc: 'Event login dan trusted device', tone: 'bg-white text-slate-950' }
  ], []);

  const secondaryModules = useMemo(() => [
    { label: 'Rewards', href: '/rewards', desc: 'D-Points dan benefit' },
    { label: 'Referral', href: '/referral', desc: 'Kode referral dan komisi' },
    { label: 'Premium', href: '/premium', desc: 'Benefit VIP' },
    { label: 'Profile', href: '/profile', desc: 'Data akun' }
  ], []);

  const stats = [
    { label: 'Balance', value: rupiah(profile?.d_balance || 0), hint: 'D-Balance' },
    { label: 'Points', value: String(points), hint: 'Reward' },
    { label: 'VIP', value: profile?.is_vip || profile?.vip_level ? 'ON' : 'OFF', hint: profile?.vip_level || 'Membership' },
    { label: 'Security', value: verified ? 'OK' : 'Check', hint: `${riskEvents} risk` }
  ];

  return (
    <main className="dlavie-system-page min-h-screen px-3 pb-36 pt-4 text-white md:px-6 md:pt-6">
      <div className="dlavie-mesh" />
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="dlv-reveal rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,.34)] backdrop-blur-2xl md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/36">DLAVIE DASHBOARD</p>
              <h1 className="mt-2 text-3xl font-semibold leading-none tracking-[-.06em] md:text-5xl">{greeting()}, {name}</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/48">Pusat kontrol akun: produk, wallet, orders, keamanan, reward, dan profil dibuat mudah ditemukan.</p>
            </div>
            <span className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${stateBadge(state)}`}>{state}</span>
          </div>
        </header>

        <section className="dlv-reveal grid grid-cols-2 gap-2 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/32">{item.label}</p>
              <p className="mt-2 truncate text-xl font-semibold tracking-[-.04em] text-white md:text-2xl">{item.value}</p>
              <p className="mt-1 truncate text-xs font-medium text-white/36">{item.hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="dlv-reveal rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_28px_90px_rgba(0,0,0,.38)] backdrop-blur-2xl md:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">Account Core</p>
            <h2 className="mt-2 break-all text-2xl font-semibold tracking-[-.04em] text-white">{email}</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-white/48">{status}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {primaryModules.map((module) => (
                <a key={module.href} href={module.href} className={`rounded-[1.2rem] p-4 text-sm font-semibold transition hover:-translate-y-1 ${module.tone}`}>
                  {module.label}
                  <span className="mt-1 block text-[11px] font-medium opacity-60">{module.desc}</span>
                </a>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={logout} className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white/76 transition hover:bg-white/[0.08]">Logout</button>
              <a href="/profile" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">Edit profile</a>
            </div>
          </aside>

          <section className="dlv-reveal grid gap-3">
            <AccountSystemCard status={status} verified={verified} trustedCount={devices.length} eventCount={events.length} />
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,.3)] backdrop-blur-2xl md:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">More tools</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {secondaryModules.map((module) => (
                  <a key={module.href} href={module.href} className="rounded-[1.15rem] border border-white/10 bg-white/[0.045] p-4 text-sm font-semibold text-white/78 transition hover:-translate-y-1 hover:bg-white/[0.08]">
                    {module.label}
                    <span className="mt-1 block text-[11px] font-medium text-white/36">{module.desc}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,.3)] backdrop-blur-2xl md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/34">Security Snapshot</p>
                <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-950">{verified ? 'Verified' : 'Check email'}</span>
              </div>
              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-black/20 p-3 text-sm font-medium text-white/70"><span>Risk events</span><span>{riskEvents}</span></div>
                <div className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-black/20 p-3 text-sm font-medium text-white/70"><span>Trusted devices</span><span>{devices.length}</span></div>
                <div className="rounded-[1rem] border border-white/10 bg-black/20 p-3 text-sm font-medium text-white/70"><span className="block text-white/38">Last sign in</span><span className="mt-1 block text-xs">{formatDate(security?.user?.last_sign_in_at)}</span></div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
