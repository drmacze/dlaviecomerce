import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { dlavieAiPlans, type DlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type ChatMessage = { role: 'user' | 'assistant'; content: string; planName?: string };
type StoredChatMessage = { role?: string; content?: string };

type DlavieAiAccess = {
  authenticated: boolean;
  plan: DlavieAiPlan;
  name: string;
  dailyQuota: number;
  dailyUsed: number;
  remaining: number;
};

function normalizeMessage(message: StoredChatMessage): ChatMessage {
  return { role: message.role === 'assistant' ? 'assistant' : 'user', content: String(message.content || '') };
}

function createPlanProgress(access: DlavieAiAccess | null) {
  if (!access?.dailyQuota) return 0;
  return Math.min(100, Math.round((access.dailyUsed / access.dailyQuota) * 100));
}

export default function AI() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [q, setQ] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [access, setAccess] = useState<DlavieAiAccess | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DlavieAiPlan>('basic');
  const [notice, setNotice] = useState('');

  const activePlan = dlavieAiPlans[access?.plan || 'basic'];
  const previewPlan = dlavieAiPlans[selectedPlan];
  const progress = createPlanProgress(access);

  const planCards = useMemo(() => Object.values(dlavieAiPlans), []);

  async function getAccessToken() {
    const supabase = createSupabaseBrowserClient();
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token;
  }

  async function loadAccess() {
    const token = await getAccessToken();
    const res = await fetch('/api/ai/dlavie-subscription', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (res.ok) {
      setAccess(data);
      setSelectedPlan(data.plan || 'basic');
    }
  }

  useEffect(() => {
    loadAccess().catch(() => setNotice('Status Dlavie AI belum bisa dimuat.'));
  }, []);

  useEffect(() => {
    const targetSession = String(router.query.session || '');
    if (!targetSession) return;

    getAccessToken().then(async (token) => {
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
    if (!message || busy) return;

    setBusy(true);
    setNotice('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setQ('');

    const token = await getAccessToken();
    const res = await fetch('/api/ai/persistent-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ message, sessionId })
    });
    const data = await res.json();

    if (data.sessionId) setSessionId(data.sessionId);
    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || data.error || 'Tidak ada balasan.', planName: data.planName }]);
    if (!res.ok) setNotice(data.error || 'Dlavie AI sedang mengalami gangguan.');
    await loadAccess().catch(() => undefined);
    setBusy(false);
  }

  return (
    <main className="dlavie-lux-page min-h-screen overflow-hidden px-4 py-6 text-white md:px-8 md:py-8">
      <div className="dlavie-mesh" />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="dlavie-holo-noise absolute inset-0" />
        <div className="dlavie-scanline absolute inset-0" />
      </div>

      <section className="mx-auto max-w-7xl">
        <header className="dlavie-glass dlavie-edge-flow mb-6 rounded-[2rem] px-5 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-white/45">DLAVIE Intelligence</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-.06em] text-white md:text-6xl">Dlavie AI</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/58">Basic untuk bantuan cepat. Core untuk reasoning premium, coding, arsitektur, dan workflow serius di ekosistem DLAVIE.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white/72 transition hover:bg-white/[0.08] hover:text-white" href="/ai/history">History</a>
              <a className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#050505] shadow-[0_18px_48px_rgba(0,0,0,.22)]" href="/dashboard">Dashboard</a>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="space-y-5">
            <section className="dlavie-glass rounded-[2rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">Current Plan</p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-.05em] text-white">{access?.name || activePlan.name}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/55">{activePlan.description}</p>
                </div>
                <span className="rounded-full bg-[#dfff4f] px-3 py-2 text-xs font-black text-slate-950">{activePlan.badge}</span>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between text-sm font-black text-white/74">
                  <span>Kuota harian</span>
                  <span>{access ? `${access.dailyUsed}/${access.dailyQuota}` : `0/${activePlan.dailyQuota}`}</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#dfff4f] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-3 text-xs font-bold text-white/42">Sisa: {access?.remaining ?? activePlan.dailyQuota} pesan hari ini.</p>
              </div>

              {!access?.authenticated && (
                <a className="mt-5 block rounded-full bg-[#dfff4f] px-5 py-3 text-center text-sm font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)]" href="/login?next=/ai">Login untuk menyimpan plan</a>
              )}
            </section>

            <section className="dlavie-glass rounded-[2rem] p-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/42">AI Subscription</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-white">Basic vs Core</h2>

              <div className="mt-4 grid gap-3">
                {planCards.map((plan) => {
                  const selected = selectedPlan === plan.id;
                  const current = access?.plan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`rounded-[1.6rem] border p-4 text-left transition ${selected ? 'border-[#dfff4f]/70 bg-[#dfff4f]/10 shadow-[0_16px_35px_rgba(120,150,45,.12)]' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">{plan.badge}</p>
                          <h3 className="mt-1 text-xl font-black text-white">{plan.name}</h3>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${current ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white/65'}`}>{current ? 'Aktif' : plan.priceLabel}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-6 text-white/56">{plan.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                <h3 className="font-black text-white">{previewPlan.name}</h3>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-white/64">
                  {previewPlan.features.map((feature) => (
                    <li key={feature} className="flex gap-2"><span className="text-[#dfff4f]">✓</span><span>{feature}</span></li>
                  ))}
                </ul>
                {previewPlan.lockedFeatures.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/32">Terkunci di Basic</p>
                    <ul className="mt-3 space-y-2 text-sm font-semibold text-white/42">
                      {previewPlan.lockedFeatures.map((feature) => (
                        <li key={feature} className="flex gap-2"><span>🔒</span><span>{feature}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </aside>

          <section className="dlavie-glass flex min-h-[720px] flex-col overflow-hidden rounded-[2.5rem] p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#dfff4f]">{activePlan.name}</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-.05em] text-white">AI Commerce Chat</h2>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-white">{sessionId ? `Session ${sessionId.slice(0, 8)}` : 'New Session'}</span>
            </div>

            {notice && <p className="mt-4 rounded-[1.4rem] border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">{notice}</p>}

            <div className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-[1.7rem] bg-white/[0.04] p-4 shadow-inner ring-1 ring-white/10">
              {messages.map((m, i) => (
                <div key={`${m.role}-${i}`} className={`rounded-[1.4rem] p-4 font-semibold shadow-sm ring-1 ring-black/5 ${m.role === 'user' ? 'ml-auto max-w-[88%] bg-[#dfff4f]/90 text-slate-950' : 'mr-auto max-w-[88%] bg-white/90 text-slate-700'}`}>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">{m.planName || m.role}</p>
                  <p className="mt-1 whitespace-pre-wrap leading-7">{m.content}</p>
                </div>
              ))}
              {!messages.length && (
                <p className="rounded-[1.4rem] bg-white/75 p-5 font-semibold leading-7 text-slate-500 ring-1 ring-black/5">Tanya tentang produk digital DLAVIE, checkout, reward, coupon, rekomendasi produk, coding ringan, atau ide pengembangan website.</p>
              )}
            </div>

            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-5 min-h-28 w-full rounded-[1.7rem] border border-white/10 bg-white/80 p-4 font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-[#dfff4f]/40"
              placeholder={`Tulis pertanyaan untuk ${activePlan.name}...`}
            />
            <button onClick={ask} disabled={busy || !q.trim()} className="mt-4 w-full rounded-full bg-[#dfff4f] px-5 py-4 font-black text-slate-950 shadow-[0_16px_35px_rgba(120,150,45,.22)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? 'Dlavie AI memproses...' : `Kirim ke ${activePlan.name}`}
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
