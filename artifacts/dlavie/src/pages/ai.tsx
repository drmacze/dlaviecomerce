import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Database,
  FileText,
  Globe2,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Mic,
  MousePointer2,
  Paperclip,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  WandSparkles,
  Workflow,
  Zap,
} from "lucide-react";
import {
  dlavieAiPacks,
  estimateTextUnits,
  type DlavieAiPack,
  type DlavieAiPackId,
} from "@/lib/dlavie-ai-credits";
import { dlavieAiPlans, type DlavieAiPlan } from "@/lib/dlavie-ai-plans";
import {
  createSupabaseBrowserClient,
  hasSupabaseBrowserEnv,
} from "@/lib/supabase-client";

type Screen = "intro" | "onboarding" | "app";
type IntroStep = "brand" | "description" | "purpose" | "preparing";
type Tab = "chat" | "playground" | "workspace" | "pricing" | "activity";
type Mode = "instant" | "thinking" | "agent" | "research";
type Billing = "month" | "year";
type ToolId =
  | "web-search"
  | "file-context"
  | "vision"
  | "code-audit"
  | "commerce-data"
  | "prompt-lab"
  | "voice-note"
  | "database-map";
type Access = {
  authenticated: boolean;
  plan: DlavieAiPlan;
  name: string;
  dailyQuota: number;
  dailyUsed: number;
  remaining: number;
  dBalance: number;
  aiTokenBalance: number;
};
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  tools?: ToolId[];
  usage?: number;
  trace?: string[];
};
type Attachment = {
  id: string;
  name: string;
  kind: "file" | "image";
  size: number;
  text?: string;
  inline?: string;
  preview?: string;
};
type OnboardingKey = "intent" | "profession" | "source";

type AiModel = {
  id: string;
  name: string;
  tier: string;
  plan: DlavieAiPlan;
  latency: string;
  usage: string;
  specialty: string;
};

const introCopy: Record<IntroStep, { title: string; body: string }> = {
  brand: {
    title: "AI DLAVIE",
    body: "Commerce intelligence yang dirancang untuk membantu pekerjaan digital harian.",
  },
  description: {
    title: "Asisten yang memahami konteks",
    body: "Dlavie AI membaca tujuan, profesi, file, dan mode kerja sebelum memberi jawaban.",
  },
  purpose: {
    title: "Tujuannya jelas",
    body: "Membantu kamu membangun, menjual, menganalisis, menulis, dan mengambil keputusan dengan lebih rapi.",
  },
  preparing: {
    title: "Dlavie AI sedang menyiapkan",
    body: "Mengunduh resource UI, status plan, model routing, dan workspace agar halaman siap digunakan.",
  },
};

const onboarding: Record<
  OnboardingKey,
  { title: string; subtitle: string; options: string[] }
> = {
  intent: {
    title: "Untuk keperluan apa menggunakan Dlavie AI?",
    subtitle:
      "Pilihan ini akan dipakai sebagai konteks real saat prompt dikirim ke backend.",
    options: [
      "Membangun website/app",
      "Konten dan brand",
      "Analisis bisnis",
      "Debugging kode",
      "Agent otomatis",
      "Belajar dan riset",
    ],
  },
  profession: {
    title: "Profesi anda saat ini?",
    subtitle: "Dlavie AI akan menyesuaikan bahasa, detail, dan contoh jawaban.",
    options: [
      "Founder/Owner",
      "Developer",
      "Designer",
      "Content Creator",
      "Marketer",
      "Pelajar/Mahasiswa",
      "Freelancer",
      "Lainnya",
    ],
  },
  source: {
    title: "Dari mana kamu mengetahui Dlavie AI?",
    subtitle: "Data ini membantu DLAVIE memahami channel pertumbuhan produk.",
    options: [
      "Website DLAVIE",
      "Google Search",
      "Instagram",
      "TikTok/Reels",
      "YouTube",
      "Teman/Komunitas",
    ],
  },
};

const aiModels: AiModel[] = [
  {
    id: "dlavie-x-lite",
    name: "Dlavie X Lite",
    tier: "Fast",
    plan: "free",
    latency: "Cepat",
    usage: "0.7x",
    specialty: "Jawaban singkat, ide cepat, ringkasan.",
  },
  {
    id: "dlavie-x-mini",
    name: "Dlavie X Mini",
    tier: "Daily",
    plan: "free",
    latency: "Normal",
    usage: "1x",
    specialty: "Chat harian, commerce, konten, support.",
  },
  {
    id: "dlavie-1-5",
    name: "Dlavie 1.5",
    tier: "Builder",
    plan: "basic",
    latency: "Lebih teliti",
    usage: "1.4x",
    specialty: "Planning, UI/UX, strategi, struktur.",
  },
  {
    id: "dlavie-1-5-preview",
    name: "Dlavie 1.5 Preview",
    tier: "Reasoning",
    plan: "core",
    latency: "Thinking",
    usage: "1.8x",
    specialty: "Eksplorasi solusi, edge case, ide baru.",
  },
  {
    id: "dlavie-x-3",
    name: "Dlavie X 3",
    tier: "Pro",
    plan: "core",
    latency: "Mendalam",
    usage: "2.2x",
    specialty: "Coding, audit, arsitektur, multimodal.",
  },
  {
    id: "dlavie-agent-pro",
    name: "Dlavie Agent Pro",
    tier: "Agent",
    plan: "custom",
    latency: "Multi-step",
    usage: "3x",
    specialty: "Workflow agent, checklist, rencana aksi.",
  },
];

