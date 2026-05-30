import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, Bot, Check, Code2, Copy, FileText, Globe2, Image as ImageIcon, Layers3, MessageSquare, Paperclip, Pencil, Search, Send, Sparkles } from 'lucide-react';
import { dlavieAiPacks, estimateTextUnits, type DlavieAiPack, type DlavieAiPackId } from '@/lib/dlavie-ai-credits';
import { dlavieAiPlans, type DlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Screen = 'welcome' | 'form' | 'app';
type Tab = 'chat' | 'playground' | 'projects' | 'pricing' | 'resources';
type Mode = 'instant' | 'thinking' | 'agent' | 'research';
type Billing = 'month' | 'year';
type Access = { authenticated: boolean; plan: DlavieAiPlan; name: string; dailyQuota: number; dailyUsed: number; remaining: number; dBalance: number; aiTokenBalance: number };
type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string; model?: string; tools?: string[]; vision?: boolean };
type Attachment = { id: string; name: string; kind: 'file' | 'image'; size: number; text?: string; inline?: string; preview?: string };

const VIDEO = 'https://image-link.edgeone.app/1779988010622-t0qa9o.mp4';
const intents = ['Website dan aplikasi', 'Konten dan brand', 'Analisis bisnis', 'Agent otomatis', 'Debugging kode', 'Belajar dan riset'];
const sources = ['TikTok atau Reels', 'Instagram', 'Teman atau komunitas', 'Google Search', 'YouTube', 'Website DLAVIE'];
const professions = ['Pelajar atau mahasiswa', 'Founder atau owner', 'Web developer', 'Content creator', 'Designer', 'Marketer', 'Freelancer', 'Lainnya'];
const models = [
  { id: 'dlavie-x-lite', name: 'Dlavie X Lite', tier: 'Fast', usage: 'Chat ringan, ringkasan, dan ide cepat', cost: '0.7x' },
  { id: 'dlavie-x-mini', name: 'Dlavie X Mini', tier: 'Default', usage: 'Tugas harian, konten, dan support', cost: '1x' },
  { id: 'dlavie-1-5', name: 'Dlavie 1.5', tier: 'Stable', usage: 'Planning, UI UX, dan strategi produk', cost: '1.4x' },
  { id: 'dlavie-1-5-preview', name: 'Dlavie 1.5 Preview', tier: 'Preview', usage: 'Eksperimen reasoning dan ide baru', cost: '1.8x' },
  { id: 'dlavie-x-3', name: 'Dlavie X 3', tier: 'Pro', usage: 'Coding, debugging, agent, arsitektur, dan vision', cost: '2.2x' },
  { id: 'dlavie-agent-pro', name: 'Dlavie Agent Pro', tier: 'Soon', usage: 'Workflow multi-step dan automation', cost: '3x' },
] as const;
const pricingCards = [
  { name: 'Free', monthly: 0, yearly: 0, badge: 'Explore', accent: 'from-slate-200/20 to-white/5', features: ['8 chat per hari', 'Dlavie X Lite dan X Mini', 'Resource standar', 'Tanpa Memory', 'Tanpa mode agent lanjutan'] },
  { name: 'Basic', monthly: 25000, yearly: 250000, badge: 'Starter', accent: 'from-blue-500/20 to-white/5', features: ['40 chat per hari', 'Upload file teks ringan', 'Gems standar', 'Context lebih panjang', 'Memory belum tersedia'] },
  { name: 'Core', monthly: 175000, yearly: 1750000, badge: 'Recommended', accent: 'from-[#dfff4f]/25 to-blue-500/10', features: ['300 chat per hari', 'Memory aktif', 'Thinking dan Agent mode', 'Dlavie 1.5 dan X 3', 'Build workspace dan vision'] },
  { name: 'Custom', monthly: 477000, yearly: 4777000, badge: 'Studio', accent: 'from-violet-500/25 to-cyan-400/10', features: ['1.200 chat per hari', 'Memory prioritas', 'Custom workflow', 'Context besar', 'Model routing premium'] },
];

