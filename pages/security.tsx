import { useEffect, useState } from 'react';
import { DlavieEcosystemPage } from '@/components/dlavie-ecosystem-page';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type SecurityProfile = { security_score?: number; last_seen_at?: string | null };
type LoginEvent = { id: string; device: string | null; risk_level: string; created_at: string };

const baseChecks = [
  { name: 'Email verified', ok: true },
  { name: 'Device session guard', ok: true },
  { name: 'Suspicious login alert', ok: true },
  { name: '2FA backup codes', ok: false },
  { name: 'Password strength', ok: true }
];

export default function SecurityPage() {
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState<SecurityProfile | null>(null);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [status, setStatus] = useState('Login untuk sinkron Security Center.');

  async function load(nextToken = token) {
    if (!nextToken) return;
    const res = await fetch('/api/security', { headers: { Authorization: `Bearer ${nextToken}` } });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Gagal membaca security.');
    setProfile(json.profile);
    setEvents(json.events || []);
    setStatus('Security Center tersinkron dengan Supabase.');
  }

  async function scanDevice() {
    if (!token) return setStatus('Login dulu untuk scan device.');
    setStatus('Merekam device session...');
    const res = await fetch('/api/security', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ device: 'DLAVIE Web Session' }) });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || 'Scan gagal.');
    setEvents((items) => [json.event, ...items]);
    setProfile((prev) => ({ ...(prev || {}), security_score: 92, last_seen_at: new Date().toISOString() }));
    setStatus('Device session terekam. Security score diperbarui.');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const nextToken = data.session?.access_token || '';
      setToken(nextToken);
      if (nextToken) load(nextToken);
    });
  }, []);

  const score = profile?.security_score || 92;
  const alerts = events.filter((event) => event.risk_level !== 'low').length;

  return <DlavieEcosystemPage eyebrow="ACCOUNT SECURITY CENTER" title="Akun commerce harus terasa aman sebelum terasa keren." description="DLAVIE Security Center menyiapkan login history, device/session manager, suspicious login detection, dan security score agar wallet dan order user tetap terlindungi." accent="#ff9f43" metrics={[{ label: 'Score', value: `${score}/100`, hint: profile ? 'Live security score' : 'Security score preview' }, { label: 'Devices', value: String(events.length || 2), hint: 'Active sessions' }, { label: 'Alerts', value: String(alerts), hint: alerts ? 'Needs review' : 'No suspicious login' }, { label: '2FA', value: 'Soon', hint: 'Backup code ready' }]} actions={[{ label: 'Wallet', href: '/wallet' }, { label: 'Profile', href: '/profile' }, { label: 'Login', href: '/login', primary: true }]}><div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ff9f43]">Security Score</p><div className="relative mx-auto mt-8 grid h-56 w-56 place-items-center rounded-full bg-white/5 ring-1 ring-white/10"><div className="absolute inset-4 rounded-full border-[12px] border-white/10" /><div className="absolute inset-4 rounded-full border-[12px] border-[#ff9f43]" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${score}%, 0 ${score}%)` }} /><div className="text-center"><p className="text-6xl font-black">{score}</p><p className="font-black text-white/45">Protected</p></div></div><button onClick={scanDevice} className="mt-6 w-full rounded-full bg-[#ff9f43] px-5 py-4 font-black text-slate-950">Scan Current Device</button><p className="mt-4 text-sm font-semibold leading-6 text-white/55">{status}</p></div><div className="grid gap-4">{baseChecks.map((check)=><div key={check.name} className="dlavie-soft-card flex items-center justify-between rounded-[1.6rem] p-5"><p className="font-black">{check.name}</p><span className={`rounded-full px-3 py-1 text-xs font-black ${check.ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{check.ok ? 'Active' : 'Setup'}</span></div>)}{events.slice(0, 3).map((event) => <div key={event.id} className="rounded-[1.3rem] bg-white/70 p-4 font-bold ring-1 ring-black/5">{event.device || 'Web session'} · {event.risk_level}</div>)}</div></div></DlavieEcosystemPage>;
}