const tools: {
  id: ToolId;
  label: string;
  desc: string;
  icon: typeof Search;
  plan: DlavieAiPlan;
}[] = [
  {
    id: "web-search",
    label: "Pencarian Web",
    desc: "Aktifkan grounding Google Search dan jawaban riset lebih teliti.",
    icon: Globe2,
    plan: "basic",
  },
  {
    id: "file-context",
    label: "File Context",
    desc: "Gunakan isi file teks sebagai konteks.",
    icon: FileText,
    plan: "basic",
  },
  {
    id: "vision",
    label: "Vision",
    desc: "Analisis gambar atau screenshot.",
    icon: ImageIcon,
    plan: "core",
  },
  {
    id: "code-audit",
    label: "Code Audit",
    desc: "Audit bug, arsitektur, dan edge case.",
    icon: Code2,
    plan: "core",
  },
  {
    id: "commerce-data",
    label: "Commerce Data",
    desc: "Fokus pada katalog, produk, order, wallet.",
    icon: Database,
    plan: "basic",
  },
  {
    id: "prompt-lab",
    label: "Prompt Lab",
    desc: "Buat prompt sistem, role, dan rubric output.",
    icon: WandSparkles,
    plan: "free",
  },
  {
    id: "voice-note",
    label: "Voice Note",
    desc: "Siapkan mode suara dan ringkasan percakapan.",
    icon: Mic,
    plan: "custom",
  },
  {
    id: "database-map",
    label: "Database Map",
    desc: "Minta AI membuat mapping tabel dan flow data.",
    icon: Workflow,
    plan: "core",
  },
];

const modeCards: { id: Mode; title: string; desc: string }[] = [
  { id: "instant", title: "Instant", desc: "Jawaban cepat dan hemat usage." },
  {
    id: "thinking",
    title: "Thinking",
    desc: "Lebih lambat, lebih rapi, cocok untuk keputusan.",
  },
  {
    id: "research",
    title: "Research",
    desc: "Untuk web search dan rangkuman bukti.",
  },
  { id: "agent", title: "Agent", desc: "Multi-step: rencana, aksi, validasi." },
];

