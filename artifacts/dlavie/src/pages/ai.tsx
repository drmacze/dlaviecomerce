import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Toaster, toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import confetti from "canvas-confetti";
import {
  Archive,
  Bot,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Copy,
  Download,
  Edit3,
  Eraser,
  FileText,
  Gem,
  History,
  LayoutGrid,
  Loader2,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  Square,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  WandSparkles,
  WifiOff,
  Zap,
} from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserEnv } from "@/lib/supabase-client";
import { dlavieAiPlans, type DlavieAiPlan } from "@/lib/dlavie-ai-plans";
import { WebGLAmbientAura } from "@/components/ai/WebGLAmbientAura";
import { useAutoTextarea } from "@/hooks/use-auto-textarea";
import { useDlavieRateLimit } from "@/hooks/use-dlavie-rate-limit";
import { runDlavieAi } from "@/services/ai-orchestrator";
import { useDlavieAiStore } from "@/store/dlavie-ai-store";
import {
  createChatTitle,
  estimateTokens,
  formatIdr,
  formatStickyDate,
  safePrompt,
} from "@/utils/dlavie-ai-format";

type Screen = "onboarding" | "workspace";
type Tier = DlavieAiPlan | "pro" | "max";
type ChatRole = "user" | "assistant";
type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  streaming?: boolean;
  trace?: string[];
  modelName?: string;
  engine?: string;
  feedback?: "up" | "down";
};
type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
};
type Onboarding = {
  name: string;
  purpose: string;
  profession: string;
  source: string;
};
type ModelOption = {
  id: string;
  label: string;
  tier: Tier;
  desc: string;
  price: string;
};

const modelOptions: ModelOption[] = [
  {
    id: "dlavie-x-lite",
    label: "Dlavie Core-Lite",
    tier: "free",
    desc: "Free hybrid: WebLLM cache + cloud fallback aman.",
    price: "Rp0",
  },
  {
    id: "dlavie-x-3",
    label: "Dlavie Ultra-Vision",
    tier: "core",
    desc: "Analitik cepat, vision, code audit, dan Gemini route.",
    price: "Rp149.000",
  },
  {
    id: "dlavie-agent-pro",
    label: "Dlavie Thought-Pro Deep",
    tier: "custom",
    desc: "Reasoning lebih dalam, agent workflow, dan jalur Max.",
    price: "Rp299.000",
  },
];

const quickPrompts = [
  "Buat strategi konten premium untuk brand DLAVIE selama 7 hari",
  "Audit UX checkout mobile dan beri prioritas perbaikan",
  "Buatkan struktur database Supabase untuk marketplace kecil",
  "Tulis landing page elegan untuk produk digital AI",
];

const comparisonRows = [
  ["Kuota", "10 chat/jam", "300 chat/hari", "1.200 chat/hari"],
  ["Model", "Core-Lite", "Ultra-Vision", "Thought-Pro Deep"],
  ["Tools", "Prompt + chat", "Web, file, vision", "Agent, memory, workflow"],
  ["Riwayat", "30 hari", "Prioritas", "Prioritas + export"],
];

const uid = () => Math.random().toString(36).slice(2);
const tierRank = (tier: Tier) => ["free", "basic", "core", "pro", "custom", "max"].indexOf(tier);
const canUseModel = (required: Tier, current: Tier) => tierRank(current) >= tierRank(required);

function haptic(pattern: number | number[] = 12) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore unsupported devices
  }
}

function useSystemTheme() {
  // DLAVIE AI now keeps a premium dark glass shell even on devices set to light mode.
  // The previous auto-light version made the workspace look washed out and less professional.
  return true;
}

async function getAccessToken() {
  if (!hasSupabaseBrowserEnv()) return undefined;
  const supabase = createSupabaseBrowserClient();
  return (await supabase.auth.getSession()).data.session?.access_token;
}

