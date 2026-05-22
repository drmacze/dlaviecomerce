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
        setStatus('Dashboard akun tersinkron dengan Supabase.');
      } else if (successCount > 0) {
        setState('partial');
        setStatus('Sebagian data berhasil dimuat. Beberapa modul mungkin perlu refresh.');
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
    { label: 'Wallet', href: '/wallet', desc: 'Topup, D-Balance, activity', primary: true },
    { label: 'Orders', href: '/orders', desc: 'Status pembelian' },
    { label: 'Downloads', href: '/downloads', desc: 'File digital' },
    { label: 'Security', href: '/security', desc: 'Event & device trust', primary: true },
    { label: 'Rewards', href: '/rewards', desc: 'D-Points & vault' },
    { label: 'Referral', href: '/referral', desc: 'Kode dan komisi' },
    { label: 'Premium', href: '/premium', desc: 'VIP tier benefit' },
    { label: 'Profile', href: '/profile', desc: 'Data akun' }
  ], []);

  return (
    <DlavieCompactPage
      eyebrow="DLAVIE DASHBOARD"
      title={`${greeting()}, ${name}`}
      description="Pusat kontrol akun yang hanya menampilkan fitur aktif dan punya tujuan jelas. Modul belum siap tidak ditampilkan sebagai tombol utama."
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
        <section className="relative overflow-hidden rounded-[1.7rem] bg-slate-950 p-4 text-white shadow-[0_24px_70px_rgba(15,23,42,.24)] md:p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#dfff4f]/20 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#dfff4f]">Account Core</p>
              <h2 className="mt-2 break-all text-2xl font-black tracking-tight">{email}</h2>
            </div>
            <span className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest ${state === 'ready' ? 'bg-[#dfff4f] text-slate-950' : state === 'partial' ? 'bg-yellow-300 text-slate-950' : state === 'loading' ? 'bg-white/10 text-white' : 'bg-red-400 text-white'}`}>{state}</span>
          </div>
          <p className="relative mt-3 rounded-[1.2rem] bg-white/10 p-3 text-xs font-bold leading-5 text-white/60 ring-1 ring-white/10">{status}</p>
          <div className="relative mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {modules.slice(0, 4).map((module) => <a key={module.href} href={module.href} className={`rounded-[1.15rem] p-3 text-sm font-black transition hover:-translate-y-1 ${module.primary ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white ring-1 ring-white/10'}`}>{module.label}<span className={`mt-1 block text-[10px] font-bold ${module.primary ? 'text-slate-600' : 'text-white/40'}`}>{module.desc}</span></a>)}
          </div>
          <button onClick={logout} className="relative mt-4 rounded-full bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/10 transition hover:bg-white/15">Logout</button>
        </section>

        <section className="grid gap-3">
          <AccountSystemCard status={status} verified={verified} trustedCount={devices.length} eventCount={events.length} />
          <div className="dlavie-soft-card rounded-[1.45rem] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Active Modules</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {modules.slice(4).map((module) => <a key={module.href} href={module.href} className="rounded-[1.05rem] bg-white p-3 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1">{module.label}<span className="mt-1 block text-[10px] font-bold text-slate-400">{module.desc}</span></a>)}
            </div>
          </div>
          <div className="dlavie-soft-card rounded-[1.45rem] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Security Snapshot</p>
            <div className="mt-3 grid gap-2">
              <div className="flex items-center justify-between rounded-[1rem] bg-white/75 p-3 text-sm font-bold ring-1 ring-black/5"><span>Risk events</span><span>{riskEvents}</span></div>
              <div className="flex items-center justify-between rounded-[1rem] bg-white/75 p-3 text-sm font-bold ring-1 ring-black/5"><span>Last sign in</span><span className="text-right text-[11px]">{formatDate(security?.user?.last_sign_in_at)}</span></div>
            </div>
          </div>
        </section>
      </div>
    </DlavieCompactPage>
  );
}