let audioCtx: AudioContext | null = null;
function feedback(kind: "tap" | "success" | "think" = "tap") {
  if (typeof window === "undefined") return;
  try {
    navigator.vibrate?.(
      kind === "think" ? [8, 18, 8] : kind === "success" ? 18 : 8,
    );
    const AudioCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return;
    audioCtx = audioCtx || new AudioCtor();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(
      kind === "success" ? 740 : kind === "think" ? 410 : 560,
      now,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  } catch {}
}
function uid() {
  return Math.random().toString(36).slice(2);
}
function formatNumber(value: number) {
  return Number(value || 0).toLocaleString("id-ID");
}
function formatRupiah(value: number) {
  return value === 0 ? "Rp0" : `Rp${formatNumber(value)}`;
}
function planRank(plan: DlavieAiPlan) {
  return ["free", "basic", "core", "custom"].indexOf(plan);
}
function canUse(required: DlavieAiPlan, current: DlavieAiPlan) {
  return planRank(current) >= planRank(required);
}
function canReadTextFile(file: File) {
  return (
    file.type.startsWith("text/") ||
    [
      "application/json",
      "application/javascript",
      "application/xml",
      "image/svg+xml",
    ].includes(file.type) ||
    /\.(md|txt|json|js|ts|tsx|jsx|css|html|xml|csv)$/i.test(file.name)
  );
}
function copyText(text: string) {
  navigator.clipboard?.writeText(text).catch(() => undefined);
  feedback("success");
}

export default function AI() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [introStep, setIntroStep] = useState<IntroStep>("brand");
  const [resourceProgress, setResourceProgress] = useState(8);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingKey>("intent");
  const [answers, setAnswers] = useState<Record<OnboardingKey, string>>({
    intent: "",
    profession: "",
    source: "",
  });
  const [tab, setTab] = useState<Tab>("chat");
  const [mode, setMode] = useState<Mode>("thinking");
  const [model, setModel] = useState<AiModel>(aiModels[1]);
  const [activeTools, setActiveTools] = useState<ToolId[]>(["prompt-lab"]);
  const [access, setAccess] = useState<Access>({
    authenticated: false,
    plan: "free",
    name: "Dlavie AI Free",
    dailyQuota: 8,
    dailyUsed: 0,
    remaining: 8,
    dBalance: 0,
    aiTokenBalance: 0,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [notice, setNotice] = useState("");
  const [billing, setBilling] = useState<Billing>("month");
  const [purchaseBusy, setPurchaseBusy] = useState<string | null>(null);
  const [toolPanel, setToolPanel] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const packs = useMemo(() => Object.values(dlavieAiPacks), []);
  const availableModels = aiModels.filter((item) =>
    canUse(item.plan, access.plan),
  );
  const estimate =
    Math.max(1, estimateTextUnits(q)) *
    (mode === "research" ? 2 : mode === "agent" ? 3 : 1);

  async function getAccessToken() {
    if (!hasSupabaseBrowserEnv()) return undefined;
    const supabase = createSupabaseBrowserClient();
    return (await supabase.auth.getSession()).data.session?.access_token;
  }

  async function loadAccess() {
    const token = await getAccessToken();
    const res = await fetch("/api/ai/dlavie-subscription", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setAccess((current) => ({ ...current, ...data }));
      if (!canUse(model.plan, data.plan || "free")) setModel(aiModels[1]);
    }
  }

  useEffect(() => {
    if (screen !== "intro") return;
    const order: IntroStep[] = ["brand", "description", "purpose", "preparing"];
    const currentIndex = order.indexOf(introStep);
    if (introStep !== "preparing") {
      const timer = window.setTimeout(
        () => setIntroStep(order[currentIndex + 1] || "preparing"),
        1900,
      );
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    const progress = window.setInterval(
      () => setResourceProgress((value) => Math.min(value + 11, 94)),
      180,
    );
    Promise.allSettled([
      loadAccess(),
      Promise.resolve(dlavieAiPlans),
      fetch("/api/ai/dlavie-subscription")
        .then((r) => r.json())
        .catch(() => null),
      new Promise((resolve) => window.setTimeout(resolve, 1250)),
    ]).finally(() => {
      if (cancelled) return;
      window.clearInterval(progress);
      setResourceProgress(100);
      window.setTimeout(() => setScreen("onboarding"), 520);
    });
    return () => {
      cancelled = true;
      window.clearInterval(progress);
    };
  }, [introStep, screen]);

  function answerOnboarding(value: string) {
    feedback("success");
    setAnswers((current) => ({ ...current, [onboardingStep]: value }));
    if (onboardingStep === "intent") setOnboardingStep("profession");
    else if (onboardingStep === "profession") setOnboardingStep("source");
    else setScreen("app");
  }

  function toggleTool(tool: ToolId) {
    const item = tools.find((entry) => entry.id === tool);
    if (item && !canUse(item.plan, access.plan)) {
      setNotice(
        `${item.label} tersedia mulai plan ${dlavieAiPlans[item.plan].name}.`,
      );
      feedback("tap");
      return;
    }
    setActiveTools((current) =>
      current.includes(tool)
        ? current.filter((value) => value !== tool)
        : [...current, tool],
    );
    feedback("tap");
  }

  async function addFiles(files: FileList | null, kind: "file" | "image") {
    if (!files) return;
    const next = await Promise.all(
      Array.from(files).map(async (file) => {
        const item: Attachment = {
          id: uid(),
          name: file.name,
          size: file.size,
          kind,
        };
        if (kind === "image") {
          item.preview = URL.createObjectURL(file);
          item.inline = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });
        }
        if (canReadTextFile(file) && file.size < 850000)
          item.text = (await file.text()).slice(0, 9000);
        return item;
      }),
    );
    setAttachments((current) => [...current, ...next]);
    if (kind === "image" && !activeTools.includes("vision"))
      setActiveTools((current) => [...current, "vision"]);
    if (kind === "file" && !activeTools.includes("file-context"))
      setActiveTools((current) => [...current, "file-context"]);
    feedback("success");
  }

  async function ask() {
    const text = q.trim();
    if (!text || busy) return;
    if (!access.authenticated) {
      setNotice(
        "Login diperlukan agar chat, usage, dan session tersimpan ke database DLAVIE.",
      );
      return;
    }
    if (!canUse(model.plan, access.plan)) {
      setNotice(
        `${model.name} terkunci. Upgrade ke ${dlavieAiPlans[model.plan].name}.`,
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      tools: activeTools,
    };
    setMessages((current) => [...current, userMessage]);
    setQ("");
    setBusy(true);
    setNotice(
      activeTools.includes("web-search")
        ? "Web Search aktif: Dlavie AI akan memakai grounding dan berpikir lebih teliti."
        : "Dlavie AI sedang bekerja.",
    );
    feedback("think");

    const message = [
      `Intent: ${answers.intent || "General"}`,
      `Profession: ${answers.profession || "Unknown"}`,
      `Discovery source: ${answers.source || "Unknown"}`,
      `Mode: ${mode}`,
      `Requested model: ${model.name}`,
      `Tools: ${activeTools.join(", ") || "none"}`,
      "",
      text,
    ].join("\n");

    try {
      const token = await getAccessToken();
      const res = await fetch("/api/ai/persistent-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          sessionId,
          mode,
          modelId: model.id,
          tools: activeTools,
          attachments,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.sessionId) setSessionId(data.sessionId);
      if (!res.ok) {
        setNotice(data.error || "Dlavie AI sedang bermasalah.");
        return;
      }
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: data.reply || "Tidak ada balasan.",
          model: data.modelName || model.name,
          tools: activeTools,
          usage: Number(data.usageUnits || data.chargedTokens || 0),
          trace: Array.isArray(data.trace) ? data.trace : [],
        },
      ]);
      setAttachments([]);
      setNotice(
        `Usage tercatat: ${formatNumber(data.usageUnits || 0)} unit. Sisa kuota harian ${formatNumber(data.remaining || 0)}.`,
      );
      await loadAccess().catch(() => undefined);
    } catch {
      setNotice("Dlavie AI sedang bermasalah. Coba lagi sebentar.");
    } finally {
      setBusy(false);
      feedback("success");
    }
  }

  async function purchasePlan(plan: DlavieAiPlan) {
    if (purchaseBusy || plan === "free") return;
    const config = dlavieAiPlans[plan];
    const price =
      billing === "month" ? config.monthlyPrice : config.yearlyPrice;
    if (
      !window.confirm(
        `Aktifkan ${config.name}?\nBiaya: ${formatRupiah(price)} D Balance`,
      )
    )
      return;
    setPurchaseBusy(plan);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/ai/subscribe-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan, billing }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upgrade plan gagal.");
      setNotice(
        `${config.name} aktif. Benefit dan model sudah terbuka sesuai plan.`,
      );
      await loadAccess();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upgrade plan gagal.");
    } finally {
      setPurchaseBusy(null);
    }
  }

  async function buyCredits(pack: DlavieAiPack) {
    if (purchaseBusy) return;
    if (
      !window.confirm(
        `Beli overage usage ${pack.badge}?\nBiaya: ${formatNumber(pack.priceDBalance)} D Balance`,
      )
    )
      return;
    setPurchaseBusy(pack.id);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/ai/buy-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ packId: pack.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Pembelian usage gagal.");
      setNotice(
        `Overage usage ${data.pack?.badge || pack.badge} berhasil dibeli.`,
      );
      await loadAccess();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Pembelian usage gagal.",
      );
    } finally {
      setPurchaseBusy(null);
    }
  }

  if (screen === "intro")
    return <Intro step={introStep} progress={resourceProgress} />;
  if (screen === "onboarding")
    return (
      <Onboarding
        step={onboardingStep}
        answers={answers}
        onPick={answerOnboarding}
      />
    );

  return (
    <main
      className="dlv-ai-page fixed inset-0 z-[999999] overflow-y-auto bg-[#030305] text-white"
      onPointerDown={(event) => {
        if (
          (event.target as HTMLElement).closest("button,a,label,input,textarea")
        )
          feedback();
      }}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="dlv-ai-aurora" />
        <div className="dlv-ai-grid" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030305]/76 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#c7a329]">
              Next level intelligence
            </p>
            <h1 className="text-xl font-black tracking-[-0.05em] text-white sm:text-2xl">
              Dlavie AI Playground
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] p-1 md:flex">
            {(
              [
                "chat",
                "playground",
                "workspace",
                "pricing",
                "activity",
              ] as Tab[]
            ).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`rounded-full px-4 py-2 text-xs font-black capitalize transition ${tab === item ? "bg-[#c7a329] text-[#060504]" : "text-white/55 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/36">
              {access.name}
            </p>
            <p className="text-sm font-black text-[#f4d675]">
              {formatNumber(access.remaining)} /{" "}
              {formatNumber(access.dailyQuota)} usage
            </p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
          {(
            ["chat", "playground", "workspace", "pricing", "activity"] as Tab[]
          ).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black capitalize ${tab === item ? "bg-[#c7a329] text-[#060504]" : "bg-white/[0.06] text-white/60"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[280px_1fr]">
        <aside className="hidden space-y-4 lg:block">
          <StatusCard
            access={access}
            mode={mode}
            model={model}
            tools={activeTools}
          />
          <ModePicker mode={mode} setMode={setMode} plan={access.plan} />
        </aside>

        <section className="min-w-0">
          {notice ? (
            <div className="mb-4 rounded-[1.3rem] border border-[#c7a329]/25 bg-[#c7a329]/10 px-4 py-3 text-sm font-bold text-[#f4d675]">
              {notice}
            </div>
          ) : null}
          {tab === "chat" ? (
            <ChatPanel
              messages={messages}
              busy={busy}
              mode={mode}
              model={model}
              q={q}
              setQ={setQ}
              ask={ask}
              inputRef={inputRef}
              toolPanel={toolPanel}
              setToolPanel={setToolPanel}
              tools={activeTools}
              toggleTool={toggleTool}
              accessPlan={access.plan}
              attachments={attachments}
              addFiles={addFiles}
              estimate={estimate}
            />
          ) : null}
          {tab === "playground" ? (
            <Playground
              selected={model.id}
              setModel={setModel}
              models={aiModels}
              accessPlan={access.plan}
            />
          ) : null}
          {tab === "workspace" ? (
            <Workspace setTab={setTab} setQ={setQ} />
          ) : null}
          {tab === "pricing" ? (
            <Pricing
              billing={billing}
              setBilling={setBilling}
              access={access}
              purchasePlan={purchasePlan}
              packs={packs}
              buyCredits={buyCredits}
              purchaseBusy={purchaseBusy}
            />
          ) : null}
          {tab === "activity" ? (
            <ActivityPanel access={access} messages={messages} />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Intro({ step, progress }: { step: IntroStep; progress: number }) {
  const copy = introCopy[step];
  return (
    <main className="dlv-ai-page fixed inset-0 z-[999999] grid place-items-center overflow-hidden bg-[#030305] px-5 text-white">
      <div className="dlv-ai-aurora" />
      <section key={step} className="dlv-ai-intro-card max-w-3xl text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c7a329]">
          DLAVIE Intelligence OS
        </p>
        <h1 className="mt-5 text-5xl font-black leading-[0.9] tracking-[-0.08em] sm:text-8xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-8 text-white/58 sm:text-xl">
          {copy.body}
        </p>
        {step === "preparing" ? (
          <div className="mx-auto mt-8 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[#fff0b7] via-[#c7a329] to-[#3f75a2] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Onboarding({
  step,
  answers,
  onPick,
}: {
  step: OnboardingKey;
  answers: Record<OnboardingKey, string>;
  onPick: (value: string) => void;
}) {
  const data = onboarding[step];
  return (
    <main className="dlv-ai-page fixed inset-0 z-[999999] grid place-items-center overflow-y-auto bg-[#030305] px-4 py-8 text-white">
      <div className="dlv-ai-aurora" />
      <section className="dlv-ai-panel w-full max-w-4xl rounded-[2.4rem] p-5 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#c7a329]">
          Personalize Dlavie AI
        </p>
        <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
          {data.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/56 sm:text-base">
          {data.subtitle}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {data.options.map((option) => (
            <button
              key={option}
              onClick={() => onPick(option)}
              className="dlv-ai-option rounded-[1.4rem] p-4 text-left text-sm font-black text-white transition hover:-translate-y-1"
            >
              {option}
              <ChevronRight className="float-right h-5 w-5 text-[#c7a329]" />
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/34">
          {Object.entries(answers)
            .filter(([, value]) => value)
            .map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-white/[0.06] px-3 py-2"
              >
                {value}
              </span>
            ))}
        </div>
      </section>
    </main>
  );
}

function ChatPanel(props: {
  messages: ChatMessage[];
  busy: boolean;
  mode: Mode;
  model: AiModel;
  q: string;
  setQ: (q: string) => void;
  ask: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  toolPanel: boolean;
  setToolPanel: (open: boolean) => void;
  tools: ToolId[];
  toggleTool: (tool: ToolId) => void;
  accessPlan: DlavieAiPlan;
  attachments: Attachment[];
  addFiles: (files: FileList | null, kind: "file" | "image") => void;
  estimate: number;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <section
        className={`dlv-ai-chat-shell rounded-[2rem] ${props.busy ? "is-thinking" : ""}`}
      >
        <div className="border-b border-white/10 p-4 sm:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c7a329]">
            {props.model.name} · {props.mode}
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-white">
            Chat yang menjelaskan setiap tindakan AI.
          </h2>
        </div>
        <div className="min-h-[52vh] space-y-4 p-4 sm:p-5">
          {props.messages.length === 0 ? (
            <EmptyChat />
          ) : (
            props.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {props.busy ? (
            <ThinkingBlock tools={props.tools} mode={props.mode} />
          ) : null}
        </div>
        <div className="sticky bottom-0 border-t border-white/10 bg-[#070707]/86 p-3 backdrop-blur-2xl sm:p-4">
          {props.attachments.length ? (
            <div className="mb-3 flex gap-2 overflow-x-auto">
              {props.attachments.map((item) => (
                <span
                  key={item.id}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white/58"
                >
                  {item.kind === "image" ? "Image" : "File"} · {item.name}
                </span>
              ))}
            </div>
          ) : null}
          {props.toolPanel ? (
            <ToolPanel
              active={props.tools}
              toggle={props.toggleTool}
              plan={props.accessPlan}
            />
          ) : null}
          <div className="flex items-end gap-2 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-2">
            <button
              onClick={() => props.setToolPanel(!props.toolPanel)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.08] text-white"
            >
              <Plus className="h-5 w-5" />
            </button>
            <textarea
              ref={props.inputRef}
              value={props.q}
              onChange={(e) => props.setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  props.ask();
                }
              }}
              placeholder="Tulis perintah untuk Dlavie AI..."
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/30"
            />
            <button
              onClick={props.ask}
              disabled={props.busy || !props.q.trim()}
              className="dlv-ai-send grid h-11 w-11 shrink-0 place-items-center rounded-2xl disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/32">
            <span>Estimate {formatNumber(props.estimate)} usage units</span>
            <span>Enter untuk kirim · Shift Enter untuk baris baru</span>
          </div>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="dlv-ai-panel rounded-[1.7rem] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c7a329]">
            Attach
          </p>
          <div className="mt-3 grid gap-2">
            <label className="dlv-ai-option cursor-pointer rounded-2xl p-3 text-sm font-black">
              <Paperclip className="mr-2 inline h-4 w-4" /> File context
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => props.addFiles(e.target.files, "file")}
              />
            </label>
            <label className="dlv-ai-option cursor-pointer rounded-2xl p-3 text-sm font-black">
              <ImageIcon className="mr-2 inline h-4 w-4" /> Image vision
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) => props.addFiles(e.target.files, "image")}
              />
            </label>
          </div>
        </div>
        <div className="dlv-ai-panel rounded-[1.7rem] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c7a329]">
            Action trace
          </p>
          <ul className="mt-3 space-y-3 text-sm font-semibold text-white/58">
            <li>
              <Check className="mr-2 inline h-4 w-4 text-[#c7a329]" /> Plan gate
              dicek di backend
            </li>
            <li>
              <Check className="mr-2 inline h-4 w-4 text-[#c7a329]" /> Usage
              harian dicatat ke Supabase
            </li>
            <li>
              <Check className="mr-2 inline h-4 w-4 text-[#c7a329]" /> Session
              tersimpan sebagai chat history
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="grid min-h-[42vh] place-items-center text-center">
      <div>
        <BrainCircuit className="mx-auto h-12 w-12 text-[#c7a329]" />
        <h3 className="mt-4 text-4xl font-black tracking-[-0.06em]">
          Mulai dengan tujuan yang jelas.
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-7 text-white/48">
          Contoh: “Audit landing page DLAVIE dan beri struktur layout yang lebih
          mudah dipahami.”
        </p>
      </div>
    </div>
  );
}

function ThinkingBlock({ tools, mode }: { tools: ToolId[]; mode: Mode }) {
  return (
    <div className="dlv-ai-thinking rounded-[1.6rem] p-4">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-[#c7a329]" />
        <p className="font-black">Dlavie AI berpikir dalam mode {mode}...</p>
      </div>
      <div className="mt-3 grid gap-2 text-sm font-semibold text-white/54 sm:grid-cols-3">
        {[
          "Membaca konteks",
          tools.includes("web-search")
            ? "Grounding web aktif"
            : "Menjaga jawaban internal",
          "Menyusun output",
        ].map((item) => (
          <span key={item} className="rounded-full bg-white/[0.06] px-3 py-2">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-[1.55rem] p-4 ${isUser ? "bg-[#c7a329] text-[#070605]" : "border border-white/10 bg-white/[0.06] text-white"}`}
      >
        <div className="prose prose-invert max-w-none text-sm font-semibold leading-7">
          <RichText text={message.content} />
        </div>
        {!isUser ? (
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/36">
            <span>{message.model}</span>
            {message.usage ? (
              <span>{formatNumber(message.usage)} usage</span>
            ) : null}
            {message.tools?.map((tool) => (
              <span key={tool}>{tool}</span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ToolPanel({
  active,
  toggle,
  plan,
}: {
  active: ToolId[];
  toggle: (tool: ToolId) => void;
  plan: DlavieAiPlan;
}) {
  return (
    <div className="mb-3 grid gap-2 rounded-[1.4rem] border border-white/10 bg-[#0b0a07] p-3 sm:grid-cols-2 lg:grid-cols-4">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const locked = !canUse(tool.plan, plan);
        return (
          <button
            key={tool.id}
            onClick={() => toggle(tool.id)}
            className={`rounded-[1.1rem] p-3 text-left transition ${active.includes(tool.id) ? "bg-[#c7a329] text-[#080705]" : "bg-white/[0.055] text-white/70"} ${locked ? "opacity-45" : "hover:-translate-y-1"}`}
          >
            <Icon className="h-4 w-4" />
            <p className="mt-2 text-xs font-black">{tool.label}</p>
            <p className="mt-1 text-[11px] font-semibold opacity-70">
              {locked ? `Mulai ${dlavieAiPlans[tool.plan].name}` : tool.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    if (match.index > last)
      parts.push(
        <p key={last} className="whitespace-pre-wrap">
          {text.slice(last, match.index)}
        </p>,
      );
    parts.push(
      <CodeBlock key={match.index} lang={match[1] || "code"} code={match[2]} />,
    );
    last = regex.lastIndex;
  }
  if (last < text.length)
    parts.push(
      <p key={last} className="whitespace-pre-wrap">
        {text.slice(last)}
      </p>,
    );
  return <>{parts}</>;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-white/10 bg-black/55">
      <div className="flex items-center justify-between bg-white/[0.06] px-4 py-2 text-xs font-black text-white/52">
        <span>
          <Code2 className="mr-2 inline h-4 w-4" />
          {lang}
        </span>
        <button
          onClick={() => copyText(code)}
          className="rounded-full bg-white/10 px-3 py-1"
        >
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Playground({
  selected,
  setModel,
  models,
  accessPlan,
}: {
  selected: string;
  setModel: (model: AiModel) => void;
  models: AiModel[];
  accessPlan: DlavieAiPlan;
}) {
  return (
    <Panel
      title="Model Playground"
      subtitle="Model tidak lagi terasa sama: setiap pilihan punya plan gate, multiplier, prompt behavior, dan provider route berbeda di backend."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {models.map((item) => {
          const locked = !canUse(item.plan, accessPlan);
          return (
            <button
              key={item.id}
              onClick={() => !locked && setModel(item)}
              className={`dlv-ai-option rounded-[1.6rem] p-5 text-left ${selected === item.id ? "ring-2 ring-[#c7a329]" : ""} ${locked ? "opacity-45" : ""}`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c7a329]">
                {item.tier}
              </p>
              <h3 className="mt-3 text-2xl font-black">{item.name}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/55">
                {item.specialty}
              </p>
              <p className="mt-4 text-xs font-black text-white/38">
                {locked
                  ? `Terkunci sampai ${dlavieAiPlans[item.plan].name}`
                  : `${item.latency} · Usage ${item.usage}`}
              </p>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function Workspace({
  setTab,
  setQ,
}: {
  setTab: (tab: Tab) => void;
  setQ: (q: string) => void;
}) {
  const templates = [
    "Bangun landing page premium",
    "Audit bug checkout",
    "Riset kompetitor commerce",
    "Buat workflow agent support",
    "Optimasi prompt AI brand",
    "Mapping database Supabase",
  ];
  return (
    <Panel
      title="Workspace & Tabs"
      subtitle="Template kerja seperti Replit: pilih tab, lanjutkan prompt, dan AI menjelaskan langkahnya."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((item) => (
          <button
            key={item}
            onClick={() => {
              setQ(item);
              setTab("chat");
            }}
            className="dlv-ai-option rounded-[1.5rem] p-4 text-left"
          >
            <TerminalSquare className="h-5 w-5 text-[#c7a329]" />
            <h3 className="mt-4 font-black">{item}</h3>
            <p className="mt-2 text-sm font-semibold text-white/48">
              Kirim sebagai job ke chat.
            </p>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function Pricing({
  billing,
  setBilling,
  access,
  purchasePlan,
  packs,
  buyCredits,
  purchaseBusy,
}: {
  billing: Billing;
  setBilling: (billing: Billing) => void;
  access: Access;
  purchasePlan: (plan: DlavieAiPlan) => void;
  packs: DlavieAiPack[];
  buyCredits: (pack: DlavieAiPack) => void;
  purchaseBusy: string | null;
}) {
  const planIds: DlavieAiPlan[] = ["free", "basic", "core", "custom"];
  return (
    <Panel
      title="Pricing yang benar-benar aktif"
      subtitle="Upgrade plan mengubah database profil: plan, daily quota, model access, tools, dan behavior backend."
    >
      <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.06] p-1">
        <button
          onClick={() => setBilling("month")}
          className={`rounded-full px-4 py-2 text-xs font-black ${billing === "month" ? "bg-white text-[#080705]" : "text-white/55"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("year")}
          className={`rounded-full px-4 py-2 text-xs font-black ${billing === "year" ? "bg-[#c7a329] text-[#080705]" : "text-white/55"}`}
        >
          Yearly
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {planIds.map((plan) => {
          const config = dlavieAiPlans[plan];
          const price =
            billing === "month" ? config.monthlyPrice : config.yearlyPrice;
          const active = access.plan === plan;
          return (
            <article
              key={plan}
              className={`dlv-ai-panel rounded-[1.7rem] p-5 ${active ? "ring-2 ring-[#c7a329]" : ""}`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c7a329]">
                {config.badge}
              </p>
              <h3 className="mt-3 text-2xl font-black">
                {config.name.replace("Dlavie AI ", "")}
              </h3>
              <p className="mt-3 text-3xl font-black">{formatRupiah(price)}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/50">
                {config.description}
              </p>
              <ul className="mt-5 space-y-2 text-sm font-semibold text-white/58">
                {config.features.slice(0, 5).map((feature) => (
                  <li key={feature}>
                    <Check className="mr-2 inline h-4 w-4 text-[#c7a329]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => purchasePlan(plan)}
                disabled={plan === "free" || active || purchaseBusy !== null}
                className="mt-5 w-full rounded-2xl bg-[#c7a329] px-4 py-3 text-sm font-black text-[#080705] disabled:opacity-45"
              >
                {active
                  ? "Aktif"
                  : plan === "free"
                    ? "Default"
                    : "Aktifkan Plan"}
              </button>
            </article>
          );
        })}
      </div>
      <h3 className="mt-8 text-2xl font-black">Overage Usage Store</h3>
      <p className="mt-2 text-sm font-semibold text-white/48">
        Dipakai jika kuota harian habis. Free tetap bisa memakai kuota gratis
        tanpa membeli token.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {packs.map((pack) => (
          <button
            key={pack.id}
            onClick={() => buyCredits(pack)}
            disabled={
              purchaseBusy !== null || access.dBalance < pack.priceDBalance
            }
            className="dlv-ai-option rounded-[1.4rem] p-4 text-left disabled:opacity-45"
          >
            <p className="font-black">{pack.badge}</p>
            <p className="mt-1 text-sm font-semibold text-white/48">
              {pack.description}
            </p>
            <p className="mt-3 text-[#c7a329] font-black">
              {formatNumber(pack.priceDBalance)} D Balance
            </p>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function ActivityPanel({
  access,
  messages,
}: {
  access: Access;
  messages: ChatMessage[];
}) {
  return (
    <Panel
      title="Usage & Activity"
      subtitle="Transparan: plan, quota, session, dan action AI terlihat jelas."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Plan" value={access.name} />
        <Metric
          label="Daily usage"
          value={`${formatNumber(access.dailyUsed)} / ${formatNumber(access.dailyQuota)}`}
        />
        <Metric
          label="Overage units"
          value={formatNumber(access.aiTokenBalance)}
        />
      </div>
      <div className="mt-5 space-y-2">
        {messages.slice(-8).map((message) => (
          <div
            key={message.id}
            className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-sm font-semibold text-white/58"
          >
            {message.role.toUpperCase()} · {message.content.slice(0, 140)}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="dlv-ai-option rounded-[1.4rem] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/36">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}
function StatusCard({
  access,
  mode,
  model,
  tools,
}: {
  access: Access;
  mode: Mode;
  model: AiModel;
  tools: ToolId[];
}) {
  return (
    <div className="dlv-ai-panel rounded-[1.7rem] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c7a329]">
        System
      </p>
      <h2 className="mt-2 text-2xl font-black">{access.name}</h2>
      <div className="mt-4 space-y-2 text-sm font-semibold text-white/55">
        <p>
          <Bot className="mr-2 inline h-4 w-4" />
          {model.name}
        </p>
        <p>
          <BrainCircuit className="mr-2 inline h-4 w-4" />
          {mode}
        </p>
        <p>
          <MousePointer2 className="mr-2 inline h-4 w-4" />
          {tools.length} tools active
        </p>
        <p>
          <ShieldCheck className="mr-2 inline h-4 w-4" />
          {access.authenticated ? "Database connected" : "Login required"}
        </p>
      </div>
    </div>
  );
}
function ModePicker({
  mode,
  setMode,
  plan,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  plan: DlavieAiPlan;
}) {
  return (
    <div className="dlv-ai-panel rounded-[1.7rem] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c7a329]">
        Thinking mode
      </p>
      <div className="mt-3 grid gap-2">
        {modeCards.map((item) => {
          const locked =
            (item.id === "agent" || item.id === "research") &&
            !canUse("core", plan);
          return (
            <button
              key={item.id}
              disabled={locked}
              onClick={() => setMode(item.id)}
              className={`rounded-2xl p-3 text-left ${mode === item.id ? "bg-[#c7a329] text-[#080705]" : "bg-white/[0.055] text-white/62"} disabled:opacity-40`}
            >
              <p className="text-sm font-black">{item.title}</p>
              <p className="mt-1 text-xs font-semibold opacity-70">
                {locked ? "Mulai Core" : item.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="dlv-ai-panel rounded-[2rem] p-5 sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c7a329]">
        Dlavie AI OS
      </p>
      <h2 className="mt-3 text-4xl font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-white/52">
        {subtitle}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
