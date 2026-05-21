import { useEffect, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
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
    setStatus('Data keamanan akun tersinkron dari Supabase.');
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

  return <DlavieEcosystemPage eyebrow="ACCOUNT SECURITY CENTER" title="Keamanan akun berbasis data login asli." description="Security Center menampilkan status email, sesi login, trusted device, dan risk indicator yang berasal dari Supabase, bukan angka simulasi." accent="#ff9f43" metrics={[{ label: 'Email', value: data ? confirmed ? 'Verified' : 'Unverified' : 'Login', hint: data ? 'Supabase Auth status' : 'Required' }, { label: 'Sessions', value: data ? String(events.length) : '-', hint: 'Recorded login events' }, { label: 'Trusted', value: data ? String(trusted.length) : '-', hint: 'Saved trusted devices' }, { label: 'Risk Events', value: data ? String(riskyEvents) : '-', hint: 'Non-low risk logs' }]} actions={[{ label: 'Wallet', href: '/wallet' }, { label: 'Profile', href: '/profile' }, { label: 'Login', href: '/login', primary: true }]}><div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]"><div className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff9f43]">Verified Account Data</p><div className="mt-6 grid gap-3"><div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-widest text-white/40">Email</p><p className="mt-2 break-all text-xl font-black">{data?.user?.email || 'Login required'}</p></div><div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-widest text-white/40">Email Confirmation</p><p className="mt-2 text-xl font-black">{data ? confirmed ? formatDate(data.user.email_confirmed_at) : 'Belum dikonfirmasi' : 'Login required'}</p></div><div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/10"><p className="text-xs font-black uppercase tracking-widest text-white/40">Last Sign In</p><p className="mt-2 text-xl font-black">{formatDate(data?.user?.last_sign_in_at)}</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={recordDevice} className="rounded-full bg-[#ff9f43] px-5 py-4 font-black text-slate-950">Record Session</button><button onClick={trustDevice} className="rounded-full bg-white/10 px-5 py-4 font-black text-white ring-1 ring-white/10">Trust Device</button></div><p className="mt-4 text-sm font-semibold leading-6 text-white/55">{status}</p></div><div className="grid gap-4"><div className="dlavie-soft-card rounded-[1.6rem] p-5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Security Requirements</p><div className="mt-4 grid gap-3"><div className="flex items-center justify-between rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><span>Email confirmation</span><span className={confirmed ? 'text-green-700' : 'text-amber-700'}>{data ? confirmed ? 'Verified' : 'Required' : 'Login required'}</span></div><div className="flex items-center justify-between rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><span>Login activity log</span><span>{data ? `${events.length} records` : 'Login required'}</span></div><div className="flex items-center justify-between rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><span>Trusted devices</span><span>{data ? `${trusted.length} saved` : 'Login required'}</span></div></div></div><div className="dlavie-soft-card rounded-[1.6rem] p-5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Trusted Devices</p><div className="mt-4 space-y-3">{trusted.length ? trusted.map((device) => <div key={device.id} className="rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><div className="flex flex-wrap items-center justify-between gap-2"><span>{device.label || 'Trusted browser'}</span><button onClick={() => revokeDevice(device.id)} className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">Revoke</button></div><p className="mt-1 text-xs font-semibold text-slate-500">Last seen: {formatDate(device.last_seen_at)}</p></div>) : <p className="rounded-[1.2rem] bg-white/75 p-4 font-bold text-slate-500 ring-1 ring-black/5">Belum ada trusted device. Klik Trust Device setelah login.</p>}</div></div><div className="dlavie-soft-card rounded-[1.6rem] p-5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Login Events</p><div className="mt-4 space-y-3">{events.length ? events.slice(0, 4).map((event) => <div key={event.id} className="rounded-[1.2rem] bg-white/75 p-4 font-bold ring-1 ring-black/5"><div className="flex flex-wrap items-center justify-between gap-2"><span>{event.device || 'Web session'}</span><span className={event.risk_level === 'low' ? 'text-green-700' : 'text-amber-700'}>{event.risk_level}</span></div><p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(event.created_at)} · {event.ip || 'IP hidden'}</p></div>) : <p className="rounded-[1.2rem] bg-white/75 p-4 font-bold text-slate-500 ring-1 ring-black/5">Belum ada login event. Klik Record Session setelah login.</p>}</div></div></div></div></DlavieEcosystemPage>;
}
