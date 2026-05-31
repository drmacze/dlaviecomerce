import { safePrompt, estimateTokens } from "@/utils/dlavie-ai-format";

export type DlavieTier = "free" | "basic" | "core" | "custom" | "pro" | "max";
export type OrchestratorInput = {
  prompt: string;
  tier: DlavieTier;
  modelId: string;
  mode: string;
  tools: string[];
  sessionId?: string;
  accessToken?: string;
  contextMessages: { role: "user" | "assistant"; content: string }[];
  onboarding: Record<string, string>;
  signal?: AbortSignal;
};

function dynamicTemperature(prompt: string) {
  const tokens = estimateTokens(prompt);
  if (/kode|debug|error|arsitektur|database|sql|security/i.test(prompt)) return 0.28;
  if (/ide|konten|puisi|campaign|brand|visual/i.test(prompt)) return 0.82;
  return tokens > 600 ? 0.38 : 0.56;
}

async function tryWebLlm(prompt: string) {
  const cacheKey = "dlavie-core-lite-webllm-ready";
  if (typeof window === "undefined") throw new Error("WebLLM only runs in browser");
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  if (memory < 3) throw new Error("Perangkat hemat RAM dialihkan ke cloud fallback.");
  window.localStorage.setItem(cacheKey, "warming");
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  window.localStorage.setItem(cacheKey, "cached");
  throw new Error("WebLLM package belum diaktifkan di build production; memakai cloud fallback aman.");
}

export async function runDlavieAi(input: OrchestratorInput) {
  const prompt = safePrompt(input.prompt);
  const temperature = dynamicTemperature(prompt);
  const desiredMaxTokens = Math.min(4096, Math.max(512, estimateTokens(prompt) * 3));
  let engine = input.tier === "free" ? "webllm-core-lite" : "cloud";
  let fallbackReason = "";

  if (input.tier === "free") {
    try {
      await tryWebLlm(prompt);
    } catch (error) {
      engine = "cloud-free-fallback";
      fallbackReason = error instanceof Error ? error.message : "WebLLM fallback aktif.";
    }
  }

  const res = await fetch("/api/ai/persistent-chat", {
    method: "POST",
    signal: input.signal,
    headers: {
      "Content-Type": "application/json",
      ...(input.accessToken ? { Authorization: `Bearer ${input.accessToken}` } : {}),
    },
    body: JSON.stringify({
      message: prompt,
      sessionId: input.sessionId,
      mode: input.mode,
      modelId: input.modelId,
      tools: input.tools,
      contextMessages: input.contextMessages.slice(-5),
      onboarding: input.onboarding,
      temperature,
      desiredMaxTokens,
      engine,
      fallbackReason,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Dlavie AI belum bisa menjawab saat ini.");
  return { ...data, engine, fallbackReason, temperature, desiredMaxTokens };
}
