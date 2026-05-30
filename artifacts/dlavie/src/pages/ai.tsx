import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  Brain,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  Globe2,
  Image as ImageIcon,
  Layers3,
  MessageSquare,
  Paperclip,
  Pencil,
  Search,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import gsap from 'gsap';
import { dlavieAiPacks, estimateTextUnits, type DlavieAiPack, type DlavieAiPackId } from '@/lib/dlavie-ai-credits';
import { dlavieAiPlans, type DlavieAiPlan } from '@/lib/dlavie-ai-plans';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

type Screen = 'welcome' | 'form' | 'app';
type Tab = 'chat' | 'playground' | 'projects' | 'pricing' | 'resources';
type Mode = 'instant' | 'thinking' | 'agent' | 'research';
type Billing = 'month' | 'year';
type Msg = { id: string; role: 'user' | 'assistant'; content: string; model?: string; tools?: string[]; vision?: boolean };
type Attachment = { id: string; name: string; kind: 'file' | 'image'; size: number; text?: string; inline?: string; preview?: string };
type Access = { authenticated: boolean; plan: DlavieAiPlan; name: string; dailyQuota: number; dailyUsed: number; remaining: number; dBalance: number; aiTokenBalance: number };

const VIDEO = 'https://image-link.edgeone.app/1779988010622-t0qa9o.mp4';
const intents = ['Website dan aplikasi', 'Konten dan brand', 'Analisis bisnis', 'Agent otomatis', 'Debugging kode', 'Belajar dan riset'];
const sources = ['TikTok atau Reels', 'Instagram', 'Teman atau komunitas', 'Google Search', 'YouTube', 'Website DLAVIE'];
const professions = ['Pelajar atau mahasiswa', 'Founder atau owner', 'Web developer', 'Content creator', 'Designer', 'Marketer', 'Freelancer', 'Lainnya'];
const promptIdeas = ['Rate foto yang saya upload secara detail', 'Buat landing page produk digital DLAVIE', 'Audit arsitektur website saya'];

const models = [
  { id: 'dlavie-x-lite', name: 'Dlavie X Lite', tier: 'Fast', usage: 'Ringkasan, ide cepat, chat ringan', cost: '0.7x' },
  { id: 'dlavie-x-mini', name: 'Dlavie X Mini', tier: 'Default', usage: 'Konten, support, tugas harian', cost: '1x' },
  { id: 'dlavie-1-5', name: 'Dlavie 1.5', tier: 'Stable', usage: 'Planning, UI UX, strategi produk', cost: '1.4x' },
  { id: 'dlavie-1-5-preview', name: 'Dlavie 1.5 Preview', tier: 'Preview', usage: 'Eksperimen reasoning dan ide baru', cost: '1.8x' },
  { id: 'dlavie-x-3', name: 'Dlavie X 3', tier: 'Pro', usage: 'Coding, debugging, agent, arsitektur, vision', cost: '2.2x' },
  { id: 'dlavie-agent-pro', name: 'Dlavie Agent Pro', tier: 'Soon', usage: 'Workflow multi-step dan automation', cost: '3x' },
];

const modes: { id: Mode; title: string; desc: string; Icon: typeof Zap }[] = [
  { id: 'instant', title: 'Instant', desc: 'Jawaban cepat dan ringkas.', Icon: Zap },
  { id: 'thinking', title: 'Thinking', desc: 'Menampilkan proses analisis.', Icon: Brain },
  { id: 'agent', title: 'Agent', desc: 'Membuat rencana dan langkah kerja.', Icon: Bot },
  { id: 'research', title: 'Deep Research', desc: 'Riset lebih panjang dengan status web.', Icon: Search },
];

const pricing = [
  { name: 'Free', monthly: 0, yearly: 0, badge: 'Explore', accent: 'from-slate-200/20 to-white/5', features: ['8 chat per hari', 'Dlavie X Lite dan X Mini', 'Resource standar', 'Tanpa Memory', 'Tanpa mode agent lanjutan'] },
  { name: 'Basic', monthly: 25000, yearly: 250000, badge: 'Starter', accent: 'from-blue-500/20 to-white/5', features: ['40 chat per hari', 'Upload file teks ringan', 'Gems standar', 'Context lebih panjang', 'Memory belum tersedia'] },
  { name: 'Core', monthly: 175000, yearly: 1750000, badge: 'Recommended', accent: 'from-[#dfff4f]/25 to-blue-500/10', features: ['300 chat per hari', 'Memory aktif', 'Thinking dan Agent mode', 'Dlavie 1.5 dan X 3', 'Build workspace dan vision'] },
  { name: 'Custom', monthly: 477000, yearly: 4777000, badge: 'Studio', accent: 'from-violet-500/25 to-cyan-400/10', features: ['1.200 chat per hari', 'Memory prioritas', 'Custom workflow', 'Context besar', 'Model routing premium'] },
];

let audioCtx: AudioContext | null = null;