let audioCtx: AudioContext | null = null;
function playFeedback(kind: 'click' | 'done' = 'click') {
  if (typeof window === 'undefined') return;
  try {
    navigator.vibrate?.(kind === 'click' ? 8 : 16);
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    audioCtx = audioCtx || new AudioCtor();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => undefined);
    const now = audioCtx.currentTime;
    const gain = audioCtx.createGain();
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(kind === 'done' ? 740 : 520, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch {}
}
function uid() { return Math.random().toString(36).slice(2); }
function formatNumber(value: number) { return Number(value || 0).toLocaleString('id-ID'); }
function formatRupiah(value: number) { return value === 0 ? 'Rp0' : `Rp${formatNumber(value)}`; }
function canReadTextFile(file: File) { return file.type.startsWith('text/') || ['application/json', 'application/javascript', 'application/xml', 'image/svg+xml'].includes(file.type) || /\.(md|txt|json|js|ts|tsx|jsx|css|html|xml|csv)$/i.test(file.name); }
function copyText(text: string) { navigator.clipboard?.writeText(text).catch(() => undefined); playFeedback('done'); }
function packPrice(pack: DlavieAiPack) { return `${formatNumber(pack.priceDBalance)} D Balance`; }

export default function AI() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [tab, setTab] = useState<Tab>('chat');
  const [intent, setIntent] = useState('');
  const [source, setSource] = useState('');
  const [profession, setProfession] = useState('');
  const [mode, setMode] = useState<Mode>('thinking');
  const [model, setModel] = useState<(typeof models)[number]>(models[1]);
  const [tools, setTools] = useState<string[]>([]);
  const [access, setAccess] = useState<Access | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [billing, setBilling] = useState<Billing>('month');
  const [purchaseBusy, setPurchaseBusy] = useState<DlavieAiPackId | null>(null);
  const packs = useMemo(() => Object.values(dlavieAiPacks), []);
  const activePlan = dlavieAiPlans[access?.plan || 'free'];
  const estimate = q.trim() ? estimateTextUnits(q) * (access?.plan === 'core' || access?.plan === 'custom' ? 2 : 1) : 0;

  async function getAccessToken() {
    const supabase = createSupabaseBrowserClient();
    return (await supabase.auth.getSession()).data.session?.access_token;
  }
  async function loadAccess() {
    const token = await getAccessToken();
    const res = await fetch('/api/ai/dlavie-subscription', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const data = await res.json();
    if (res.ok) setAccess(data);
  }
  useEffect(() => { loadAccess().catch(() => setNotice('Status Dlavie AI belum bisa dimuat.')); }, []);

  function toggleTool(tool: string) {
    playFeedback();
    setTools((current) => current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool]);
  }
  async function addFiles(files: FileList | null, kind: 'file' | 'image') {
    if (!files) return;
    const next = await Promise.all(Array.from(files).map(async (file) => {
      const item: Attachment = { id: uid(), name: file.name, size: file.size, kind };
      if (kind === 'image') {
        item.preview = URL.createObjectURL(file);
        item.inline = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }
      if (canReadTextFile(file) && file.size < 700000) item.text = (await file.text()).slice(0, 6000);
      return item;
    }));
    setAttachments((current) => [...current, ...next]);
    playFeedback('done');
  }
  async function ask() {
    const text = q.trim();
    if (!text || busy) return;
    const hasVision = attachments.some((item) => item.kind === 'image');
    setMessages((current) => [...current, { id: uid(), role: 'user', content: text, tools, vision: hasVision }]);
    setQ('');
    setBusy(true);
    setNotice('');
    playFeedback('done');
    const message = ['Dlavie AI OS', `Plan: ${activePlan.name}`, `Intent: ${intent || 'General'}`, `Source: ${source || 'Unknown'}`, `Profession: ${profession || 'Unknown'}`, `Mode: ${mode}`, `Selected model: ${model.name}`, `Tools: ${tools.join(', ') || 'none'}`, '', text].join('\n');
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/ai/persistent-chat', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ message, sessionId, mode, modelId: model.id, attachments }) });
      const data = await res.json().catch(() => ({}));
      if (data.sessionId) setSessionId(data.sessionId);
      if (!res.ok) { setNotice(data.error || 'Dlavie AI sedang bermasalah.'); return; }
      setMessages((current) => [...current, { id: uid(), role: 'assistant', content: data.reply || 'Tidak ada balasan.', model: data.modelName || model.name, tools, vision: Boolean(data.vision) }]);
      setAttachments([]);
      if (typeof data.chargedTokens === 'number') setNotice(`Dipakai ${formatNumber(data.chargedTokens)} AI Token. Sisa ${formatNumber(data.aiTokenBalance || 0)}.`);
      await loadAccess().catch(() => undefined);
    } catch {
      setNotice('Dlavie AI sedang bermasalah. Coba lagi sebentar.');
    } finally { setBusy(false); }
  }
  async function buyCredits(pack: DlavieAiPack) {
    if (purchaseBusy) return;
    if (!window.confirm(`Beli ${pack.badge}?\n\nBiaya: ${packPrice(pack)}`)) return;
    setPurchaseBusy(pack.id);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/ai/buy-credits', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ packId: pack.id }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Pembelian gagal.');
      setNotice(`Berhasil membeli ${data.pack?.badge || pack.badge}.`);
      await loadAccess();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Pembelian gagal.'); }
    finally { setPurchaseBusy(null); }
  }

  return <main onPointerDown={(event) => { if ((event.target as HTMLElement).closest('button,a,label,input,textarea')) playFeedback(); }} className="fixed inset-0 z-[999999] overflow-y-auto bg-[#08090d] text-white">
    {screen === 'welcome' && <Welcome onStart={() => setScreen('form')} onSkip={() => setScreen('app')} />}
    {screen === 'form' && <Onboarding intent={intent} source={source} profession={profession} setIntent={setIntent} setSource={setSource} setProfession={setProfession} onEnter={() => setScreen('app')} />}
    {screen === 'app' && <section className="min-h-screen"><TopBar tab={tab} setTab={setTab} model={model.name} tokenBalance={access?.aiTokenBalance || 0} /><div className="mx-auto max-w-6xl px-4 py-4"><MotionHero /><Status model={model.name} mode={mode} tools={tools} vision={attachments.some((item) => item.kind === 'image')} />{notice && <div className="mt-3 rounded-2xl border border-[#dfff4f]/25 bg-[#dfff4f]/10 p-3 text-sm font-bold text-[#f1ffc0]">{notice}</div>}{tab === 'chat' && <Chat messages={messages} busy={busy} mode={mode} setMode={setMode} q={q} setQ={setQ} ask={ask} attachments={attachments} addFiles={addFiles} tools={tools} toggleTool={toggleTool} estimate={estimate} model={model.name} editId={editId} setEditId={setEditId} setMessages={setMessages} />}{tab === 'playground' && <Playground selected={model.id} setModel={setModel} />}{tab === 'projects' && <Projects setTab={setTab} setQ={setQ} />}{tab === 'pricing' && <Pricing billing={billing} setBilling={setBilling} packs={packs} buyCredits={buyCredits} purchaseBusy={purchaseBusy} access={access} />}{tab === 'resources' && <Resources />}</div></section>}
  </main>;
}

