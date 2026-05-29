import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { dlavieAiPacks, estimateTextUnits, type DlavieAiPack, type DlavieAiPackId } from '@/lib/dlavie-ai-credits';
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
  dBalance: number;
  aiTokenBalance: number;
};

const promptIdeas = [
  'Buatkan strategi landing page produk digital DLAVIE',
  'Review ide fitur AI untuk marketplace saya',
  'Bantu debugging komponen React yang lambat',
];

function normalizeMessage(message: StoredChatMessage): ChatMessage {
  return { role: message.role === 'assistant' ? 'assistant' : 'user', content: String(message.content || '') };
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString('id-ID');
}

function createPlanProgress(access: DlavieAiAccess | null) {
  if (!access?.dailyQuota) return 0;
  return Math.min(100, Math.round((access.dailyUsed / access.dailyQuota) * 100));
}

function packPriceLabel(pack: DlavieAiPack) {
  return `${formatNumber(pack.priceDBalance)} D Balance`;
}

function isUnsafeAiReply(value: unknown) {
  const text = String(value || '').toLowerCase().trim();
  const credentialPhrase = 'api' + ' key';
  return text.includes(credentialPhrase) || text.includes('permission_denied') || text.includes('403') || text.startsWith('{"error"') || text.startsWith('{\n  "error"');
}

function safeAiNotice(value: unknown) {
  const text = String(value || '').trim();
  if (!text || isUnsafeAiReply(text)) return 'Dlavie AI sedang bermasalah. Admin perlu memperbarui konfigurasi AI provider.';
  return text;
}

