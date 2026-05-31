import type { NextApiRequest, NextApiResponse } from "next";
import { bearerToken, verifySupabaseUser } from "@/lib/auth-server";
import { estimateAiCharge } from "@/lib/dlavie-ai-credits";
import {
  getDlavieAiPlanConfig,
  getDlavieAiSystemPrompt,
  normalizeDlavieAiPlan,
  type DlavieAiPlan,
} from "@/lib/dlavie-ai-plans";
import { getGeminiClient } from "@/lib/gemini";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const todayKey = () => new Date().toISOString().slice(0, 10);
const SAFE_PROVIDER_ERROR =
  "Dlavie AI sedang tidak dapat memproses jawaban. Admin perlu memperbarui konfigurasi AI provider.";
const MAX_IMAGE_ATTACHMENTS = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

type ClientAttachment = {
  name?: string;
  type?: string;
  text?: string;
  inline?: string;
  size?: number;
};

type RuntimeModel = {
  modelId: string;
  displayName: string;
  providerModel: string;
  promptHint: string;
  tokenMultiplier: number;
};

type ContextMessage = { role?: string; content?: string };

function looksLikeProviderFailure(value: string) {
  const text = String(value || "")
    .toLowerCase()
    .trim();
  return (
    text.includes("permission_denied") ||
    text.includes("403") ||
    text.startsWith('{"error"') ||
    text.startsWith('{\n  "error"')
  );
}

function resolveRuntimeModel(
  modelId: unknown,
  plan: DlavieAiPlan,
  defaultModel: string,
): RuntimeModel {
  const id = String(modelId || "dlavie-x-mini");
  const isPremium = plan === "core" || plan === "custom";

  if (id === "dlavie-x-lite") {
    return {
      modelId: id,
      displayName: "Dlavie X Lite",
      providerModel: process.env.DLAVIE_MODEL_X_LITE || "gemini-2.5-flash-lite",
      promptHint: "Prioritaskan jawaban cepat, pendek, dan hemat token.",
      tokenMultiplier: 0.8,
    };
  }

  if (id === "dlavie-1-5" && isPremium) {
    return {
      modelId: id,
      displayName: "Dlavie 1.5",
      providerModel: process.env.DLAVIE_MODEL_1_5 || "gemini-2.5-flash",
      promptHint:
        "Berikan analisis matang, struktur jelas, dan rekomendasi praktis.",
      tokenMultiplier: 1.4,
    };
  }

  if (id === "dlavie-1-5-preview" && isPremium) {
    return {
      modelId: id,
      displayName: "Dlavie 1.5 Preview",
      providerModel:
        process.env.DLAVIE_MODEL_1_5_PREVIEW ||
        process.env.DLAVIE_MODEL_1_5 ||
        "gemini-2.5-pro",
      promptHint:
        "Eksplorasi solusi kreatif, tetapi tetap beri batasan dan risiko.",
      tokenMultiplier: 1.8,
    };
  }

  if ((id === "dlavie-x-3" || id === "dlavie-agent-pro") && isPremium) {
    return {
      modelId: id,
      displayName:
        id === "dlavie-agent-pro" ? "Dlavie Agent Pro" : "Dlavie X 3",
      providerModel:
        process.env.DLAVIE_MODEL_X3 ||
        process.env.DLAVIE_MODEL_CORE ||
        "gemini-2.5-pro",
      promptHint:
        "Gunakan reasoning mendalam, audit edge case, dan berikan hasil production-ready.",
      tokenMultiplier: id === "dlavie-agent-pro" ? 3 : 2.2,
    };
  }

  return {
    modelId: "dlavie-x-mini",
    displayName: "Dlavie X Mini",
    providerModel: process.env.DLAVIE_MODEL_X_MINI || "gemini-2.5-flash",
    promptHint: "Jawab seimbang, jelas, dan langsung bisa digunakan.",
    tokenMultiplier: 1,
  };
}

