import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { SecurityTrustPanel } from '@/components/security-trust-panel';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type SecurityUser = { email?: string | null; email_confirmed_at?: string | null; last_sign_in_at?: string | null; created_at?: string | null };
type LoginEvent = { id: string; device: string | null; risk_level: string; ip: string | null; created_at: string };
type TrustedDevice = { id: string; label: string | null; fingerprint: string; user_agent: string | null; created_at: string; last_seen_at: string };
type SecurityData = { user: SecurityUser; events: LoginEvent[]; profile: { last_seen_at?: string | null } | null };

function formatDate(value?: string | null) {
  if (!value) return 'Belum tersedia';
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function deviceLabel() {
  if (typeof navigator === 'undefined') return 'Current browser';
  const ua = navigator.userAgent;
  if (ua.includes('iPhone')) return 'iPhone Browser';
  if (ua.includes('Android')) return 'Android Browser';
  if (ua.includes('Mac')) return 'Mac Browser';
  if (ua.includes('Windows')) return 'Windows Browser';
  return 'Current browser';
}

export default function SecurityPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [data, setData] = useState<SecurityData | null>(null);
  const [trusted, setTrusted] = useState<TrustedDevice[]>([]);
  const [status, setStatus] = useState('Login untuk melihat data keamanan akun.');

  async function loadDevices(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/trusted-devices', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (res.ok) setTrusted(json.devices || []);
  }

  async function load(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/security', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal membaca security.');
    setData(json);
    await loadDevices(nextToken);
    setStatus('Security Center tersinkron dengan Supabase.');
  }

  async function recordDevice() {
    if (!token) return setStatus('Login dulu untuk mencatat device.');
    setStatus('Mencatat device session...');
    const res = await fetch('/api/security', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ device: navigator.userAgent.slice(0, 90) }) });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal mencatat device.');
    setData((prev) => prev ? { ...prev, events: [json.event, ...prev.events] } : prev);
    setStatus('Device session berhasil dicatat.');
  }

  async function trustDevice() {
    if (!token) return setStatus('Login dulu untuk menyimpan trusted device.');
    setStatus('Menyimpan trusted device...');
    const res = await fetch('/api/trusted-devices', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ label: deviceLabel(), fingerprint: navigator.userAgent }) });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal menyimpan trusted device.');
    setTrusted((items) => [json.device, ...items.filter((item) => item.id !== json.device.id)]);
    setStatus('Device ini sekarang masuk daftar trusted devices.');
  }

  async function revokeDevice(id: string) {
    if (!token) return;
    const res = await fetch(`/api/trusted-devices?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return setStatus('Gagal mencabut trusted device.');
    setTrusted((items) => items.filter((item) => item.id !== id));
    setStatus('Trusted device berhasil dicabut.');
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
    });
  }, []);

  const events = data?.events || [];
  const confirmed = Boolean(data?.user?.email_confirmed_at);
  const riskyEvents = events.filter((event) => event.risk_level !== 'low').length;

  return (
    <DlavieEcosystemPage
      eyebrow="ACCOUNT SECURITY CENTER"
      title="Security Center yang lebih pintar dan ringkas."
      description="Pantau email verification, trusted devices, login events, dan risk signal dari Supabase dalam satu panel akun DLAVIE."
      accent="#ff9f43"
      metrics={[
        { label: 'Email', value: data ? confirmed ? 'Verified' : 'Check' : 'Login', hint: data ? 'Supabase Auth status' : 'Required' },
        { label: 'Sessions', value: data ? String(events.length) : '-', hint: 'Recorded login events' },
        { label: 'Trusted', value: data ? String(trusted.length) : '-', hint: 'Saved trusted devices' },
        { label: 'Risk', value: data ? String(riskyEvents) : '-', hint: 'Non-low risk logs' }
      ]}
      actions={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Profile', href: '/profile' },
        { label: 'Login', href: '/login', primary: true }
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <div className="grid gap-5">
          <SecurityTrustPanel confirmed={confirmed} eventCount={events.length} trustedCount={trusted.length} riskyCount={riskyEvents} />
          <section className="dlavie-soft-card rounded-[1.6rem] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Account Data</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><p className="text-xs uppercase tracking-widest text-slate-400">Email</p><p className="mt-1 break-all text-slate-950">{data?.user?.email || 'Login required'}</p></div>
              <div className="rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><p className="text-xs uppercase tracking-widest text-slate-400">Confirmed</p><p className="mt-1 text-slate-950">{data ? confirmed ? formatDate(data.user.email_confirmed_at) : 'Belum dikonfirmasi' : 'Login required'}</p></div>
              <div className="rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><p className="text-xs uppercase tracking-widest text-slate-400">Last Sign In</p><p className="mt-1 text-slate-950">{formatDate(data?.user?.last_sign_in_at)}</p></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button onClick={recordDevice} className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white">Record</button>
              <button onClick={trustDevice} className="rounded-full bg-[#ff9f43] px-4 py-3 text-sm font-black text-slate-950">Trust</button>
              <button onClick={logout} className="rounded-full bg-white/75 px-4 py-3 text-sm font-black text-slate-950 ring-1 ring-black/5">Logout</button>
            </div>
            <p className="mt-4 text-sm font-bold leading-6 text-slate-500">{status}</p>
          </section>
        </div>

        <div className="grid gap-4">
          <section className="dlavie-soft-card rounded-[1.6rem] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Trusted Devices</p>
            <div className="mt-4 space-y-3">
              {trusted.length ? trusted.map((device) => (
                <article key={device.id} className="rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span>{device.label || 'Trusted browser'}</span><button onClick={() => revokeDevice(device.id)} className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">Revoke</button></div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Last seen: {formatDate(device.last_seen_at)}</p>
                </article>
              )) : <p className="rounded-[1.2rem] bg-white/75 p-4 font-bold text-slate-500 ring-1 ring-black/5">Belum ada trusted device. Klik Trust setelah login.</p>}
            </div>
          </section>

          <section className="dlavie-soft-card rounded-[1.6rem] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Login Events</p>
            <div className="mt-4 space-y-3">
              {events.length ? events.slice(0, 6).map((event) => (
                <article key={event.id} className="rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span>{event.device || 'Web session'}</span><span className={event.risk_level === 'low' ? 'text-green-700' : 'text-amber-700'}>{event.risk_level}</span></div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(event.created_at)} · {event.ip || 'IP hidden'}</p>
                </article>
              )) : <p className="rounded-[1.2rem] bg-white/75 p-4 font-bold text-slate-500 ring-1 ring-black/5">Belum ada login event. Klik Record setelah login.</p>}
            </div>
          </section>
        </div>
      </div>
    </DlavieEcosystemPage>
  );
}
