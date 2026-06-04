import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { DLAVIE_ACCESS_COOKIE } from '@/src/lib/supabase/session';
import { getSupabaseAuthEndpoint, getSupabaseRequestHeaders } from '@/src/lib/supabase/url';

export const runtime = 'nodejs';

const dlavieAiModes = ['fast', 'smart', 'agent', 'research', 'private'] as const;
type DlavieAiMode = (typeof dlavieAiModes)[number];

type DlavieAiChatResponse = {
  ok: boolean;
  answer: string;
  source: 'model' | 'fallback';
  mode: DlavieAiMode;
  error?: {
    code: string;
    message: string;
  };
};

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  mode: z.enum(dlavieAiModes).default('fast'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const SYSTEM_PROMPT = `You are DLavie AI, the official assistant for the DLavie ecosystem.

Your role:
- Help users understand DLavie products, account access, commerce, PPOB, website projects, automation, and support workflows.
- Answer clearly in the user's language.
- If the user greets you, greet back warmly and explain what you can help with.
- If the user asks about account, PPOB, commerce, websites, automation, or DLavie products, provide practical next steps.
- If private account data is not available, say so honestly.
- Never claim to complete payments, orders, account changes, or protected actions unless a verified tool result is provided.
- For operational tasks, suggest safe next steps and ask for the minimum needed context.
- Be concise, helpful, calm, and professional.`;

const GREETING_ANSWER =
  'Hi, saya DLavie AI. Saya bisa membantu soal akun DLavie, PPOB, commerce, website, automation, atau menyusun rencana kerja. Mau mulai dari apa?';

const SAFE_FALLBACK_ANSWER =
  'DLavie AI sedang kesulitan terhubung ke model utama. Saya tetap bisa membantu dengan mode aman: jelaskan kebutuhan Anda, misalnya akun, PPOB, website, atau automation.';

function json(payload: DlavieAiChatResponse, status = 200) {
  return NextResponse.json(payload, { status });
}

function isGreeting(message: string) {
  return /^(hi|hai|halo|hello|hey|selamat\s+(pagi|siang|sore|malam))[!.\s]*$/i.test(message.trim());
}

async function validateCookieUser(request: NextRequest) {
  const token = request.cookies.get(DLAVIE_ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const headers = getSupabaseRequestHeaders();
    headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(getSupabaseAuthEndpoint('/user'), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) return null;
    const user = (await response.json().catch(() => null)) as { id?: string } | null;
    return user?.id ? { id: user.id, token } : null;
  } catch {
    return null;
  }
}

function toServiceMode(mode: DlavieAiMode) {
  if (mode === 'agent') return 'webdev' as const;
  if (mode === 'research') return 'dlavie' as const;
  return 'general' as const;
}

async function readRequestJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  const parsed = chatRequestSchema.safeParse(await readRequestJson(request));

  if (!parsed.success) {
    return json(
      {
        ok: false,
        answer: 'Tulis pertanyaan singkat agar DLavie AI bisa membantu dengan jelas.',
        source: 'fallback',
        mode: 'fast',
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Pertanyaan belum dapat diproses. Coba tulis ulang dengan lebih singkat.',
        },
      },
      400,
    );
  }

  const { message, mode, metadata } = parsed.data;

  if (isGreeting(message)) {
    return json({ ok: true, answer: GREETING_ANSWER, source: 'fallback', mode });
  }

  const account = await validateCookieUser(request);
  if (!account) {
    return json({ ok: true, answer: SAFE_FALLBACK_ANSWER, source: 'fallback', mode });
  }

  try {
    const { chatService } = await import('@/src/server/services');
    const result = await chatService.send(
      account.id,
      {
        mode: toServiceMode(mode),
        use_rag: mode === 'research' || mode === 'smart',
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        metadata: {
          ...(metadata ?? {}),
          dlavie_ai_mode: mode,
          channel: 'www-ai-app-shell',
        },
      },
      Date.now(),
    );

    return json({ ok: true, answer: result.answer || SAFE_FALLBACK_ANSWER, source: 'model', mode });
  } catch {
    return json({ ok: true, answer: SAFE_FALLBACK_ANSWER, source: 'fallback', mode });
  }
}