export default function AI() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [q, setQ] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState<DlavieAiPackId | null>(null);
  const [access, setAccess] = useState<DlavieAiAccess | null>(null);
  const [notice, setNotice] = useState('');

  const activePlan = dlavieAiPlans[access?.plan || 'basic'];
  const progress = createPlanProgress(access);
  const creditPacks = useMemo(() => Object.values(dlavieAiPacks), []);
  const estimatedPromptUnits = q.trim() ? estimateTextUnits(q) * (access?.plan === 'core' ? 2 : 1) : 0;

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
    if (res.ok) setAccess(data);
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
        setMessages(loaded.filter((item: ChatMessage) => !isUnsafeAiReply(item.content)));
      }
      setBusy(false);
    });
  }, [router.query.session]);

  async function buyCredits(pack: DlavieAiPack) {
    if (purchaseBusy) return;

    const confirmed = window.confirm(
      `Beli ${pack.badge}?\n\nBiaya yang dipotong: ${packPriceLabel(pack)}\nSaldo D Balance sekarang: ${formatNumber(access?.dBalance || 0)}\n\nLanjutkan transaksi?`
    );
    if (!confirmed) return;

    setPurchaseBusy(pack.id);
    setNotice('');

    try {
      const token = await getAccessToken();
      const res = await fetch('/api/ai/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(safeAiNotice(data.error || 'Pembelian AI Token gagal.'));

      setNotice(`Berhasil: ${data.pack?.badge || pack.badge}. Terpotong ${formatNumber(data.chargedDBalance || pack.priceDBalance)} D Balance. Sisa AI Token ${formatNumber(data.aiTokenBalance)}.`);
      await loadAccess();
    } catch (error) {
      setNotice(error instanceof Error ? safeAiNotice(error.message) : 'Pembelian AI Token gagal.');
    } finally {
      setPurchaseBusy(null);
    }
  }

  async function ask() {
    const message = q.trim();
    if (!message || busy) return;

    setBusy(true);
    setNotice('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setQ('');

    try {
      const token = await getAccessToken();
      const res = await fetch('/api/ai/persistent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message, sessionId }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.sessionId) setSessionId(data.sessionId);

      if (!res.ok) {
        setNotice(safeAiNotice(data.error || 'Dlavie AI sedang mengalami gangguan.'));
        await loadAccess().catch(() => undefined);
        return;
      }

      if (!data.reply || isUnsafeAiReply(data.reply)) {
        setNotice('Dlavie AI sedang bermasalah. Admin perlu memperbarui konfigurasi AI provider.');
        await loadAccess().catch(() => undefined);
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, planName: data.planName }]);
      if (typeof data.chargedTokens === 'number') setNotice(`Dipakai ${formatNumber(data.chargedTokens)} AI Token. Sisa ${formatNumber(data.aiTokenBalance || 0)}.`);
      await loadAccess().catch(() => undefined);
    } catch {
      setNotice('Dlavie AI sedang bermasalah. Coba lagi sebentar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060b] px-4 py-5 text-white md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-18%] h-[36rem] w-[36rem] rounded-full bg-[#dfff4f]/18 blur-[110px] animate-pulse" />
        <div className="absolute right-[-12%] top-[12%] h-[34rem] w-[34rem] rounded-full bg-cyan-400/12 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[35%] h-[28rem] w-[28rem] rounded-full bg-violet-500/12 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
      </div>

      <section className="relative mx-auto max-w-7xl">
        <header className="mb-5 rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#dfff4f]/25 bg-[#dfff4f]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#dfff4f]">
                <span className="h-2 w-2 rounded-full bg-[#dfff4f] shadow-[0_0_18px_#dfff4f]" />
                Dlavie AI Console
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-.07em] md:text-6xl">AI yang serius untuk ekosistem DLAVIE.</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/55 md:text-base">Chat, coding, strategi, dan analisis produk digital dalam satu workspace. AI Token dipakai transparan per percakapan.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">D Balance</p>
                <p className="mt-2 text-2xl font-black">{formatNumber(access?.dBalance || 0)}</p>
                <a href="/wallet" className="mt-3 inline-flex rounded-full bg-white px-3 py-2 text-xs font-black text-slate-950">Topup</a>
              </div>
              <div className="rounded-[1.4rem] border border-[#dfff4f]/25 bg-[#dfff4f]/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#dfff4f]">AI Token</p>
                <p className="mt-2 text-2xl font-black">{formatNumber(access?.aiTokenBalance || 0)}</p>
                <p className="mt-3 text-xs font-bold text-white/42">Bahan bakar chat</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Mode</p>
                <p className="mt-2 text-lg font-black">{activePlan.name.replace('Dlavie AI ', '')}</p>
                <p className="mt-3 text-xs font-bold text-white/42">{access?.dailyUsed || 0}/{access?.dailyQuota || activePlan.dailyQuota} chat hari ini</p>
              </div>
            </div>
          </div>
        </header>

        {notice && (
          <div className="mb-5 rounded-[1.4rem] border border-[#dfff4f]/25 bg-[#dfff4f]/10 p-4 text-sm font-bold text-[#f1ffc0] shadow-xl shadow-[#dfff4f]/5">
            {notice}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <section className="min-h-[720px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="flex flex-col gap-3 border-b border-white/10 bg-black/20 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-[#dfff4f]">{activePlan.name}</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-.05em]">Chat Workspace</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/50">
                <span className="rounded-full bg-white/10 px-3 py-2">{sessionId ? `Session ${sessionId.slice(0, 8)}` : 'New Session'}</span>
                <a className="rounded-full bg-white/10 px-3 py-2 transition hover:bg-white/15 hover:text-white" href="/ai/history">History</a>
              </div>
            </div>

            <div className="flex h-[480px] flex-col gap-4 overflow-y-auto p-5 md:h-[560px]">
              {!messages.length && (
                <div className="m-auto max-w-2xl text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-[#dfff4f]/25 bg-[#dfff4f]/10 text-3xl shadow-[0_0_80px_rgba(223,255,79,.22)]">AI</div>
                  <h3 className="mt-5 text-3xl font-black tracking-[-.05em]">Mulai dengan satu tujuan.</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/50">Pilih contoh prompt atau tulis kebutuhanmu. Dlavie AI akan menjawab sesuai mode aktif dan saldo tokenmu.</p>
                  <div className="mt-6 grid gap-2 md:grid-cols-3">
                    {promptIdeas.map((idea) => (
                      <button key={idea} type="button" onClick={() => setQ(idea)} className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] p-3 text-left text-xs font-bold leading-5 text-white/70 transition hover:border-[#dfff4f]/40 hover:bg-[#dfff4f]/10 hover:text-white">
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <div key={`${m.role}-${i}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-[1.4rem] px-4 py-3 shadow-xl ring-1 md:max-w-[74%] ${isUser ? 'bg-[#dfff4f] text-slate-950 ring-[#dfff4f]/30' : 'bg-white text-slate-800 ring-white/15'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isUser ? 'text-slate-700' : 'text-slate-400'}`}>{isUser ? 'You' : m.planName || activePlan.name}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7">{m.content}</p>
                    </div>
                  </div>
                );
              })}

              {busy && <div className="w-fit rounded-full border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white/55">Dlavie AI sedang berpikir...</div>}
            </div>

            <div className="border-t border-white/10 bg-black/25 p-4">
              <textarea
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="min-h-28 w-full resize-none rounded-[1.4rem] border border-white/10 bg-white p-4 text-sm font-semibold leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-[#dfff4f]/35"
                placeholder={`Tulis instruksi untuk ${activePlan.name}...`}
              />
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-bold text-white/42">Estimasi awal: {formatNumber(estimatedPromptUnits)} AI Token. Biaya final mengikuti panjang jawaban.</p>
                <button onClick={ask} disabled={busy || !q.trim()} className="rounded-full bg-[#dfff4f] px-6 py-3 text-sm font-black text-slate-950 shadow-[0_18px_45px_rgba(223,255,79,.18)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(223,255,79,.26)] disabled:cursor-not-allowed disabled:opacity-45">
                  {busy ? 'Memproses...' : 'Kirim ke Dlavie AI'}
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#dfff4f]">Token Store</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">Beli AI Token</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white/70">1 DB = 1 Token</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-white/50">Saldo D Balance dipotong sesuai harga paket. Tidak ada angka singkatan tersembunyi.</p>

              <div className="mt-5 grid gap-3">
                {creditPacks.map((pack) => {
                  const insufficient = (access?.dBalance || 0) < pack.priceDBalance;
                  const disabled = purchaseBusy !== null || insufficient;
                  return (
                    <article key={pack.id} className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4 transition hover:border-[#dfff4f]/35 hover:bg-[#dfff4f]/[0.06]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{pack.name}</p>
                          <h3 className="mt-1 text-2xl font-black text-white">{pack.badge}</h3>
                          <p className="mt-2 text-xs font-semibold leading-5 text-white/45">{pack.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white/40">Harga</p>
                          <p className="mt-1 text-sm font-black text-[#dfff4f]">{packPriceLabel(pack)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => buyCredits(pack)}
                        disabled={disabled}
                        className="mt-4 w-full rounded-full bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#dfff4f] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {purchaseBusy === pack.id ? 'Memproses...' : insufficient ? 'D Balance kurang' : `Beli - ${packPriceLabel(pack)}`}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/38">Mode Aktif</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">{activePlan.name}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/50">{activePlan.description}</p>
              <div className="mt-5 rounded-full bg-white/10 p-1">
                <div className="h-2 rounded-full bg-[#dfff4f] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-xs font-bold text-white/42">Sisa kuota harian: {formatNumber(access?.remaining || 0)} chat.</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
