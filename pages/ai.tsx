import { useState } from 'react';

export default function AI() {
  const [q, setQ] = useState('');
  const [a, setA] = useState('');
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true);
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q })
    });
    const data = await res.json();
    setA(data.reply || data.error || 'Tidak ada balasan.');
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-xl rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-brutal">
        <h1 className="text-3xl font-black">LUMINA AI Chat</h1>
        <textarea value={q} onChange={(e) => setQ(e.target.value)} className="mt-5 min-h-32 w-full rounded-2xl border-2 border-slate-900 p-4" />
        <button onClick={ask} disabled={busy} className="mt-4 rounded-xl border-2 border-slate-900 bg-emerald-400 px-5 py-3 font-black shadow-brutal-sm">{busy ? 'Loading...' : 'Tanya AI'}</button>
        {a && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 font-semibold">{a}</p>}
      </section>
    </main>
  );
}
