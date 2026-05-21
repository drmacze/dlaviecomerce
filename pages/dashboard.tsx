import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Profile = {
  email?: string | null;
  display_name?: string | null;
  l_points?: number | null;
  is_vip?: boolean | null;
};

type SecurityData = {
  ok: true;
  user: {
    email: string | null;
    emailConfirmed: boolean;
    lastSignInAt: string | null;
  };
  trustedDeviceCount: number;
};

function greeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, securityRes] = await Promise.all([
        fetch('/api/profile', { headers }),
        fetch('/api/security', { headers }),
      ]);

      const profileJson = await profileRes.json();
      const securityJson = await securityRes.json();

      if (profileRes.ok) setProfile(profileJson.profile);
      if (securityRes.ok && securityJson.ok) setSecurity(securityJson);
      if (!profileRes.ok || !securityRes.ok) setStatus('Sebagian data dashboard gagal dimuat.');

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  const name = profile?.display_name || profile?.email?.split('@')[0] || security?.user.email?.split('@')[0] || 'Dlavier';

  return (
    <main className="min-h-screen bg-[#f6f2e9] px-5 py-8 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <nav className="dlavie-glass mb-6 flex flex-wrap items-center gap-3 rounded-[2rem] px-4 py-3">
          <Link href="/" className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-sm font-black text-[#dfff4f]">D</Link>
          <div>
            <p className="font-black tracking-tight">DLAVIE</p>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Link href="/profile" className="rounded-full bg-white/75 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5">Profile</Link>
            <Link href="/orders" className="rounded-full bg-white/75 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5">Orders</Link>
            <Link href="/security" className="rounded-full bg-[#dfff4f] px-4 py-2 text-sm font-black text-slate-950 shadow-sm">Security</Link>
          </div>
        </nav>

        {loading ? (
          <div className="dlavie-glass rounded-[2.5rem] p-8 font-black text-slate-500">Memuat dashboard...</div>
        ) : (
          <div className="grid gap-6">
            {status && <div className="rounded-[2rem] bg-amber-50 p-4 font-bold text-amber-700">{status}</div>}

            <section className="dlavie-glass rounded-[2.5rem] p-6 md:p-8">
              <p className="font-black uppercase tracking-[0.3em] text-slate-400">Member Hub</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">{greeting()}, {name}</h1>
              <p className="mt-3 max-w-2xl font-semibold text-slate-500">Kelola akun, pesanan, reward, dan keamanan Dlavie dari satu tempat.</p>
            </section>

            <section className="grid gap-5 md:grid-cols-3">
              <div className="dlavie-glass rounded-[2rem] p-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">D-Points</p>
                <h2 className="mt-3 text-4xl font-black">{profile?.l_points ?? 0}</h2>
              </div>
              <div className="dlavie-glass rounded-[2rem] p-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Premium</p>
                <h2 className="mt-3 text-4xl font-black">{profile?.is_vip ? 'ON' : 'OFF'}</h2>
              </div>
              <Link href="/security" className="dlavie-glass rounded-[2rem] p-6 transition hover:-translate-y-1">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Security</p>
                <h2 className="mt-3 text-4xl font-black">{security?.trustedDeviceCount ?? 0}</h2>
                <p className="mt-2 font-bold text-slate-500">trusted devices</p>
              </Link>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <div className="dlavie-glass rounded-[2.5rem] p-6 md:p-8">
                <p className="font-black uppercase tracking-[0.25em] text-slate-400">Quick Actions</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link href="/orders" className="rounded-[1.5rem] bg-white/75 p-5 font-black shadow-sm ring-1 ring-black/5">Lihat Orders</Link>
                  <Link href="/checkin" className="rounded-[1.5rem] bg-white/75 p-5 font-black shadow-sm ring-1 ring-black/5">Daily Check-in</Link>
                  <Link href="/gift" className="rounded-[1.5rem] bg-white/75 p-5 font-black shadow-sm ring-1 ring-black/5">Gift Center</Link>
                  <Link href="/premium" className="rounded-[1.5rem] bg-white/75 p-5 font-black shadow-sm ring-1 ring-black/5">Premium</Link>
                </div>
              </div>

              <Link href="/security" className="rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-[0_20px_55px_rgba(15,23,42,.2)] transition hover:-translate-y-1 md:p-8">
                <p className="font-black uppercase tracking-[0.25em] text-white/40">Security Center</p>
                <h2 className="mt-3 text-3xl font-black">Akun {security?.user.emailConfirmed ? 'verified' : 'belum verified'}</h2>
                <p className="mt-3 font-semibold text-white/60">Login terakhir: {formatDate(security?.user.lastSignInAt)}</p>
                <span className="mt-6 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950">Buka Security</span>
              </Link>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