function readLocalSessions(): ChatSession[] {
  try {
    return JSON.parse(localStorage.getItem("dlavie-ai-sessions-v2") || "[]");
  } catch {
    return [];
  }
}

function writeLocalSessions(sessions: ChatSession[]) {
  localStorage.setItem("dlavie-ai-sessions-v2", JSON.stringify(sessions.slice(0, 24)));
}

export default function AI() {
  const dark = useSystemTheme();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const syncTimerRef = useRef<number | null>(null);
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sidebarSize, setSidebarSize] = useState(28);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState(uid());
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [tier, setTier] = useState<Tier>("free");
  const [thinking, setThinking] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(true);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [onboarding, setOnboarding] = useState<Onboarding>({
    name: "",
    purpose: "",
    profession: "",
    source: "",
  });
  const { draft, setDraft, sidebarCollapsed, setSidebarCollapsed, setActiveSessionId } = useDlavieAiStore();
  const rate = useDlavieRateLimit(0, tier);
  useAutoTextarea(textareaRef, draft, 190);

  const currentSession = useMemo(
    () => sessions.find((item) => item.id === sessionId),
    [sessions, sessionId],
  );
  const tokenEstimate = estimateTokens(draft);
  const visibleContext = messages.slice(-5).map((message) => ({ role: message.role, content: message.content }));

  useEffect(() => {
    document.documentElement.dataset.dlavieAiTheme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    const apply = () => setOffline(!navigator.onLine);
    apply();
    window.addEventListener("online", apply);
    window.addEventListener("offline", apply);
    return () => {
      window.removeEventListener("online", apply);
      window.removeEventListener("offline", apply);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const local = readLocalSessions();
      setSessions(local);
      if (local[0]) {
        setSessionId(local[0].id);
        setMessages(local[0].messages);
        setScreen("workspace");
      }
      setLoadingHistory(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setActiveSessionId(sessionId);
  }, [sessionId, setActiveSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (!messages.length) return;
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      const nextSession: ChatSession = {
        id: sessionId,
        title: currentSession?.title || createChatTitle(messages[0]?.content || draft),
        createdAt: currentSession?.createdAt || new Date().toISOString(),
        messages,
      };
      const next = [nextSession, ...sessions.filter((item) => item.id !== sessionId)];
      setSessions(next);
      writeLocalSessions(next);
    }, 5000);
    return () => {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    };
  }, [messages, sessionId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && target?.tagName !== "TEXTAREA" && target?.tagName !== "INPUT") {
        event.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey as unknown as EventListener);
    return () => window.removeEventListener("keydown", onKey as unknown as EventListener);
  }, []);

  function persistImmediate(nextMessages: ChatMessage[], titleSeed?: string) {
    const nextSession: ChatSession = {
      id: sessionId,
      title: currentSession?.title || createChatTitle(titleSeed || nextMessages[0]?.content || "Percakapan Baru"),
      createdAt: currentSession?.createdAt || new Date().toISOString(),
      messages: nextMessages,
    };
    const next = [nextSession, ...sessions.filter((item) => item.id !== sessionId)];
    setSessions(next);
    writeLocalSessions(next);
  }

  async function saveOnboarding() {
    if (!onboarding.purpose || !onboarding.profession || !onboarding.source) {
      toast.error("Lengkapi tujuan, profesi, dan sumber dulu.");
      return;
    }
    haptic([10, 24, 10]);
    if (hasSupabaseBrowserEnv()) {
      try {
        const supabase = createSupabaseBrowserClient();
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          await supabase.from("users_profile").upsert({
            id: user.id,
            purpose: onboarding.purpose,
            profession: onboarding.profession,
            source: onboarding.source,
            has_onboarded: true,
            tier: "free",
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        toast("Onboarding tersimpan lokal. Jalankan supabase_setup.sql untuk sinkron DB.");
      }
    }
    confetti({ particleCount: 72, spread: 62, origin: { y: 0.72 } });
    toast.success("Profil Dlavie AI siap.");
    setScreen("workspace");
  }

  function startNewChat(seed = "") {
    const id = uid();
    setSessionId(id);
    setMessages([]);
    setDraft(seed);
    setScreen("workspace");
    haptic();
  }

  function openSession(session: ChatSession) {
    setSessionId(session.id);
    setMessages(session.messages);
    setScreen("workspace");
    if (window.innerWidth < 900) setSidebarCollapsed(true);
  }

  function deleteSession(id: string) {
    const next = sessions.filter((item) => item.id !== id);
    setSessions(next);
    writeLocalSessions(next);
    if (id === sessionId) startNewChat();
    toast.success("Percakapan dihapus.");
  }

  function clearAll() {
    if (!window.confirm("Hapus semua percakapan lokal Dlavie AI?")) return;
    setSessions([]);
    setMessages([]);
    writeLocalSessions([]);
    toast.success("Riwayat dibersihkan.");
  }

  function exportChat() {
    const text = messages.map((m) => `${m.role.toUpperCase()} (${m.createdAt})\n${m.content}`).join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentSession?.title || "dlavie-ai-chat"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copy(value: string) {
    navigator.clipboard?.writeText(value);
    toast.success("Disalin ke clipboard.");
    haptic(8);
  }

  function stopGeneration() {
    abortRef.current?.abort();
    setThinking(false);
    toast("Generasi dihentikan.");
  }

  async function sendPrompt(text = draft, regenerate = false) {
    const prompt = safePrompt(text);
    if (!prompt) return;
    if (offline) {
      toast.error("Sedang offline. Dlavie AI akan mencoba lagi saat koneksi kembali.");
      return;
    }
    if (rate.blocked) {
      setPricingOpen(true);
      toast.error("Batas 10 pesan/jam habis. Tunggu atau upgrade ke Dlavie Pro/Max.");
      return;
    }
    if (!canUseModel(selectedModel.tier, tier)) {
      setPricingOpen(true);
      toast.error(`${selectedModel.label} membutuhkan plan lebih tinggi.`);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const userMessage: ChatMessage = {
      id: editingId || uid(),
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    };
    const optimistic = regenerate ? messages.filter((m) => m.role !== "assistant").concat(userMessage) : [...messages, userMessage];
    setMessages(optimistic);
    setDraft("");
    setEditingId("");
    setThinking(true);
    rate.recordLocalHit();
    haptic([8, 18, 8]);

    try {
      const accessToken = await getAccessToken();
      const data = await runDlavieAi({
        prompt,
        tier,
        modelId: selectedModel.id,
        mode: selectedModel.id.includes("agent") ? "agent" : "thinking",
        tools: ["prompt-lab", selectedModel.id === "dlavie-x-lite" ? "" : "web-search"].filter(Boolean),
        sessionId,
        accessToken,
        contextMessages: visibleContext,
        onboarding,
        signal: controller.signal,
      });
      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.reply || "Dlavie AI belum mengirim jawaban.",
        createdAt: new Date().toISOString(),
        trace: data.trace || [],
        modelName: data.modelName || selectedModel.label,
        engine: data.engine || data.providerModel,
        streaming: true,
      };
      const next = [...optimistic, assistant];
      setMessages(next);
      persistImmediate(next, prompt);
      toast.success("Jawaban Dlavie AI selesai.");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      const fallback: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: `Maaf, Dlavie AI belum bisa memproses permintaan ini dengan stabil.\n\nDetail aman: ${error instanceof Error ? error.message : "provider limit atau koneksi bermasalah"}`,
        createdAt: new Date().toISOString(),
        trace: ["Graceful error handling aktif", "Prompt tetap aman di draft/session lokal"],
      };
      const next = [...optimistic, fallback];
      setMessages(next);
      persistImmediate(next, prompt);
      toast.error("AI gagal elegan tanpa crash.");
    } finally {
      setThinking(false);
    }
  }

  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void sendPrompt();
    }
  }

  const workspace = (
    <PanelGroup direction="horizontal" className="min-h-0 flex-1">
      {!sidebarCollapsed ? (
        <Panel minSize={22} maxSize={42} defaultSize={sidebarSize} onResize={setSidebarSize}>
          <Sidebar
            sessions={sessions}
            activeId={sessionId}
            loading={loadingHistory}
            openSession={openSession}
            newChat={() => startNewChat()}
            deleteSession={deleteSession}
            clearAll={clearAll}
            collapse={() => setSidebarCollapsed(true)}
          />
        </Panel>
      ) : null}
      {!sidebarCollapsed ? <PanelResizeHandle className="dlv-ai-resize" /> : null}
      <Panel minSize={58}>
        <main className="dlv-ai-chat-frame">
          <header className="dlv-ai-header">
            <button className="dlv-ai-icon-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Collapse sidebar">
              {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </button>
            <div>
              <p className="dlv-ai-eyebrow">Dlavie AI Workspace</p>
              <h1 className="dlv-ai-gradient-title">{currentSession?.title || "Percakapan Baru"}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {offline ? <span className="dlv-ai-offline"><WifiOff className="h-4 w-4" /> Offline</span> : null}
              <TokenRing used={rate.used} limit={rate.limit} />
              <button className="dlv-ai-icon-btn" onClick={exportChat} title="Export TXT"><Download /></button>
            </div>
          </header>

          <section ref={scrollRef} className="dlv-ai-messages dlv-ai-scrollbar">
            <div className="dlv-ai-sticky-date">{formatStickyDate(new Date())}</div>
            {!messages.length ? (
              <EmptyState startNewChat={startNewChat} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    copy={copy}
                    edit={(content) => {
                      setDraft(content);
                      setEditingId(message.id);
                      textareaRef.current?.focus();
                    }}
                    regenerate={(content) => void sendPrompt(content, true)}
                    feedback={(value) => {
                      setMessages((current) => current.map((m) => (m.id === message.id ? { ...m, feedback: value } : m)));
                      toast.success(value === "up" ? "Terima kasih atas feedback positif." : "Feedback dicatat untuk peningkatan.");
                    }}
                  />
                ))}
              </AnimatePresence>
            )}
            {thinking ? <ThinkingCard open={thinkingOpen} setOpen={setThinkingOpen} /> : null}
          </section>

          <Composer
            refEl={textareaRef}
            value={draft}
            setValue={setDraft}
            send={() => void sendPrompt()}
            stop={stopGeneration}
            thinking={thinking}
            estimate={tokenEstimate}
            blocked={rate.blocked}
            onKeyDown={onComposerKeyDown}
            openPricing={() => setPricingOpen(true)}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            tier={tier}
          />
        </main>
      </Panel>
    </PanelGroup>
  );

  return (
    <div className="dlv-ai-os" data-theme={dark ? "dark" : "light"}>
      <Toaster position="top-right" toastOptions={{ className: "dlv-ai-toast" }} />
      <WebGLAmbientAura />
      <div className="dlv-ai-noise" />
      <AnimatePresence mode="wait">
        {screen === "onboarding" ? (
          <OnboardingScreen key="onboarding" data={onboarding} setData={setOnboarding} save={saveOnboarding} skip={() => setScreen("workspace")} />
        ) : (
          <motion.div key="workspace" className="dlv-ai-workspace" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            {workspace}
          </motion.div>
        )}
      </AnimatePresence>
      <PricingModal open={pricingOpen} close={() => setPricingOpen(false)} tier={tier} setTier={(next) => { setTier(next); setPricingOpen(false); toast.success("Plan aktif di UI. Hubungkan payment gateway untuk produksi penuh."); }} />
    </div>
  );
}

