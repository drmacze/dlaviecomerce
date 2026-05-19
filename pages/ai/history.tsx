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

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-3xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">AI Chat History</h1><a className="rounded-xl border-2 border-slate-900 bg-emerald-400 px-4 py-2 font-black shadow-brutal-sm" href="/ai">New Chat</a></div>{status && <p className="mt-4 font-semibold">{status}</p>}<div className="mt-6 space-y-3">{sessions.map((session) => <a key={session.id} href={`/ai?session=${session.id}`} className="block rounded-2xl border-2 border-slate-900 bg-slate-50 p-4 shadow-brutal-sm"><p className="font-black">{session.title}</p><p className="mt-1 text-sm font-semibold text-slate-500">{new Date(session.created_at).toLocaleString('id-ID')} · {session.id}</p></a>)}{!sessions.length && !status && <p className="rounded-2xl border-2 border-dashed border-slate-300 p-6 font-bold text-slate-500">Belum ada riwayat chat.</p>}</div></section></main>;
}