function Welcome({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return <section className="relative min-h-screen overflow-hidden"><video className="absolute inset-0 h-full w-full object-cover opacity-90" src={VIDEO} autoPlay muted loop playsInline preload="auto" /><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(223,255,79,.18),transparent_35%),linear-gradient(180deg,rgba(5,6,9,.1),rgba(5,6,9,.95))]" /><div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 text-center"><div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[.3em] text-[#dfff4f]"><Sparkles className="h-4 w-4" />Dlavie AI OS</div><h1 className="mt-7 text-5xl font-black tracking-[-.08em] md:text-8xl">Bangun lebih cepat dengan AI yang rapi.</h1><p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-white/62">Workspace AI untuk chat, model, riset, agent, resource, dan analisis gambar.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={onStart} className="rounded-full bg-[#dfff4f] px-7 py-4 text-sm font-black text-slate-950">Mulai</button><button onClick={onSkip} className="rounded-full border border-white/12 bg-white/10 px-7 py-4 text-sm font-black">Lewati</button></div></div></section>;
}
function Onboarding(props: { intent: string; source: string; profession: string; setIntent: (v: string) => void; setSource: (v: string) => void; setProfession: (v: string) => void; onEnter: () => void }) {
  const ready = props.intent && props.source && props.profession;
  return <section className="min-h-screen px-5 py-12"><div className="mx-auto max-w-5xl"><p className="text-xs font-black uppercase tracking-[.28em] text-[#dfff4f]">Personalize</p><h2 className="mt-3 text-4xl font-black tracking-[-.06em] md:text-6xl">Atur workspace pertamamu.</h2><Slider title="Kamu menggunakan Dlavie AI untuk apa?" items={intents} value={props.intent} setValue={props.setIntent} /><Slider title="Dari mana anda mengetahui Dlavie AI?" items={sources} value={props.source} setValue={props.setSource} /><Slider title="Apa profesi mu sekarang?" items={professions} value={props.profession} setValue={props.setProfession} /><button disabled={!ready} onClick={props.onEnter} className="mt-8 rounded-full bg-[#dfff4f] px-7 py-4 text-sm font-black text-slate-950 disabled:opacity-40">Masuk ke chat</button></div></section>;
}
function Slider({ title, items, value, setValue }: { title: string; items: string[]; value: string; setValue: (v: string) => void }) {
  return <div className="mt-8"><h3 className="text-lg font-black">{title}</h3><div className="mt-4 flex gap-3 overflow-x-auto pb-4">{items.map((item) => <button key={item} onClick={() => setValue(item)} className={`min-w-[220px] rounded-[1.4rem] border p-5 text-left text-sm font-black ${value === item ? 'border-[#dfff4f]/60 bg-[#dfff4f]/10 text-white' : 'border-white/10 bg-white/[0.055] text-white/60'}`}><Check className="mb-4 h-5 w-5 text-[#dfff4f]" />{item}</button>)}</div></div>;
}
function TopBar({ tab, setTab, model, tokenBalance }: { tab: Tab; setTab: (tab: Tab) => void; model: string; tokenBalance: number }) {
  const tabs: Tab[] = ['chat', 'playground', 'projects', 'pricing', 'resources'];
  return <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f1016]/90 backdrop-blur-2xl"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3"><div><b>Dlavie AI</b><p className="text-xs font-bold text-white/38">{model}</p></div><nav className="flex gap-1 overflow-x-auto rounded-full bg-white/6 p-1">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-xs font-black capitalize ${tab === item ? 'bg-white text-slate-950' : 'text-white/55'}`}>{item}</button>)}</nav><p className="hidden text-xs font-bold text-white/45 md:block">{formatNumber(tokenBalance)} Token</p></div></header>;
}
function MotionHero() { return <div className="relative mb-4 h-32 overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.055] md:h-44"><video className="absolute inset-0 h-full w-full object-cover opacity-85" src={VIDEO} autoPlay muted loop playsInline preload="auto" /><div className="absolute inset-0 bg-gradient-to-r from-[#08090d]/85 via-[#08090d]/35 to-transparent" /><div className="relative z-10 flex h-full flex-col justify-center px-5"><p className="text-xs font-black uppercase tracking-[.25em] text-[#dfff4f]">Live Motion Banner</p><h2 className="mt-2 text-2xl font-black tracking-[-.04em] md:text-4xl">AI workspace aktif.</h2></div></div>; }
function Status({ model, mode, tools, vision }: { model: string; mode: Mode; tools: string[]; vision: boolean }) { return <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-white/55"><span className="rounded-full bg-white/8 px-3 py-2">Model: {model}</span><span className="rounded-full bg-white/8 px-3 py-2">Mode: {mode}</span>{vision && <span className="rounded-full border border-[#dfff4f]/25 bg-[#dfff4f]/10 px-3 py-2 text-[#eaff9e]">Vision ready</span>}{tools.map((tool) => <span key={tool} className="rounded-full border border-[#dfff4f]/25 bg-[#dfff4f]/10 px-3 py-2 text-[#eaff9e]">{tool} aktif</span>)}</div>; }

function Chat(props: { messages: ChatMessage[]; busy: boolean; mode: Mode; setMode: (m: Mode) => void; q: string; setQ: (v: string) => void; ask: () => void; attachments: Attachment[]; addFiles: (files: FileList | null, kind: 'file' | 'image') => void; tools: string[]; toggleTool: (tool: string) => void; estimate: number; model: string; editId: string | null; setEditId: (id: string | null) => void; setMessages: (messages: ChatMessage[]) => void }) {
  const [open, setOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  function saveEdit(messageId: string, content: string) { props.setMessages(props.messages.map((message) => message.id === messageId ? { ...message, content } : message)); props.setEditId(null); }
  return <div className={`rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 ${props.busy ? 'ring-2 ring-[#dfff4f]/25' : ''}`}><div className="min-h-[52vh] space-y-5 p-4 md:p-6">{!props.messages.length && <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center"><div className="grid h-16 w-16 place-items-center rounded-3xl border border-[#dfff4f]/25 bg-[#dfff4f]/10"><Bot className="h-8 w-8 text-[#dfff4f]" /></div><h2 className="mt-5 text-3xl font-black tracking-[-.05em]">Apa yang ingin kamu buat?</h2><p className="mt-3 text-sm font-semibold leading-6 text-white/45">Upload gambar, aktifkan tool, pilih model di Playground, lalu semua status terlihat di chat.</p></div>}{props.messages.map((message) => <MessageBubble key={message.id} message={message} editId={props.editId} setEditId={props.setEditId} saveEdit={saveEdit} />)}{props.busy && <Thinking mode={props.mode} tools={props.tools} />}</div><div className="relative border-t border-white/10 p-3">{open && <div className="absolute bottom-28 left-4 z-20 grid w-72 gap-2 rounded-3xl border border-white/10 bg-[#24252c] p-3 shadow-2xl"><label className="rounded-2xl bg-white/8 p-3 text-sm font-bold text-white/75"><Paperclip className="mr-2 inline h-4 w-4" />Kirim file<input type="file" multiple className="hidden" onChange={(event) => props.addFiles(event.target.files, 'file')} /></label><label className="rounded-2xl bg-white/8 p-3 text-sm font-bold text-white/75"><ImageIcon className="mr-2 inline h-4 w-4" />Kirim gambar<input type="file" accept="image/*" multiple className="hidden" onChange={(event) => props.addFiles(event.target.files, 'image')} /></label>{['web', 'agent', 'research'].map((tool) => <button key={tool} onClick={() => props.toggleTool(tool)} className={`rounded-2xl p-3 text-left text-sm font-bold ${props.tools.includes(tool) ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/8 text-white/75'}`}>{tool === 'web' ? <Globe2 className="mr-2 inline h-4 w-4" /> : tool === 'agent' ? <Bot className="mr-2 inline h-4 w-4" /> : <Search className="mr-2 inline h-4 w-4" />}{tool}</button>)}</div>}{modeOpen && <div className="absolute bottom-28 left-16 z-20 grid w-[min(92vw,520px)] grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-[#24252c] p-3 shadow-2xl">{(['instant', 'thinking', 'agent', 'research'] as Mode[]).map((item) => <button key={item} onClick={() => { props.setMode(item); setModeOpen(false); }} className={`rounded-2xl border p-3 text-left text-sm font-black ${props.mode === item ? 'border-[#dfff4f]/50 bg-[#dfff4f]/10' : 'border-white/10 bg-white/6'}`}>{item}</button>)}</div>}{props.attachments.length > 0 && <div className="mb-2 flex flex-wrap gap-2">{props.attachments.map((attachment) => <span key={attachment.id} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/55">{attachment.preview ? <img src={attachment.preview} alt="" className="h-6 w-6 rounded-full object-cover" /> : <FileText className="h-4 w-4" />}{attachment.name}{attachment.inline ? ' - vision ready' : attachment.text ? ' - text loaded' : ''}</span>)}</div>}<textarea value={props.q} onChange={(event) => props.setQ(event.target.value)} className="min-h-28 w-full resize-none rounded-3xl border border-white/10 bg-[#22232a] p-4 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-[#dfff4f]/20" placeholder={`Tanya dengan ${props.model}...`} /><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><button onClick={() => setOpen(!open)} className="rounded-2xl bg-white/10 px-4 py-3"><Layers3 className="h-4 w-4" /></button><button onClick={() => setModeOpen(!modeOpen)} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black">{props.mode}</button><span className="text-xs font-bold text-white/35">{formatNumber(props.estimate)} token awal</span></div><button onClick={props.ask} disabled={props.busy || !props.q.trim()} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black disabled:opacity-40"><Send className="mr-2 inline h-4 w-4" />Kirim</button></div></div></div>;
}
function Thinking({ mode, tools }: { mode: Mode; tools: string[] }) { const steps = mode === 'research' ? ['Menyiapkan ruang riset', 'Membaca konteks dan tool web', 'Menyusun analisis', 'Membangun jawaban final'] : mode === 'agent' ? ['Membuat rencana', 'Memecah tugas', 'Menyiapkan aksi', 'Menulis hasil'] : ['Menganalisis konteks', 'Mencari pola penting', 'Menulis jawaban']; return <div className="rounded-3xl border border-[#dfff4f]/20 bg-[#dfff4f]/10 p-4 shadow-[0_0_70px_rgba(223,255,79,.12)]"><div className="mb-3 flex items-center gap-2 text-sm font-black text-[#eaff9e]"><Activity className="h-4 w-4 animate-pulse" />Dlavie AI sedang bekerja</div><div className="space-y-2">{steps.map((step) => <div key={step} className="flex items-center gap-2 text-sm text-white/58"><span className="h-2 w-2 animate-pulse rounded-full bg-[#dfff4f]" />{step}</div>)}</div>{tools.length > 0 && <p className="mt-3 text-xs font-bold text-white/38">Tool aktif: {tools.join(', ')}</p>}</div>; }
function MessageBubble({ message, editId, setEditId, saveEdit }: { message: ChatMessage; editId: string | null; setEditId: (id: string | null) => void; saveEdit: (id: string, content: string) => void }) { const [draft, setDraft] = useState(message.content); const isUser = message.role === 'user'; return <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[92%] rounded-[1.5rem] px-4 py-3 md:max-w-[78%] ${isUser ? 'bg-[#19304d] text-blue-50' : 'bg-white text-slate-800'}`}>{isUser && editId === message.id ? <div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-24 w-full rounded-xl bg-white/10 p-3 outline-none" /><button onClick={() => saveEdit(message.id, draft)} className="mt-2 rounded-full bg-[#dfff4f] px-4 py-2 text-xs font-black text-slate-950">Simpan</button></div> : <RichText text={message.content} />}{message.tools?.length ? <p className={`mt-3 text-xs font-bold ${isUser ? 'text-blue-100/65' : 'text-slate-400'}`}>Tools: {message.tools.join(', ')}</p> : null}{message.vision && <p className={`mt-2 text-xs font-bold ${isUser ? 'text-blue-100/65' : 'text-slate-400'}`}>Vision aktif</p>}<div className={`mt-3 flex gap-2 ${isUser ? 'text-blue-100/65' : 'text-slate-500'}`}><button onClick={() => copyText(message.content)} className="rounded-full border border-current/20 px-3 py-1 text-xs font-black"><Copy className="mr-1 inline h-3 w-3" />Copy</button>{isUser && <button onClick={() => { setDraft(message.content); setEditId(message.id); }} className="rounded-full border border-current/20 px-3 py-1 text-xs font-black"><Pencil className="mr-1 inline h-3 w-3" />Edit</button>}</div>{message.model && !isUser && <p className="mt-2 text-[11px] font-bold text-slate-400">{message.model}</p>}</div></div>; }
function RichText({ text }: { text: string }) { const parts: ReactNode[] = []; const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g; let last = 0; let match: RegExpExecArray | null; while ((match = regex.exec(text))) { if (match.index > last) parts.push(<p key={last} className="whitespace-pre-wrap leading-7">{text.slice(last, match.index)}</p>); parts.push(<CodeBlock key={match.index} lang={match[1] || 'code'} code={match[2]} />); last = regex.lastIndex; } if (last < text.length) parts.push(<p key={last} className="whitespace-pre-wrap leading-7">{text.slice(last)}</p>); return <>{parts}</>; }
function CodeBlock({ lang, code }: { lang: string; code: string }) { return <div className="my-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white"><div className="flex items-center justify-between bg-white/8 px-4 py-2 text-xs font-black text-white/60"><span><Code2 className="mr-2 inline h-4 w-4" />{lang}</span><button onClick={() => copyText(code)} className="rounded-full bg-white/10 px-3 py-1">Copy</button></div><pre className="overflow-x-auto p-4 text-sm leading-6"><code>{code}</code></pre></div>; }
function Playground({ selected, setModel }: { selected: string; setModel: (model: (typeof models)[number]) => void }) { return <Panel title="Playground" subtitle="Pilih model. Model aktif tampil di navbar, status chat, dan dikirim ke backend."><div className="flex gap-4 overflow-x-auto pb-4">{models.map((item) => <button key={item.id} onClick={() => setModel(item)} className={`min-w-[290px] rounded-3xl border p-5 text-left ${selected === item.id ? 'border-[#dfff4f]/60 bg-[#dfff4f]/10' : 'border-white/10 bg-white/[0.055]'}`}><p className="text-xs font-black uppercase tracking-[.22em] text-[#dfff4f]">{item.tier}</p><h3 className="mt-3 text-2xl font-black">{item.name}</h3><p className="mt-2 text-sm text-white/50">{item.usage}</p><p className="mt-4 text-xs font-black text-white/40">Usage cost {item.cost}</p></button>)}</div></Panel>; }
function Projects({ setTab, setQ }: { setTab: (tab: Tab) => void; setQ: (q: string) => void }) { const items = ['WhatsApp Agent OS', 'Dlavie AI Console', 'Commerce Landing Lab']; return <Panel title="My Project" subtitle="Project cepat untuk lanjut kerja."><div className="grid gap-3 md:grid-cols-3">{items.map((item) => <button key={item} onClick={() => { setTab('chat'); setQ(`Lanjutkan project ${item}`); }} className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 text-left"><MessageSquare className="h-5 w-5 text-[#dfff4f]" /><h3 className="mt-4 font-black">{item}</h3><p className="mt-2 text-sm text-white/45">Klik untuk lanjutkan di chat.</p></button>)}</div></Panel>; }
function Pricing({ billing, setBilling, packs, buyCredits, purchaseBusy, access }: { billing: Billing; setBilling: (b: Billing) => void; packs: DlavieAiPack[]; buyCredits: (pack: DlavieAiPack) => void; purchaseBusy: DlavieAiPackId | null; access: Access | null }) { return <Panel title="Pricing" subtitle="Geser kartu ke kanan atau kiri."><div className="mb-5 w-fit rounded-full border border-white/10 bg-white/8 p-1"><button onClick={() => setBilling('month')} className={`rounded-full px-4 py-2 text-xs font-black ${billing === 'month' ? 'bg-white text-slate-950' : 'text-white/55'}`}>1 Month</button><button onClick={() => setBilling('year')} className={`rounded-full px-4 py-2 text-xs font-black ${billing === 'year' ? 'bg-[#dfff4f] text-slate-950' : 'text-white/55'}`}>1 Year</button></div><div className="flex gap-4 overflow-x-auto pb-5">{pricingCards.map((card) => { const price = billing === 'month' ? card.monthly : card.yearly; return <article key={card.name} className={`min-w-[82%] rounded-[2rem] border border-white/10 bg-gradient-to-br ${card.accent} p-6 sm:min-w-[390px]`}><p className="text-xs font-black uppercase tracking-[.22em] text-[#dfff4f]">{card.badge}</p><h3 className="mt-3 text-3xl font-black">{card.name}</h3><p className="mt-4 text-4xl font-black">{formatRupiah(price)}</p><ul className="mt-6 space-y-3 text-sm font-semibold text-white/65">{card.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="h-4 w-4 text-[#dfff4f]" />{feature}</li>)}</ul></article>; })}</div><h3 className="mt-4 text-xl font-black">AI Token Store</h3><div className="mt-3 grid gap-2 md:grid-cols-3">{packs.map((pack) => <button key={pack.id} onClick={() => buyCredits(pack)} disabled={purchaseBusy !== null || (access?.dBalance || 0) < pack.priceDBalance} className="rounded-2xl bg-white/8 p-4 text-left text-sm font-black disabled:opacity-40">{pack.badge}<span className="block pt-2 text-[#dfff4f]">{packPrice(pack)}</span></button>)}</div></Panel>; }
function Resources() { function download() { const rows = ['# Dlavie AI Resource Kit', '']; for (let i = 1; i <= 180; i += 1) rows.push(`## Block ${i}`, '- Goal planner', '- Prompt structure', '- Build checklist', ''); const blob = new Blob([rows.join('\n')], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'dlavie-ai-resource-kit.md'; anchor.click(); URL.revokeObjectURL(url); } return <Panel title="Resources" subtitle="Download file resource yang benar-benar dibuat."><button onClick={download} className="rounded-full bg-[#dfff4f] px-6 py-4 text-sm font-black text-slate-950"><FileText className="mr-2 inline h-4 w-4" />Download Resource Kit</button></Panel>; }
function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5"><p className="text-xs font-black uppercase tracking-[.25em] text-[#dfff4f]">Dlavie AI</p><h2 className="mt-2 text-4xl font-black tracking-[-.06em]">{title}</h2><p className="mt-3 text-sm font-semibold text-white/48">{subtitle}</p><div className="mt-6">{children}</div></section>; }