function OnboardingScreen({ data, setData, save, skip }: { data: Onboarding; setData: (data: Onboarding) => void; save: () => void; skip: () => void }) {
  return (
    <motion.main className="dlv-ai-onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -18 }}>
      <div className="dlv-ai-onboarding-shell">
        <motion.section className="dlv-ai-hero-panel" initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}>
          <div className="dlv-ai-hero-orbit" aria-hidden="true"><Sparkles /></div>
          <p className="dlv-ai-eyebrow">Dlavie intelligence workspace</p>
          <h1 className="dlv-ai-super-title">AI yang tenang, rapi, dan siap bekerja.</h1>
          <p className="dlv-ai-hero-copy">Masuk ke workspace modern untuk chat, analisis bisnis, coding, riset, dan workflow commerce tanpa tampilan yang berisik.</p>
          <div className="dlv-ai-hero-metrics">
            <span><strong>10</strong> chat/jam free</span>
            <span><strong>5</strong> context window</span>
            <span><strong>3</strong> model tier</span>
          </div>
        </motion.section>
        <motion.aside className="dlv-ai-onboarding-card" initial={{ x: 28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}>
          <div className="dlv-ai-form-header">
            <span className="dlv-ai-form-mark"><Bot className="h-5 w-5" /></span>
            <div>
              <p className="dlv-ai-eyebrow">Personal setup</p>
              <h2>Sesuaikan Dlavie AI</h2>
            </div>
          </div>
          <BentoInput label="Tujuan utama" value={data.purpose} setValue={(purpose) => setData({ ...data, purpose })} options={["Bangun bisnis", "Belajar coding", "Konten brand", "Analisis data"]} />
          <BentoInput label="Profesi saat ini" value={data.profession} setValue={(profession) => setData({ ...data, profession })} options={["Founder", "Developer", "Designer", "Marketer"]} />
          <BentoInput label="Mengetahui dari" value={data.source} setValue={(source) => setData({ ...data, source })} options={["Google", "Instagram", "Teman", "Website DLAVIE"]} />
          <div className="dlv-ai-action-row">
            <button className="dlv-ai-primary magnetic" onClick={save}><Check className="h-5 w-5" /> Masuk Workspace</button>
            <button className="dlv-ai-ghost" onClick={skip}>Lewati</button>
          </div>
          <p className="dlv-ai-form-note">Jawaban dipakai sebagai konteks privat agar respons AI lebih sesuai dengan kebutuhan Anda.</p>
        </motion.aside>
      </div>
    </motion.main>
  );
}

