import { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { dlavieAiPacks, estimateTextUnits, type DlavieAiPack, type DlavieAiPackId } from '@/lib/dlavie-ai-credits';
import { dlavieAiPlans, type DlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type ChatMessage = { role: 'user' | 'assistant'; content: string; planName?: string };
type StoredChatMessage = { role?: string; content?: string };
type Screen = 'welcome' | 'onboarding' | 'console';
type RuntimeMode = 'Lite' | 'Economy' | 'Power' | 'Core';
type ResponseMode = 'Instant' | 'Thinking';
type ConsoleTab = 'chat' | 'projects' | 'gems' | 'build' | 'playground' | 'pricing' | 'resources';
type BillingCycle = 'monthly' | 'yearly';
type UiAttachment = { id: string; name: string; kind: 'file' | 'photo'; size: number; text?: string; previewUrl?: string };

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

const backgroundVideo = 'https://image-link.edgeone.app/1779988010622-t0qa9o.mp4';
const promptIdeas = ['Bangun landing page produk digital DLAVIE', 'Buat agent support WhatsApp', 'Review arsitektur website saya'];
const intents = ['Website / App', 'Content & Brand', 'Business Analysis', 'AI Agent', 'Debugging Code', 'Learning & Research'];
const modes: { id: RuntimeMode; icon: string; desc: string; multiplier: string }[] = [
  { id: 'Lite', icon: '⠿', desc: 'Hemat untuk chat cepat dan task kecil.', multiplier: '0.8x' },
  { id: 'Economy', icon: '⠿', desc: 'Seimbang untuk mayoritas tugas harian.', multiplier: '1x' },
  { id: 'Power', icon: '⠿', desc: 'Lebih kuat untuk build, analisis, dan refactor.', multiplier: '1.6x' },
  { id: 'Core', icon: '✦', desc: 'Mode premium untuk agent dan reasoning berat.', multiplier: '2.4x' },
];
const models = [
  { name: 'Dlavie X Lite', badge: 'Fast', use: 'Chat ringan, ringkasan, prompt cepat', cost: '0.7x', pro: 'sangat hemat', con: 'kurang cocok untuk analisis berat' },
  { name: 'Dlavie X Mini', badge: 'Default', use: 'Tugas harian, support, konten', cost: '1x', pro: 'seimbang', con: 'bukan untuk workflow panjang' },
  { name: 'Dlavie 1.5', badge: 'Stable', use: 'Planning, UI/UX, analisis produk', cost: '1.4x', pro: 'jawaban matang', con: 'lebih boros token' },
  { name: 'Dlavie 1.5 Preview', badge: 'Preview', use: 'Eksperimen reasoning dan fitur baru', cost: '1.8x', pro: 'paling inovatif', con: 'hasil bisa berubah' },
  { name: 'Dlavie X 3', badge: 'Pro', use: 'Coding, agent, debugging, arsitektur', cost: '2.2x', pro: 'paling kuat', con: 'biaya token tinggi' },
  { name: 'Dlavie Architect', badge: 'Soon', use: 'System design dan database', cost: '2x', pro: 'teknis', con: 'belum aktif penuh' },
  { name: 'Dlavie Vision', badge: 'Soon', use: 'Analisis gambar dan layout', cost: '2x', pro: 'visual review', con: 'butuh upload pipeline' },
  { name: 'Dlavie Agent Pro', badge: 'Soon', use: 'Workflow multi-step', cost: '3x', pro: 'agentic', con: 'perlu guardrail' },
];
const gems = [
  { name: 'Commerce Strategist', desc: 'Funnel, produk digital, pricing, landing page.' },
  { name: 'WebDev Pro', desc: 'Next.js, React, debugging, UI/UX, production checklist.' },
  { name: 'Brand Writer', desc: 'Copywriting, campaign, tone brand DLAVIE.' },
  { name: 'Agent Builder', desc: 'Trigger, actions, validation, workflow.' },
];
const projects = [
  { title: 'WhatsApp Agent OS', tag: 'Agent', time: 'Aktif', desc: 'Pairing code, session recovery, dan command runner.' },
  { title: 'Dlavie AI Console', tag: 'AI OS', time: 'Hari ini', desc: 'Workspace chat, gems, build, resource, dan pricing.' },
  { title: 'Commerce Landing Lab', tag: 'Build', time: 'Kemarin', desc: 'Eksperimen copywriting, hero section, dan conversion flow.' },
];
const pricingCards = [
  { id: 'free', name: 'Free', monthly: 0, yearly: 0, badge: 'Explore', accent: 'from-slate-200/20 to-white/5', points: ['Rp0 untuk mulai mencoba Dlavie AI OS', '8 chat AI per hari dengan Dlavie X Lite / Mini', 'Prompt starter, My Project lokal, dan resource kit standar', 'Tanpa Memory AI dan tanpa Build agent lanjutan', 'Cocok untuk testing sebelum upgrade'] },
  { id: 'basic', name: 'Basic', monthly: 25000, yearly: 250000, badge: 'Starter', accent: 'from-blue-500/18 to-white/5', points: ['Rp25.000 per bulan untuk pekerjaan harian', '40 chat AI per hari dan context lebih panjang', 'Upload file teks ringan untuk dibaca sebagai konteks', 'Gems standar untuk konten, commerce, dan support', 'Memory belum tersedia di Basic'] },
  { id: 'core', name: 'Core', monthly: 175000, yearly: 1750000, badge: 'Recommended', accent: 'from-[#dfff4f]/25 to-blue-500/10', points: ['Rp175.000 per bulan untuk builder serius', '300 chat AI per hari dan model Dlavie 1.5 / X 3', 'Memory AI dapat diaktifkan', 'Thinking mode, Power/Core agent mode, Build workspace', 'Cocok untuk coding, strategi, UI/UX, dan workflow produk'] },
  { id: 'custom', name: 'Custom', monthly: 875000, yearly: 8750000, badge: 'Studio', accent: 'from-violet-500/25 to-cyan-400/10', points: ['Rp875.000 per bulan untuk studio dan tim', '1.200 chat AI per hari dan context besar', 'Memory prioritas, custom Gems, dan custom workflow', 'Model routing premium dan resource generation prioritas', 'Dirancang untuk produk digital skala besar'] },
];

function normalizeMessage(message: StoredChatMessage): ChatMessage {
  return { role: message.role === 'assistant' ? 'assistant' : 'user', content: String(message.content || '') };
}
function formatNumber(value: number) { return Number(value || 0).toLocaleString('id-ID'); }
function formatRupiah(value: number) { return value === 0 ? 'Rp0' : `Rp${formatNumber(value)}`; }
function packPriceLabel(pack: DlavieAiPack) { return `${formatNumber(pack.priceDBalance)} D Balance`; }
function cleanNotice(value: unknown) { const text = String(value || '').trim(); return !text || text.startsWith('{') ? 'Dlavie AI sedang bermasalah. Coba lagi sebentar.' : text; }
function canAttachText(file: File) { return file.type.startsWith('text/') || ['application/json', 'application/javascript', 'application/xml', 'image/svg+xml'].includes(file.type) || /\.(md|txt|json|js|ts|tsx|jsx|css|html|xml|csv)$/i.test(file.name); }
function generateResourceKit() {
  const rows = ['# DLAVIE AI OS RESOURCE KIT', '', 'Generated by Dlavie AI OS.', ''];
  for (let i = 1; i <= 180; i += 1) rows.push(`## Block ${i}`, '- Goal planner', '- Prompt structure', '- Build checklist', '- Agent workflow note', '- Token planning note', '');
  return rows.join('\n');
}

export default function AI() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [intent, setIntent] = useState('');
  const [tab, setTab] = useState<ConsoleTab>('chat');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>('Economy');
  const [responseMode, setResponseMode] = useState<ResponseMode>('Thinking');
  const [selectedModel, setSelectedModel] = useState('Dlavie X Mini');
  const [selectedGem, setSelectedGem] = useState('WebDev Pro');
  const [planMode, setPlanMode] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [attachments, setAttachments] = useState<UiAttachment[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [q, setQ] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [purchaseBusy, setPurchaseBusy] = useState<DlavieAiPackId | null>(null);
  const [access, setAccess] = useState<DlavieAiAccess | null>(null);
  const [notice, setNotice] = useState('');

  const activePlan = dlavieAiPlans[access?.plan || 'free'];
  const packs = useMemo(() => Object.values(dlavieAiPacks), []);
  const currentMode = modes.find((mode) => mode.id === runtimeMode) || modes[1];
  const tokenMultiplier = access?.plan === 'core' || access?.plan === 'custom' ? 2 : 1;
  const estimatedPromptUnits = q.trim() ? estimateTextUnits(q) * tokenMultiplier : 0;
  const memoryLocked = access?.plan !== 'core' && access?.plan !== 'custom';

  async function getAccessToken() { const supabase = createSupabaseBrowserClient(); const session = await supabase.auth.getSession(); return session.data.session?.access_token; }
  async function loadAccess() { const token = await getAccessToken(); const res = await fetch('/api/ai/dlavie-subscription', { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const data = await res.json(); if (res.ok) setAccess(data); }

  useEffect(() => { loadAccess().catch(() => setNotice('Status Dlavie AI belum bisa dimuat.')); }, []);
  useEffect(() => { if (memoryLocked) setMemoryEnabled(false); }, [memoryLocked]);
  useEffect(() => {
    const targetSession = String(router.query.session || '');
    if (!targetSession) return;
    setScreen('console');
    getAccessToken().then(async (token) => {
      if (!token) return;
      setBusy(true);
      const res = await fetch(`/api/ai/session?sessionId=${targetSession}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) { setSessionId(targetSession); setMessages(Array.isArray(json.messages) ? json.messages.map(normalizeMessage) : []); }
      setBusy(false);
    });
  }, [router.query.session]);

  function startOnboarding() { setScreen('onboarding'); window.setTimeout(() => document.getElementById('dlavie-ai-onboarding')?.scrollIntoView({ behavior: 'smooth' }), 50); }
  function enterConsole(nextIntent?: string) { if (nextIntent) setIntent(nextIntent); setScreen('console'); window.setTimeout(() => document.getElementById('dlavie-ai-console')?.scrollIntoView({ behavior: 'smooth' }), 50); }
  function downloadResourceKit() { const blob = new Blob([generateResourceKit()], { type: 'text/markdown;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'dlavie-ai-os-resource-kit.md'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); setNotice('Resource kit berhasil dibuat dan mulai diunduh.'); }

  async function buyCredits(pack: DlavieAiPack) {
    if (purchaseBusy) return;
    if (!window.confirm(`Beli ${pack.badge}?\n\nBiaya: ${packPriceLabel(pack)}\nSaldo: ${formatNumber(access?.dBalance || 0)} D Balance`)) return;
    setPurchaseBusy(pack.id); setNotice('');
    try { const token = await getAccessToken(); const res = await fetch('/api/ai/buy-credits', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ packId: pack.id }) }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(cleanNotice(data.error)); setNotice(`Berhasil membeli ${data.pack?.badge || pack.badge}. Terpotong ${formatNumber(data.chargedDBalance || pack.priceDBalance)} D Balance.`); await loadAccess(); } catch (error) { setNotice(error instanceof Error ? cleanNotice(error.message) : 'Pembelian AI Token gagal.'); } finally { setPurchaseBusy(null); }
  }

  async function ask() {
    const message = q.trim(); if (!message || busy) return;
    setBusy(true); setNotice(''); setMessages((prev) => [...prev, { role: 'user', content: message }]); setQ('');
    const attachmentText = attachments.length ? `\nAttachments:\n${attachments.map((item) => `- ${item.kind}: ${item.name} (${formatNumber(item.size)} bytes)${item.text ? `\n  Preview:\n${item.text.slice(0, 1800)}` : ''}`).join('\n')}` : '';
    const enrichedMessage = `Dlavie AI OS\nIntent: ${intent || 'General'}\nMode: ${runtimeMode}\nResponse: ${responseMode}\nModel: ${selectedModel}\nGem: ${selectedGem}\nPlan first: ${planMode ? 'Yes' : 'No'}\nMemory: ${memoryEnabled && !memoryLocked ? 'Enabled' : 'Off'}\nWeb search: ${webSearch ? 'Requested' : 'Off'}${attachmentText}\n\n${message}`;
    try { const token = await getAccessToken(); const res = await fetch('/api/ai/persistent-chat', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message: enrichedMessage, sessionId }) }); const data = await res.json().catch(() => ({})); if (data.sessionId) setSessionId(data.sessionId); if (!res.ok) { setNotice(cleanNotice(data.error)); await loadAccess().catch(() => undefined); return; } setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'Dlavie AI tidak mengembalikan jawaban.', planName: `${data.planName || activePlan.name} • ${selectedModel}` }]); setAttachments([]); if (typeof data.chargedTokens === 'number') setNotice(`Dipakai ${formatNumber(data.chargedTokens)} AI Token. Sisa ${formatNumber(data.aiTokenBalance || 0)}.`); await loadAccess().catch(() => undefined); } catch { setNotice('Dlavie AI sedang bermasalah. Coba lagi sebentar.'); } finally { setBusy(false); }
  }

  return (
    <main className="fixed inset-0 z-[999999] overflow-y-auto bg-[#08090d] text-white">
      {(screen === 'welcome' || screen === 'onboarding') && <Welcome onStart={startOnboarding} onSkip={() => enterConsole()} />}
      {screen === 'onboarding' && <Onboarding onPick={enterConsole} />}
      {screen === 'console' && (
        <section id="dlavie-ai-console" className="min-h-screen bg-[#0b0c10]">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#111217]/90 px-4 py-3 backdrop-blur-2xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><button onClick={() => setScreen('welcome')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-black">←</button><b>Dlavie AI OS</b><div className="text-xs font-bold text-white/55">{formatNumber(access?.aiTokenBalance || 0)} Token · {formatNumber(access?.dBalance || 0)} DB</div></div></header>
          {notice && <div className="mx-auto mt-4 max-w-7xl rounded-2xl border border-[#dfff4f]/25 bg-[#dfff4f]/10 p-4 text-sm font-bold text-[#f1ffc0]">{notice}</div>}
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[230px_1fr_330px]">
            <aside className="space-y-3">{(['chat','projects','gems','build','playground','pricing','resources'] as ConsoleTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-black capitalize transition ${tab === item ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/[0.06] text-white/65 hover:bg-white/[0.1]'}`}>{item === 'projects' ? 'My Project' : item}</button>)}<div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Intent</p><p className="mt-2 text-sm font-bold text-white/70">{intent || 'General AI workspace'}</p></div></aside>
            <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/30">
              {tab === 'chat' && <ChatPanel messages={messages} busy={busy} q={q} setQ={setQ} ask={ask} selectedModel={selectedModel} activePlan={activePlan.name} estimatedPromptUnits={estimatedPromptUnits} planMode={planMode} setPlanMode={setPlanMode} runtimeMode={runtimeMode} setRuntimeMode={setRuntimeMode} modes={modes} attachments={attachments} setAttachments={setAttachments} webSearch={webSearch} setWebSearch={setWebSearch} memoryEnabled={memoryEnabled} setMemoryEnabled={setMemoryEnabled} memoryLocked={memoryLocked} />}
              {tab === 'projects' && <Panel title="My Project" subtitle="History dan workspace cepat seperti project center.">{projects.map((project) => <button key={project.title} onClick={() => { setTab('chat'); setQ(`Lanjutkan project ${project.title}: ${project.desc}`); }} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 text-left transition hover:-translate-y-1 hover:border-[#dfff4f]/40"><div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{project.tag}</span><span className="text-xs text-white/35">{project.time}</span></div><h3 className="mt-4 text-xl font-black">{project.title}</h3><p className="mt-2 text-sm text-white/48">{project.desc}</p></button>)}</Panel>}
              {tab === 'gems' && <Panel title="Gems" subtitle="Persona kerja khusus untuk tugas berbeda.">{gems.map((gem) => <button key={gem.name} onClick={() => setSelectedGem(gem.name)} className={`rounded-2xl border p-4 text-left ${selectedGem === gem.name ? 'border-[#dfff4f]/50 bg-[#dfff4f]/10' : 'border-white/10 bg-white/5'}`}><h3 className="font-black">{gem.name}</h3><p className="mt-2 text-sm text-white/48">{gem.desc}</p></button>)}</Panel>}
              {tab === 'build' && <Panel title="Build" subtitle="Workspace untuk app, website, dan agent."><BuildCard title="Website Builder" text="Struktur landing page, copywriting, dan komponen." /><BuildCard title="Agent Flow" text="Trigger, actions, validation, dan handoff." /><BuildCard title="Automation" text="Workflow admin, support, dan commerce." /></Panel>}
              {tab === 'playground' && <Panel title="Playground" subtitle="Uji model dan gaya respon.">{models.map((model) => <button key={model.name} onClick={() => setSelectedModel(model.name)} className={`rounded-2xl border p-4 text-left ${selectedModel === model.name ? 'border-blue-400 bg-blue-400/10' : 'border-white/10 bg-white/5'}`}><h3 className="font-black">{model.name} <span className="text-xs text-[#dfff4f]">{model.badge}</span></h3><p className="mt-2 text-sm text-white/50">{model.use}</p><p className="mt-2 text-xs text-white/35">Token: {model.cost} · + {model.pro} · - {model.con}</p></button>)}</Panel>}
              {tab === 'pricing' && <PricingPanel cards={pricingCards} billingCycle={billingCycle} setBillingCycle={setBillingCycle} />}
              {tab === 'resources' && <Panel title="Download Resource" subtitle="File dibuat langsung dan benar-benar terunduh."><div className="rounded-3xl border border-[#dfff4f]/25 bg-[#dfff4f]/10 p-6"><h3 className="text-2xl font-black">Dlavie AI OS Resource Kit</h3><p className="mt-3 text-sm text-white/55">Berisi blok checklist, model notes, token planning, dan workflow template.</p><button onClick={downloadResourceKit} className="mt-5 rounded-full bg-[#dfff4f] px-5 py-3 text-sm font-black text-slate-950">Download Resource Kit</button></div></Panel>}
            </section>
            <aside className="space-y-4"><SideCard title="Agent Modes"><div className="grid grid-cols-2 gap-3">{modes.map((mode) => <button key={mode.id} onClick={() => setRuntimeMode(mode.id)} className={`relative overflow-hidden rounded-3xl p-4 text-left text-sm font-black transition duration-300 ${runtimeMode === mode.id ? '-translate-y-1 bg-blue-500 text-white shadow-[0_22px_70px_rgba(59,130,246,.35)] after:absolute after:inset-x-5 after:bottom-0 after:h-1 after:rounded-full after:bg-[#dfff4f] after:shadow-[0_0_26px_#dfff4f]' : 'bg-white/[0.065] text-white/55 hover:-translate-y-1 hover:bg-white/[0.1]'}`}><span className="mr-2 text-lg">{mode.icon}</span>{mode.id}<p className="mt-2 text-[11px] opacity-75">{mode.multiplier}</p></button>)}</div><p className="mt-4 text-sm text-white/48">{currentMode.desc}</p></SideCard><SideCard title="AI Settings"><div className="grid grid-cols-2 gap-2">{(['Instant','Thinking'] as ResponseMode[]).map((mode) => <button key={mode} onClick={() => setResponseMode(mode)} className={`rounded-2xl p-3 text-sm font-black ${responseMode === mode ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/8 text-white/55'}`}>{mode}</button>)}</div></SideCard><SideCard title="Memory"><button onClick={() => !memoryLocked && setMemoryEnabled(!memoryEnabled)} className={`w-full rounded-2xl p-4 text-left text-sm font-black ${memoryLocked ? 'bg-white/5 text-white/35' : memoryEnabled ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/8 text-white/65'}`}>{memoryLocked ? 'Core ke atas saja' : memoryEnabled ? 'Memory aktif' : 'Aktifkan Memory'}<p className="mt-2 text-xs font-semibold opacity-70">Menyimpan preferensi project dan gaya jawaban.</p></button></SideCard><SideCard title="Model"><select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-[#202128] p-3 text-sm font-black text-white outline-none">{models.map((model) => <option key={model.name}>{model.name}</option>)}</select></SideCard><SideCard title="Token Store"><div className="mt-3 space-y-2">{packs.map((pack) => <button key={pack.id} onClick={() => buyCredits(pack)} disabled={purchaseBusy !== null || (access?.dBalance || 0) < pack.priceDBalance} className="w-full rounded-2xl bg-white/8 p-3 text-left text-sm font-black disabled:opacity-40"><span>{pack.badge}</span><span className="float-right text-[#dfff4f]">{packPriceLabel(pack)}</span></button>)}</div></SideCard></aside>
          </div>
        </section>
      )}
    </main>
  );
}

function Welcome({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) { return <section className="relative min-h-screen overflow-hidden"><video className="absolute inset-0 h-full w-full object-cover opacity-70" src={backgroundVideo} autoPlay muted loop playsInline /><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(196,255,63,.28),transparent_34%),linear-gradient(180deg,rgba(4,5,8,.35),rgba(4,5,8,.96))]" /><div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 text-center"><div className="animate-pulse rounded-full border border-[#dfff4f]/25 bg-[#dfff4f]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.32em] text-[#dfff4f]">Dlavie AI OS</div><h1 className="mt-7 max-w-4xl text-5xl font-black tracking-[-.08em] md:text-8xl">Bangun. Pikirkan. Jalankan.</h1><p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-white/68 md:text-lg">Workspace AI baru untuk agent, build, gems, playground, resource, dan model Dlavie generasi berikutnya.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={onStart} className="rounded-full bg-[#dfff4f] px-7 py-4 text-sm font-black text-slate-950 shadow-[0_24px_80px_rgba(223,255,79,.28)]">Mulai Dlavie AI</button><button onClick={onSkip} className="rounded-full border border-white/15 bg-white/10 px-7 py-4 text-sm font-black text-white backdrop-blur-xl">Masuk Console</button></div></div></section>; }
function Onboarding({ onPick }: { onPick: (intent: string) => void }) { return <section id="dlavie-ai-onboarding" className="min-h-screen bg-[#08090d] px-5 py-16"><div className="mx-auto max-w-5xl"><p className="text-xs font-black uppercase tracking-[0.3em] text-[#dfff4f]">Personalize</p><h2 className="mt-4 text-4xl font-black tracking-[-.06em] md:text-6xl">Kamu menggunakan Dlavie AI untuk apa?</h2><div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{intents.map((item) => <button key={item} onClick={() => onPick(item)} className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-6 text-left transition hover:-translate-y-1 hover:border-[#dfff4f]/40"><span className="text-3xl">✦</span><h3 className="mt-5 text-xl font-black">{item}</h3><p className="mt-2 text-sm text-white/45">Atur workspace AI berdasarkan kebutuhan ini.</p></button>)}</div></div></section>; }
function ChatPanel(props: { messages: ChatMessage[]; busy: boolean; q: string; setQ: (v: string) => void; ask: () => void; selectedModel: string; activePlan: string; estimatedPromptUnits: number; planMode: boolean; setPlanMode: (v: boolean) => void; runtimeMode: RuntimeMode; setRuntimeMode: (mode: RuntimeMode) => void; modes: { id: RuntimeMode; icon: string; desc: string; multiplier: string }[]; attachments: UiAttachment[]; setAttachments: (items: UiAttachment[]) => void; webSearch: boolean; setWebSearch: (value: boolean) => void; memoryEnabled: boolean; setMemoryEnabled: (value: boolean) => void; memoryLocked: boolean }) { const [toolsOpen, setToolsOpen] = useState(false); const [modeOpen, setModeOpen] = useState(false); async function addFiles(files: FileList | null, kind: 'file' | 'photo') { if (!files) return; const next = await Promise.all(Array.from(files).map(async (file) => { let text = ''; if (canAttachText(file) && file.size <= 600000) text = (await file.text()).slice(0, 6000); return { id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, size: file.size, kind, text, previewUrl: kind === 'photo' ? URL.createObjectURL(file) : undefined }; })); props.setAttachments([...props.attachments, ...next]); setToolsOpen(false); } return <div className="flex min-h-[760px] flex-col"><div className="border-b border-white/10 p-4"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#dfff4f]">{props.activePlan}</p><h2 className="mt-1 text-2xl font-black">Agent Chat</h2></div><div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">{!props.messages.length && <div className="m-auto max-w-xl text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#dfff4f]/10 text-3xl">AI</div><h3 className="mt-5 text-3xl font-black">Apa yang ingin kamu bangun?</h3><div className="mt-6 grid gap-2 md:grid-cols-3">{promptIdeas.map((idea) => <button key={idea} onClick={() => props.setQ(idea)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left text-xs text-white/60">{idea}</button>)}</div></div>}{props.messages.map((m, i) => <div key={`${m.role}-${i}`} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm font-semibold leading-7 ${m.role === 'user' ? 'bg-[#19304d] text-blue-100' : 'bg-white text-slate-800'}`}><p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] opacity-55">{m.role === 'user' ? 'User' : m.planName || props.selectedModel}</p>{m.content}</div></div>)}{props.busy && <p className="w-fit rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white/55">Dlavie AI mengetik...</p>}</div><div className="relative border-t border-white/10 bg-black/25 p-3">{props.attachments.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{props.attachments.map((item) => <span key={item.id} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/55">{item.previewUrl ? <img src={item.previewUrl} alt="" className="h-6 w-6 rounded-full object-cover" /> : item.kind === 'photo' ? '🖼' : '📎'} {item.name}{item.text ? ' · text loaded' : ''}</span>)}</div>}{toolsOpen && <div className="absolute bottom-36 left-4 z-30 grid w-64 gap-2 rounded-3xl border border-white/10 bg-[#25262d] p-3 shadow-2xl shadow-black/40"><label className="cursor-pointer rounded-2xl bg-white/8 p-3 text-sm font-bold text-white/75 hover:bg-white/12">📎 Kirim file<input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files, 'file')} /></label><label className="cursor-pointer rounded-2xl bg-white/8 p-3 text-sm font-bold text-white/75 hover:bg-white/12">🖼 Kirim foto<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files, 'photo')} /></label><button onClick={() => { props.setWebSearch(!props.webSearch); setToolsOpen(false); }} className={`rounded-2xl p-3 text-left text-sm font-bold ${props.webSearch ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/8 text-white/75'}`}>🌐 Pencarian web</button><button disabled={props.memoryLocked} onClick={() => !props.memoryLocked && props.setMemoryEnabled(!props.memoryEnabled)} className={`rounded-2xl p-3 text-left text-sm font-bold ${props.memoryLocked ? 'bg-white/5 text-white/35' : props.memoryEnabled ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/8 text-white/75'}`}>🧠 Memory {props.memoryLocked ? 'Core+' : props.memoryEnabled ? 'on' : 'off'}</button></div>}{modeOpen && <div className="absolute bottom-16 left-28 z-30 w-[min(94vw,520px)] rounded-3xl border border-white/10 bg-[#2b2c31] p-4 shadow-2xl shadow-black/50"><p className="text-sm font-bold text-white/70">Agent modes</p><div className="mt-3 grid grid-cols-3 gap-2">{props.modes.filter((m) => m.id !== 'Power').map((mode) => <button key={mode.id} onClick={() => { props.setRuntimeMode(mode.id); setModeOpen(false); }} className={`rounded-2xl border p-3 text-left text-sm font-black transition ${props.runtimeMode === mode.id ? 'border-blue-400 bg-blue-500/30 text-white' : 'border-white/8 bg-white/6 text-white/62'}`}><span className="mr-2">{mode.icon}</span>{mode.id}<p className="mt-2 text-xs font-semibold opacity-65">{mode.desc}</p></button>)}</div></div>}<textarea value={props.q} onChange={(e) => props.setQ(e.target.value)} className="min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-[#25262d] p-4 text-sm font-semibold text-white outline-none" placeholder={`Make, test, iterate dengan ${props.selectedModel}...`} /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><button onClick={() => props.setPlanMode(!props.planMode)} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-95 ${props.planMode ? 'bg-[#dfff4f] text-slate-950 shadow-[0_0_30px_rgba(223,255,79,.25)]' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}><span className={`h-5 w-5 rounded-md border ${props.planMode ? 'border-slate-950 bg-slate-950/10' : 'border-white/25'}`} />Plan</button><button onClick={() => setModeOpen(!modeOpen)} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white/70 transition hover:bg-white/15 active:scale-95"><span className="text-lg">⠿</span>{props.runtimeMode}⌄</button><button onClick={() => setToolsOpen(!toolsOpen)} className="rounded-2xl bg-white/10 px-4 py-3 text-lg font-black text-white/70 transition hover:bg-white/15">+</button><span className="text-xs font-bold text-white/35">~{formatNumber(props.estimatedPromptUnits)} token awal</span></div><button onClick={props.ask} disabled={props.busy || !props.q.trim()} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white disabled:opacity-40">{props.busy ? 'Stop' : 'Run'}</button></div></div></div>; }
function PricingPanel({ cards, billingCycle, setBillingCycle }: { cards: typeof pricingCards; billingCycle: BillingCycle; setBillingCycle: (cycle: BillingCycle) => void }) { return <div className="min-h-[760px] p-5"><p className="text-xs font-black uppercase tracking-[0.26em] text-[#dfff4f]">Dlavie AI OS</p><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h2 className="mt-2 text-4xl font-black tracking-[-.06em]">Pricing</h2><p className="mt-3 max-w-2xl text-sm text-white/48">Geser kartu ke kanan atau kiri. Annual memberi harga total lebih besar, tapi lebih hemat dibanding bayar bulanan 12 kali.</p></div><div className="rounded-full border border-white/10 bg-white/8 p-1"><button onClick={() => setBillingCycle('monthly')} className={`rounded-full px-4 py-2 text-xs font-black ${billingCycle === 'monthly' ? 'bg-white text-slate-950' : 'text-white/55'}`}>1 Month</button><button onClick={() => setBillingCycle('yearly')} className={`rounded-full px-4 py-2 text-xs font-black ${billingCycle === 'yearly' ? 'bg-[#dfff4f] text-slate-950' : 'text-white/55'}`}>1 Year</button></div></div><div className="mt-6 flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]">{cards.map((card) => { const price = billingCycle === 'monthly' ? card.monthly : card.yearly; const suffix = billingCycle === 'monthly' ? '/bulan' : '/tahun'; return <article key={card.name} className={`min-w-[82%] snap-center rounded-[2rem] border border-white/10 bg-gradient-to-br ${card.accent} p-6 shadow-2xl shadow-black/30 sm:min-w-[390px]`}><div className="flex items-center justify-between"><h3 className="text-2xl font-black">{card.name}</h3><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/65">{card.badge}</span></div><p className="mt-5 text-4xl font-black tracking-[-.05em]">{formatRupiah(price)}</p><p className="mt-1 text-xs font-bold text-white/42">{price === 0 ? 'selamanya' : suffix}{billingCycle === 'yearly' && price > 0 ? ' · hemat ±2 bulan' : ''}</p><ul className="mt-6 space-y-3 text-sm font-semibold leading-6 text-white/68">{card.points.map((point) => <li key={point} className="flex gap-2"><span className="text-[#dfff4f]">✓</span><span>{point}</span></li>)}</ul><button className="mt-7 w-full rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Pilih {card.name}</button></article>; })}</div></div>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <div className="min-h-[760px] p-5"><p className="text-xs font-black uppercase tracking-[0.26em] text-[#dfff4f]">Dlavie AI OS</p><h2 className="mt-2 text-4xl font-black tracking-[-.06em]">{title}</h2><p className="mt-3 max-w-2xl text-sm text-white/48">{subtitle}</p><div className="mt-6 grid gap-4 md:grid-cols-2">{children}</div></div>; }
function BuildCard({ title, text }: { title: string; text: string }) { return <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 text-sm text-white/48">{text}</p><button className="mt-5 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950">Start build</button></div>; }
function SideCard({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-4"><p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">{title}</p><div className="mt-3">{children}</div></div>; }
