import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type StoredChatMessage = { role?: string; content?: string };

function normalizeMessage(message: StoredChatMessage): ChatMessage {
  return { role: message.role === 'assistant' ? 'assistant' : 'user', content: String(message.content || '') };
}

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
        const loaded = Array.isArray(json.messages) ? json.messages.map(normalizeMessage) : [];
        setMessages(loaded);
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

  return <main className="min-h-screen p-6"><section className="dlavie-glass mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] p-6 md:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black uppercase tracking-[0.3em] text-slate-400">DLAVIE AI</p><h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">AI Commerce Chat</h1></div><div className="flex items-center gap-3"><a className="rounded-full bg-white/75 px-4 py-2 text-sm font-black shadow-sm ring-1 ring-black/5" href="/ai/history">History</a><span className="rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-white">{sessionId ? `Session ${sessionId.slice(0, 8)}` : 'New Session'}</span></div></div><div className="mt-6 max-h-[440px] space-y-3 overflow-y-auto rounded-[1.7rem] bg-white/55 p-4 shadow-inner ring-1 ring-black/5">{messages.map((m, i) => <div key={i} className={`rounded-[1.4rem] p-4 font-semibold shadow-sm ring-1 ring-black/5 ${m.role === 'user' ? 'bg-[#dfff4f]/80 text-slate-950' : 'bg-white/90 text-slate-700'}`}><p className="text-xs font-black uppercase tracking-widest text-slate-500">{m.role}</p><p className="mt-1 whitespace-pre-wrap leading-7">{m.content}</p></div>)}{!messages.length && <p className="rounded-[1.4rem] bg-white/75 p-5 font-semibold text-slate-500 ring-1 ring-black/5">Tanya apa saja tentang produk digital DLAVIE, checkout, reward, coupon, atau rekomendasi produk.</p>}</div><textarea value={q} onChange={(e) => setQ(e.target.value)} className="mt-5 min-h-28 w-full rounded-[1.7rem] border border-black/5 bg-white/80 p-4 font-semibold outline-none transition focus:ring-4 focus:ring-[#dfff4f]/40" placeholder="Tulis pertanyaan..." /><button onClick={ask} disabled={busy || !q.trim()} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Loading...' : 'Kirim ke AI'}</button></section></main>;
}