function BentoInput({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: string[] }) {
  return (
    <section className="dlv-ai-fieldset">
      <p>{label}</p>
      <div>
        {options.map((option) => (
          <button key={option} onClick={() => setValue(option)} className={`dlv-ai-chip ${value === option ? "active" : ""}`}>{option}</button>
        ))}
      </div>
    </section>
  );
}

function Sidebar(props: { sessions: ChatSession[]; activeId: string; loading: boolean; openSession: (s: ChatSession) => void; newChat: () => void; deleteSession: (id: string) => void; clearAll: () => void; collapse: () => void }) {
  return (
    <aside className="dlv-ai-sidebar">
      <div className="flex items-center justify-between gap-2">
        <div><p className="dlv-ai-eyebrow">History</p><h2 className="text-xl font-black">Percakapan</h2></div>
        <button className="dlv-ai-icon-btn" onClick={props.collapse} title="Fokus penuh"><ChevronLeft /></button>
      </div>
      <button className="dlv-ai-primary mt-5 w-full" onClick={props.newChat}><Plus className="h-5 w-5" /> Chat Baru</button>
      <div className="mt-5 flex gap-2"><button className="dlv-ai-ghost flex-1" onClick={props.clearAll}><Eraser className="h-4 w-4" /> Hapus Semua</button></div>
      <div className="dlv-ai-history dlv-ai-scrollbar">
        {props.loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="dlv-ai-skeleton" />) : null}
        {!props.loading && !props.sessions.length ? <div className="dlv-ai-empty-mini"><Archive className="h-8 w-8" /> Riwayat masih kosong.</div> : null}
        {props.sessions.map((session) => (
          <motion.article drag="x" dragConstraints={{ left: -82, right: 0 }} onDragEnd={(_, info) => { if (info.offset.x < -70) props.deleteSession(session.id); }} key={session.id} className={`dlv-ai-session ${props.activeId === session.id ? "active" : ""}`} onClick={() => props.openSession(session)}>
            <MessageSquare className="h-4 w-4" /><div className="min-w-0 flex-1"><p className="truncate font-black">{session.title}</p><p className="text-xs text-white/42">{formatStickyDate(session.createdAt)}</p></div>
            <button onClick={(e) => { e.stopPropagation(); props.deleteSession(session.id); }} title="Geser kiri di mobile untuk hapus"><Trash2 className="h-4 w-4" /></button>
          </motion.article>
        ))}
      </div>
    </aside>
  );
}

