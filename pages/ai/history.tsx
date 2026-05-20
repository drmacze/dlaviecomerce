import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type ChatSession = { id: string; title: string; created_at: string };

export default function AIHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [status, setStatus] = useState('Login dulu untuk melihat riwayat AI.');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      setStatus('Memuat riwayat chat...');
      const res = await fetch('/api/ai/sessions', { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) return setStatus(json.error || 'Gagal memuat riwayat AI.');
      setSessions(json.sessions || []);
      setStatus('');
    });
  }, []);

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-3xl rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE AI</p><h1 className="mt-2 text-4xl font-black tracking-tight">Chat History</h1></div><a className="rounded-full bg-[#dfff4f] px-4 py-3 font-black text-slate-950 shadow-sm" href="/ai">New Chat</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-3">{sessions.map((session) => <a key={session.id} href={`/ai?session=${session.id}`} className="block rounded-[1.5rem] bg-white/70 p-4 shadow-sm ring-1 ring-black/5"><p className="font-black">{session.title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{new Date(session.created_at).toLocaleString('id-ID')} · {session.id}</p></a>)}{!sessions.length && !status && <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/50 p-6 font-bold text-slate-500">Belum ada riwayat chat.</p>}</div></section></main>;
}
