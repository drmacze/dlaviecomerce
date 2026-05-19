import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function AI() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [q, setQ] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const targetSession = String(router.query.session || '');
    if (!targetSession) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      setBusy(true);
      const res = await fetch(`/api/ai/session?sessionId=${targetSession}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) {
        setSessionId(targetSession);
        setMessages((json.messages || []).map((m: ChatMessage) => ({ role: m.role, content: m.content })));
      }
      setBusy(false);
    });
  }, [router.query.session]);

  async function ask() {
    const message = q.trim();
    if (!message) return;
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setQ('');
    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const res = await fetch('/api/ai/persistent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ message, sessionId })
    });
    const data = await res.json();
    if (data.sessionId) setSessionId(data.sessionId);
    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || data.error || 'Tidak ada balasan.' }]);
    setBusy(false);
  }

  return <main className="min-h-screen bg-slate-50 p-6"><section className="mx-auto max-w-2xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-black">LUMINA AI Chat</h1><div className="flex items-center gap-3"><a className="text-sm font-black text-emerald-700" href="/ai/history">History</a><span className="text-xs font-bold text-slate-500">{sessionId ? `Session ${sessionId.slice(0, 8)}` : 'New Session'}</span></div></div><div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border-2 border-slate-900 bg-slate-50 p-4">{messages.map((m, i) => <div key={i} className={`rounded-2xl border-2 border-slate-900 p-3 font-semibold ${m.role === 'user' ? 'bg-emerald-100' : 'bg-white'}`}><p className="text-xs font-black uppercase tracking-widest text-slate-500">{m.role}</p><p className="mt-1 whitespace-pre-wrap">{m.content}</p></div>)}{!messages.length && <p className="font-semibold text-slate-500">Tanya apa saja tentang produk digital LUMINA.</p>}</div><textarea value={q} onChange={(e) => setQ(e.target.value)} className="mt-5 min-h-28 w-full rounded-2xl border-2 border-slate-900 p-4" placeholder="Tulis pertanyaan..." /><button onClick={ask} disabled={busy || !q.trim()} className="mt-4 w-full rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">{busy ? 'Loading...' : 'Kirim ke AI'}</button></section></main>;
}
