import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Row = { id: string; status?: string; action?: string; type?: string };

export default function Sec() {
  const [token, setToken] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [notifications, setNotifications] = useState<Row[]>([]);
  const [audits, setAudits] = useState<Row[]>([]);
  const [status, setStatus] = useState('Loading...');

  async function load(nextToken = token) {
    const res = await fetch('/api/admin/observability', { headers: { Authorization: `Bearer ${nextToken}` } });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'Failed');
    setNotifications(data.notifications || []);
    setAudits(data.audits || []);
    setStatus('Live');
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || '';
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map((v) => v.trim().toLowerCase());
      const ok = Boolean(email && admins.includes(email.toLowerCase()));
      setAllowed(ok);
      setToken(data.session?.access_token || '');
      if (ok && data.session?.access_token) load(data.session.access_token);
      else setStatus('Locked');
    });
  }, []);

  if (!allowed) return <main className="min-h-screen bg-slate-950 p-6 text-white"><h1 className="text-3xl font-black">Security Locked</h1><a className="mt-4 inline-flex rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950" href="/login">Login</a></main>;

  return <main className="min-h-screen bg-[#050811] p-6 text-white"><section className="mx-auto max-w-4xl"><a href="/admin/security" className="font-black text-white/60">← Security Center</a><h1 className="mt-5 text-5xl font-black tracking-tight">Observability Live</h1><p className="mt-3 font-bold text-white/50">Status: {status}</p><button onClick={() => load()} className="mt-5 rounded-full bg-[#dfff4f] px-5 py-3 font-black text-slate-950">Refresh</button><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-white/10 p-6"><p className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Notifications</p><p className="mt-3 text-5xl font-black">{notifications.length}</p></div><div className="rounded-3xl border border-white/10 bg-white/10 p-6"><p className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Audits</p><p className="mt-3 text-5xl font-black">{audits.length}</p></div><div className="rounded-3xl border border-white/10 bg-white/10 p-6"><p className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Failed</p><p className="mt-3 text-5xl font-black">{notifications.filter((n) => n.status === 'failed').length}</p></div></div><div className="mt-8 grid gap-4 md:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-white/10 p-6"><h2 className="text-2xl font-black">Latest notifications</h2>{notifications.slice(0, 5).map((n) => <p key={n.id} className="mt-3 rounded-2xl bg-white/10 p-3 font-bold text-white/60">{n.type} · {n.status}</p>)}</div><div className="rounded-3xl border border-white/10 bg-white/10 p-6"><h2 className="text-2xl font-black">Latest audits</h2>{audits.slice(0, 5).map((a) => <p key={a.id} className="mt-3 rounded-2xl bg-white/10 p-3 font-bold text-white/60">{a.action}</p>)}</div></div></section></main>;
}