function parseInlineImage(value: string) {
  const raw = String(value || "");
  if (!raw.startsWith("data:image/") || !raw.includes(",")) return null;

  const [meta, payload] = raw.split(",", 2);
  const mimeType = meta.slice(5).split(";")[0];
  const estimatedBytes = Math.ceil((payload.length * 3) / 4);

  if (!mimeType.startsWith("image/")) return null;
  if (estimatedBytes > MAX_IMAGE_BYTES) return null;

  return { mimeType, payload, estimatedBytes };
}

function normalizeAttachments(input: unknown) {
  const source = Array.isArray(input) ? input : [];
  const images: {
    name: string;
    mimeType: string;
    payload: string;
    estimatedBytes: number;
  }[] = [];
  const texts: string[] = [];

  for (const item of source as ClientAttachment[]) {
    const name = String(item?.name || "attachment").slice(0, 120);
    const text = String(item?.text || "").trim();
    if (text) texts.push(`File ${name}:\n${text.slice(0, 6000)}`);

    const parsed = parseInlineImage(String(item?.inline || ""));
    if (parsed && images.length < MAX_IMAGE_ATTACHMENTS)
      images.push({ name, ...parsed });
  }

  return { images, texts };
}

function buildContents(input: {
  systemPrompt: string;
  message: string;
  mode: string;
  runtimeModel: RuntimeModel;
  attachments: ReturnType<typeof normalizeAttachments>;
  contextMessages?: ContextMessage[];
  onboarding?: Record<string, unknown>;
}) {
  const imageInstruction = input.attachments.images.length
    ? "\n\nGambar dilampirkan. Analisis gambar secara langsung. Jika user meminta rating foto, berikan skor 1-10, alasan visual, kekuatan, kekurangan, dan saran peningkatan yang spesifik."
    : "";

  const fileContext = input.attachments.texts.length
    ? `\n\nKonteks file:\n${input.attachments.texts.join("\n\n")}`
    : "";

  const contextWindow = (input.contextMessages || [])
    .slice(-5)
    .map((item) => `${String(item.role || "user")}: ${String(item.content || "").slice(0, 1200)}`)
    .join("
");
  const profileMemory = input.onboarding
    ? `

Memory onboarding user:
- Nama: ${String(input.onboarding.name || "Belum diisi")}
- Tujuan: ${String(input.onboarding.purpose || "General")}
- Profesi: ${String(input.onboarding.profession || "Belum diisi")}
- Sumber: ${String(input.onboarding.source || "Belum diisi")}`
    : "";

  const modeInstruction = `

Mode user: ${input.mode}. Model Dlavie aktif: ${input.runtimeModel.displayName}. ${input.runtimeModel.promptHint}`;

  const text = `${input.systemPrompt}${modeInstruction}${profileMemory}${fileContext}${imageInstruction}${
    contextWindow ? `

Konteks 5 chat terakhir:
${contextWindow}` : ""
  }

Pertanyaan user:
${input.message}`;

  if (!input.attachments.images.length) return text;

  return [
    {
      role: "user",
      parts: [
        { text },
        ...input.attachments.images.map((image) => ({
          inlineData: {
            mimeType: image.mimeType,
            data: image.payload,
          },
        })),
      ],
    },
  ];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const user = await verifySupabaseUser(
      bearerToken(req.headers.authorization),
    );
    if (!user?.id || !user.email) {
      return res
        .status(401)
        .json({ error: "Login diperlukan untuk menggunakan Dlavie AI." });
    }

    const email = user.email.toLowerCase();
    const message = String(req.body?.message || "").trim();
    const clientMode = String(req.body?.mode || "thinking");
    const requestedTools = Array.isArray(req.body?.tools)
      ? req.body.tools.map(String).filter(Boolean)
      : [];
    const contextMessages = Array.isArray(req.body?.contextMessages)
      ? (req.body.contextMessages as ContextMessage[]).slice(-5)
      : [];
    const onboarding =
      req.body?.onboarding && typeof req.body.onboarding === "object"
        ? (req.body.onboarding as Record<string, unknown>)
        : {};
    const temperature = Math.max(
      0,
      Math.min(1, Number(req.body?.temperature ?? 0.56)),
    );
    const desiredMaxTokens = Math.max(
      256,
      Math.min(4096, Number(req.body?.desiredMaxTokens ?? 1400)),
    );
    const engine = String(req.body?.engine || "cloud").slice(0, 80);
    let sessionId = String(req.body?.sessionId || "").trim();

    if (!message) return res.status(400).json({ error: "Message is required" });

    const attachments = normalizeAttachments(req.body?.attachments);

    const supabase = createSupabaseServiceClient();
    const profile = await supabase
      .from("profiles")
      .select(
        "dlavie_ai_plan, dlavie_ai_daily_quota, dlavie_ai_daily_used, dlavie_ai_usage_date, ai_token_balance",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profile.error)
      return res
        .status(500)
        .json({ error: "Profil Dlavie belum bisa dimuat." });
    if (!profile.data) {
      return res.status(403).json({
        error:
          "Profil Dlavie belum tersedia. Login ulang atau buka dashboard terlebih dahulu.",
      });
    }

    const plan = normalizeDlavieAiPlan(profile.data.dlavie_ai_plan);
    const planConfig = getDlavieAiPlanConfig(plan);
    const runtimeModel = resolveRuntimeModel(
      req.body?.modelId,
      plan,
      planConfig.model,
    );

    const usageDate = String(
      profile.data.dlavie_ai_usage_date || todayKey(),
    ).slice(0, 10);
    const used =
      usageDate === todayKey()
        ? Number(profile.data.dlavie_ai_daily_used || 0)
        : 0;
    const quota = Number(
      profile.data.dlavie_ai_daily_quota || planConfig.dailyQuota,
    );
    const remaining = Math.max(quota - used, 0);
    const currentAiTokens = Number(profile.data.ai_token_balance || 0);

    if (plan === "free") {
      const rateLimit = await supabase.rpc("dlavie_ai_rate_limit", {
        p_user_id: user.id,
        p_limit: 10,
      });
      const limiter = Array.isArray(rateLimit.data) ? rateLimit.data[0] : null;
      if (!rateLimit.error && limiter && limiter.allowed === false) {
        return res.status(429).json({
          error:
            "Batas 10 pesan/jam habis. Tunggu reset kuota atau upgrade ke Dlavie Pro/Max.",
          rateLimit: limiter,
        });
      }
    }

    const imageUnits = attachments.images.reduce((sum, image) => {
      return sum + Math.ceil(image.estimatedBytes / 1024);
    }, 0);

    const estimatedMinimum = Math.ceil(
      (Math.ceil(message.length / 4) + imageUnits) *
        runtimeModel.tokenMultiplier,
    );

    if (message.length > planConfig.maxInputChars) {
      return res
        .status(413)
        .json({ error: `Pesan terlalu panjang untuk ${planConfig.name}.` });
    }

    const useOverage = remaining <= 0;

    if (useOverage && currentAiTokens < estimatedMinimum) {
      return res.status(429).json({
        error: `Kuota harian ${planConfig.name} sudah habis. Beli overage usage jika ingin lanjut hari ini.`,
        plan,
        remaining: 0,
        aiTokenBalance: currentAiTokens,
      });
    }

    if (!sessionId) {
      const created = await supabase
        .from("ai_chat_sessions")
        .insert({
          user_email: email,
          title: message.slice(0, 48) || "Dlavie AI Chat",
          dlavie_ai_plan: plan,
        })
        .select("id")
        .single();

      if (created.error || !created.data) {
        return res
          .status(500)
          .json({ error: "Session Dlavie AI gagal dibuat." });
      }

      sessionId = created.data.id;
    }

    await supabase.from("ai_chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: attachments.images.length
        ? `${message}\n\n[${attachments.images.length} image attachment analyzed]`
        : message,
      dlavie_ai_plan: plan,
    });

    let reply = "";

    try {
      const ai = getGeminiClient();
      const result = await ai.models.generateContent({
        model: runtimeModel.providerModel,
        contents: buildContents({
          systemPrompt: `${getDlavieAiSystemPrompt(plan)}

Tools aktif dari user: ${requestedTools.join(", ") || "none"}. Jika web-search aktif, gunakan grounding/search bila tersedia, jelaskan sumber secara ringkas, dan jangan menebak. Jika code-audit aktif, beri audit terstruktur. Jika database-map aktif, jelaskan asumsi tabel dan risiko data.`,
          message,
          mode: clientMode,
          runtimeModel,
          attachments,
          contextMessages,
          onboarding,
        }) as any,
        config: {
          temperature,
          maxOutputTokens: desiredMaxTokens,
          ...(requestedTools.includes("web-search")
            ? { tools: [{ googleSearch: {} }] }
            : {}),
        } as any,
      });

      reply = result.text?.trim() || "";
    } catch {
      return res.status(502).json({
        error: SAFE_PROVIDER_ERROR,
        code: "AI_PROVIDER_UNAVAILABLE",
        sessionId,
        plan,
        planName: planConfig.name,
      });
    }

    if (!reply || looksLikeProviderFailure(reply)) {
      return res.status(502).json({
        error: SAFE_PROVIDER_ERROR,
        code: "AI_PROVIDER_UNAVAILABLE",
        sessionId,
        plan,
        planName: planConfig.name,
      });
    }

    const charge = estimateAiCharge({
      message: `${message}\n${attachments.texts.join("\n")}`,
      reply,
      plan,
    });

    const usageUnits = Math.ceil(
      (charge.charged + imageUnits) * runtimeModel.tokenMultiplier,
    );
    const chargedTokens = useOverage
      ? Math.min(usageUnits, currentAiTokens)
      : 0;

    const nextAiTokens = Math.max(currentAiTokens - chargedTokens, 0);

    await supabase.from("ai_chat_messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: reply,
      dlavie_ai_plan: plan,
    });

    await supabase
      .from("profiles")
      .update({
        ai_token_balance: nextAiTokens,
        dlavie_ai_daily_used: used + 1,
        dlavie_ai_usage_date: todayKey(),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    await supabase.from("usage_logs").insert({
      user_id: user.id,
      event: "chat_event",
      metadata: {
        sessionId,
        plan,
        engine,
        model: runtimeModel.displayName,
        tools: requestedTools,
        usageUnits,
      },
    });

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "ai_token_usage",
      amount: -chargedTokens,
      status: "success",
      provider: "dlavie-ai",
      reference: `ai-use-${sessionId}-${Date.now()}`,
      metadata: {
        sessionId,
        plan,
        dlavieModel: runtimeModel.displayName,
        providerModel: runtimeModel.providerModel,
        tools: requestedTools,
        usageUnits,
        includedQuota: !useOverage,
        imageAttachments: attachments.images.length,
        textAttachments: attachments.texts.length,
        inputUnits: charge.inputUnits,
        outputUnits: charge.outputUnits,
        multiplier: runtimeModel.tokenMultiplier,
        aiTokenBefore: currentAiTokens,
        aiTokenAfter: nextAiTokens,
      },
    });

    return res.status(200).json({
      sessionId,
      reply,
      plan,
      planName: planConfig.name,
      modelName: runtimeModel.displayName,
      providerModel: runtimeModel.providerModel,
      remaining: Math.max(remaining - 1, 0),
      aiTokenBalance: nextAiTokens,
      usageUnits,
      chargedTokens,
      includedQuota: !useOverage,
      trace: [
        `Plan gate: ${planConfig.name}`,
        `Model route: ${runtimeModel.displayName} -> ${runtimeModel.providerModel}`,
        `Mode: ${clientMode}`,
        `Engine: ${engine}`,
        `Temperature: ${temperature}`,
        `Context window: ${contextMessages.length} message(s)`,
        `Tools: ${requestedTools.join(", ") || "none"}`,
        useOverage
          ? "Quota exhausted: overage usage deducted"
          : "Included daily quota used",
      ],
      vision: attachments.images.length > 0,
    });
  } catch {
    return res.status(500).json({
      error: "Dlavie AI sedang bermasalah. Coba lagi sebentar.",
      code: "DLAVIE_AI_FAILED",
    });
  }
}