function EmptyState({ startNewChat }: { startNewChat: (seed: string) => void }) {
  return (
    <section className="dlv-ai-empty-state">
      <div className="dlv-ai-orb"><Bot className="h-12 w-12" /></div>
      <h2 className="dlv-ai-gradient-title text-4xl">Mulai dengan prompt yang jelas.</h2>
      <p>Dlavie AI siap membantu coding, desain, strategi brand, database, dan commerce. Pilih prompt cepat atau ketik sendiri.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {quickPrompts.map((prompt) => <button key={prompt} className="dlv-ai-suggestion" onClick={() => startNewChat(prompt)}><WandSparkles className="h-5 w-5" /> {prompt}</button>)}
      </div>
    </section>
  );
}

function MessageBubble({ message, copy, edit, regenerate, feedback }: { message: ChatMessage; copy: (v: string) => void; edit: (v: string) => void; regenerate: (v: string) => void; feedback: (v: "up" | "down") => void }) {
  const isUser = message.role === "user";
  return (
    <motion.article layout initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ type: "spring", stiffness: 220, damping: 24 }} className={`dlv-ai-message ${isUser ? "user" : "assistant"}`}>
      <div className="dlv-ai-avatar">{isUser ? <User /> : <Bot />}</div>
      <div className="dlv-ai-bubble">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/45"><span>{isUser ? "Anda" : message.modelName || "Dlavie AI"}</span>{message.engine ? <span>· {message.engine}</span> : null}</div>
        {isUser ? <p className="whitespace-pre-wrap">{message.content}</p> : <MarkdownContent text={message.content} copy={copy} />}
        {message.trace?.length ? <details className="dlv-ai-thinking-accordion"><summary>Thinking Process</summary><ul>{message.trace.map((item) => <li key={item}>{item}</li>)}</ul></details> : null}
        <div className="dlv-ai-message-actions">
          <button onClick={() => copy(message.content)} title="Salin jawaban"><Copy /></button>
          {isUser ? <button onClick={() => edit(message.content)} title="Edit prompt"><Edit3 /></button> : <button onClick={() => regenerate(message.content)} title="Regenerate"><RefreshCcw /></button>}
          {!isUser ? <><button onClick={() => feedback("up")} title="Bagus"><ThumbsUp /></button><button onClick={() => feedback("down")} title="Kurang"><ThumbsDown /></button></> : null}
        </div>
      </div>
    </motion.article>
  );
}