function tone(kind: 'click' | 'enter' | 'toggle' | 'done' = 'click') {
  if (typeof window === 'undefined') return;

  try {
    navigator.vibrate?.(kind === 'click' ? 8 : kind === 'toggle' ? 12 : 18);

    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    audioCtx = audioCtx || new Ctor();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});

    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const freqs: Record<typeof kind, number> = { click: 660, enter: 880, toggle: 540, done: 1100 };
    osc.frequency.value = freqs[kind];
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // ignore audio errors
  }
}

export default function AiPage() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [tab, setTab] = useState<Tab>('chat');
  const [mode, setMode] = useState<Mode>('instant');
  const [billing, setBilling] = useState<Billing>('month');
  const [modelId, setModelId] = useState('dlavie-x-mini');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<Access | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedModel = useMemo(() => models.find((m) => m.id === modelId) ?? models[1], [modelId]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      fetch('/api/ai/access', { headers: { Authorization: `Bearer ${data.session.access_token}` } })
        .then((r) => r.json())
        .then((json) => setAccess(json))
        .catch(() => null);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' });
    }
  }, [screen]);

  async function sendMessage() {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    tone('enter');

    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: text, vision: attachments.some((a) => a.kind === 'image') };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? '';

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, model: modelId, mode, attachments }),
      });
      const json = await res.json().catch(() => ({}));
      const reply = json.reply ?? json.error ?? 'Maaf, respons tidak tersedia saat ini.';
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply, model: modelId }]);
      tone('done');
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Terjadi kesalahan jaringan. Coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  }

  const rupiah = (v: number) => `Rp ${v.toLocaleString('id-ID')}`;

  if (screen === 'welcome') {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#09090f] text-white">
        <video src={VIDEO} autoPlay muted loop playsInline className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#09090f]/60 to-[#09090f]" />
        <div ref={containerRef} className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-5 py-20 text-center">
          <span className="rounded-full border border-[#dfff4f]/30 bg-[#dfff4f]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#dfff4f]">DLAVIE AI STUDIO</span>
          <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">Intelligence.<br />Redefined.</h1>
          <p className="max-w-lg text-lg font-semibold leading-7 text-white/60">Platform AI generatif DLAVIE untuk chat, coding, analisis, dan agent otomatis berbasis token D-Balance.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => { tone('click'); setScreen('form'); }} className="rounded-full bg-[#dfff4f] px-8 py-4 font-black text-slate-950 shadow-[0_16px_45px_rgba(223,255,79,.3)] transition hover:-translate-y-1">Mulai Gratis</button>
            <button onClick={() => { tone('click'); setScreen('app'); setTab('pricing'); }} className="rounded-full border border-white/15 bg-white/5 px-8 py-4 font-black text-white transition hover:-translate-y-1">Lihat Paket</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {models.slice(0, 4).map((m) => (
              <div key={m.id} className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#dfff4f]">{m.tier}</p>
                <p className="mt-1 font-black">{m.name}</p>
                <p className="mt-1 text-xs text-white/45">{m.usage}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (screen === 'form') {
    return (
      <main className="min-h-screen bg-[#09090f] p-5 text-white">
        <div ref={containerRef} className="mx-auto max-w-xl py-16">
          <button onClick={() => setScreen('welcome')} className="mb-6 text-sm font-black text-white/40 hover:text-white">← Kembali</button>
          <h2 className="text-3xl font-black">Siapkan workspace AI kamu.</h2>
          <p className="mt-2 text-sm text-white/50">Beberapa pertanyaan singkat untuk personalisasi pengalaman.</p>
          <div className="mt-8 grid gap-6">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-white/40">Tujuan utama?</p>
              <div className="grid grid-cols-2 gap-2">{intents.map((i) => <button key={i} onClick={() => tone('toggle')} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3 text-sm font-bold hover:border-[#dfff4f]/50 hover:text-[#dfff4f]">{i}</button>)}</div>
            </div>
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-white/40">Profesi kamu?</p>
              <div className="grid grid-cols-2 gap-2">{professions.map((p) => <button key={p} onClick={() => tone('toggle')} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3 text-sm font-bold hover:border-[#dfff4f]/50 hover:text-[#dfff4f]">{p}</button>)}</div>
            </div>
            <button onClick={() => { tone('enter'); setScreen('app'); }} className="rounded-full bg-[#dfff4f] py-4 font-black text-slate-950 shadow-[0_14px_35px_rgba(223,255,79,.25)] transition hover:-translate-y-1">Mulai Studio AI →</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <nav className="sticky top-0 z-50 flex items-center gap-3 border-b border-white/8 bg-[#09090f]/90 px-4 py-3 backdrop-blur">
        <span className="mr-auto text-sm font-black tracking-widest text-[#dfff4f]">DLAVIE AI</span>
        {(['chat', 'playground', 'projects', 'pricing', 'resources'] as Tab[]).map((t) => (
          <button key={t} onClick={() => { tone('toggle'); setTab(t); }} className={`rounded-full px-3 py-1.5 text-xs font-black capitalize transition ${tab === t ? 'bg-[#dfff4f] text-slate-950' : 'text-white/45 hover:text-white'}`}>{t}</button>
        ))}
        <button onClick={() => setScreen('welcome')} className="ml-2 text-xs text-white/25 hover:text-white">✕</button>
      </nav>

      <div ref={containerRef} className="mx-auto max-w-5xl p-4">
        {tab === 'chat' && (
          <div className="flex h-[calc(100vh-8rem)] flex-col">
            <div className="flex flex-wrap items-center gap-2 pb-3">
              <select value={modelId} onChange={(e) => setModelId(e.target.value)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-white outline-none">
                {models.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.tier})</option>)}
              </select>
              {modes.map((m) => (
                <button key={m.id} onClick={() => { tone('toggle'); setMode(m.id); }} className={`rounded-full px-3 py-1.5 text-xs font-black transition ${mode === m.id ? 'bg-white/15 text-white' : 'text-white/35 hover:text-white'}`}>{m.title}</button>
              ))}
              {access && <span className="ml-auto text-xs text-white/35">{access.remaining}/{access.dailyQuota} chat hari ini</span>}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-[#dfff4f]/15"><Sparkles className="h-9 w-9 text-[#dfff4f]" /></div>
                  <h3 className="text-2xl font-black">Apa yang ingin kamu buat?</h3>
                  <div className="grid gap-2">{promptIdeas.map((idea) => <button key={idea} onClick={() => { setInput(idea); tone('click'); }} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold hover:border-[#dfff4f]/40">{idea}</button>)}</div>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${msg.role === 'user' ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/10 text-white'}`}>{msg.role === 'user' ? 'U' : 'AI'}</div>
                  <div className={`max-w-[80%] rounded-[1.4rem] p-4 text-sm font-semibold leading-6 ${msg.role === 'user' ? 'bg-[#dfff4f] text-slate-950' : 'bg-white/8 text-white'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.model && <p className="mt-2 text-[10px] opacity-40">{msg.model}</p>}
                  </div>
                </div>
              ))}
              {loading && <div className="flex gap-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs font-black text-white">AI</div><div className="rounded-[1.4rem] bg-white/8 px-4 py-3 text-sm"><span className="animate-pulse font-black text-[#dfff4f]">···</span></div></div>}
              <div ref={bottomRef} />
            </div>

            <div className="mt-3 rounded-[1.8rem] border border-white/10 bg-white/5 p-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                placeholder="Tanya Dlavie AI..."
                rows={2}
                className="w-full resize-none bg-transparent text-sm font-semibold leading-6 text-white outline-none placeholder:text-white/25"
              />
              <div className="flex items-center justify-between">
                <button onClick={() => fileRef.current?.click()} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"><Paperclip className="h-4 w-4 text-white/40" /></button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*,.txt,.pdf" />
                <button onClick={() => { void sendMessage(); }} disabled={loading} className="rounded-full bg-[#dfff4f] px-4 py-2 text-xs font-black text-slate-950 disabled:opacity-40"><Send className="inline h-3 w-3 mr-1" />Send</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="py-8">
            <h2 className="text-3xl font-black">Pilih Paket AI</h2>
            <div className="mt-3 flex gap-2">
              {(['month', 'year'] as Billing[]).map((b) => <button key={b} onClick={() => setBilling(b)} className={`rounded-full px-4 py-2 text-xs font-black capitalize transition ${billing === b ? 'bg-[#dfff4f] text-slate-950' : 'border border-white/10 text-white/50'}`}>{b === 'month' ? 'Bulanan' : 'Tahunan (hemat 20%)'}</button>)}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pricing.map((plan) => (
                <div key={plan.name} className={`rounded-[2rem] bg-gradient-to-b ${plan.accent} border border-white/8 p-5`}>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">{plan.badge}</span>
                  <p className="mt-3 text-2xl font-black">{plan.name}</p>
                  <p className="mt-1 text-3xl font-black text-[#dfff4f]">{billing === 'month' ? rupiah(plan.monthly) : rupiah(plan.yearly)}<span className="text-sm text-white/40">/{billing === 'month' ? 'bln' : 'thn'}</span></p>
                  <ul className="mt-4 space-y-2">{plan.features.map((f) => <li key={f} className="flex gap-2 text-xs font-semibold text-white/60"><Check className="mt-0.5 h-3 w-3 shrink-0 text-[#dfff4f]" />{f}</li>)}</ul>
                  <button className="mt-5 w-full rounded-full bg-white/10 py-3 text-xs font-black hover:bg-[#dfff4f] hover:text-slate-950 transition">Pilih {plan.name}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === 'playground' || tab === 'projects' || tab === 'resources') && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-black capitalize">{tab}</p>
              <p className="mt-2 text-white/40">Segera hadir.</p>
              <button onClick={() => setTab('chat')} className="mt-4 rounded-full bg-[#dfff4f] px-6 py-3 text-sm font-black text-slate-950">Kembali ke Chat</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