function MarkdownContent({ text, copy }: { text: string; copy: (v: string) => void }) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");
          return match ? (
            <div className="dlv-ai-code-block">
              <div className="flex items-center justify-between px-4 py-2 text-xs"><span>{match[1]}</span><button onClick={() => copy(code)}><Clipboard className="h-4 w-4" /> Copy</button></div>
              <SyntaxHighlighter style={oneDark as Record<string, React.CSSProperties>} language={match[1]} PreTag="div">{code}</SyntaxHighlighter>
            </div>
          ) : <code className={className} {...props}>{children}</code>;
        },
      }}
    >{text}</ReactMarkdown>
  );
}

function ThinkingCard({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  return (
    <motion.div className="dlv-ai-thinking-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <button className="flex w-full items-center justify-between" onClick={() => setOpen(!open)}><span className="flex items-center gap-3"><BrainCircuit className="dlv-ai-brain" /> Dlavie AI sedang menganalisis prompt Anda...</span><ChevronRight className={open ? "rotate-90" : ""} /></button>
      <AnimatePresence>{open ? <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}><li>Memilih engine terbaik.</li><li>Meringkas 5 chat terakhir.</li><li>Menyiapkan respons markdown.</li></motion.ul> : null}</AnimatePresence>
      <div className="dlv-ai-dots"><i /><i /><i /></div>
    </motion.div>
  );
}

function Composer(props: { refEl: React.RefObject<HTMLTextAreaElement | null>; value: string; setValue: (v: string) => void; send: () => void; stop: () => void; thinking: boolean; estimate: number; blocked: boolean; onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void; openPricing: () => void; selectedModel: ModelOption; setSelectedModel: (m: ModelOption) => void; tier: Tier }) {
  return (
    <footer className={`dlv-ai-composer ${props.blocked ? "quota-shake" : ""}`}>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {modelOptions.map((model) => {
          const locked = !canUseModel(model.tier, props.tier);
          return <button key={model.id} title={model.desc} onClick={() => locked ? props.openPricing() : props.setSelectedModel(model)} className={`dlv-ai-model-pill ${props.selectedModel.id === model.id ? "active" : ""}`}>{locked ? "🔒 " : ""}{model.label}</button>;
        })}
      </div>
      <div className="dlv-ai-input-shell">
        <button className="dlv-ai-icon-btn" title="Attach/context placeholder"><Plus /></button>
        <textarea ref={props.refEl} value={props.value} onChange={(e) => props.setValue(e.target.value)} onKeyDown={props.onKeyDown} disabled={props.blocked} placeholder={props.blocked ? "Batas 10 pesan/jam habis. Upgrade untuk lanjut." : "Tulis prompt... Cmd/Ctrl + Enter untuk kirim"} rows={1} />
        <span className="text-xs text-white/38">~{props.estimate} token</span>
        <button className="dlv-ai-send morph" onClick={props.thinking ? props.stop : props.send} title={props.thinking ? "Stop generation" : "Kirim"}>{props.thinking ? <Square /> : <Send />}</button>
      </div>
    </footer>
  );
}

function TokenRing({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, (used / Math.max(limit, 1)) * 100);
  return <div className="dlv-ai-token-ring" style={{ "--pct": `${pct}%` } as React.CSSProperties}><span>{used}/{limit}</span></div>;
}

function PricingModal({ open, close, tier, setTier }: { open: boolean; close: () => void; tier: Tier; setTier: (tier: Tier) => void }) {
  return <AnimatePresence>{open ? <motion.div className="dlv-ai-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className="dlv-ai-pricing-modal" initial={{ y: 40, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 24, opacity: 0 }}><button className="dlv-ai-icon-btn float-right" onClick={close}>×</button><p className="dlv-ai-eyebrow">Pricing IDR</p><h2 className="dlv-ai-gradient-title text-3xl">Upgrade saat kuota habis</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{modelOptions.map((plan) => <article key={plan.id} className="dlv-ai-price-card"><Gem className="h-6 w-6" /><h3>{plan.label}</h3><p>{plan.desc}</p><strong>{plan.price}</strong><button className="dlv-ai-primary w-full" disabled={tier === plan.tier} onClick={() => setTier(plan.tier)}>{tier === plan.tier ? "Aktif" : "Aktifkan"}</button></article>)}</div><table className="dlv-ai-compare"><tbody>{comparisonRows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table><p className="mt-4 text-sm text-white/45">Payment gateway Midtrans/Xendit siap dihubungkan; modal ini menjaga UX dan logika upgrade sebelum kredensial produksi dipasang.</p></motion.section></motion.div> : null}</AnimatePresence>;
}
