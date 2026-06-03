import { env } from '../../config/env.js';
import type { ChatMode, ModelRoute } from '../../types/ai.js';

type RouteInput = { mode: ChatMode; messageTokens: number; useRag: boolean; fallback?: boolean };
export class ModelRouterService {
  route(input: RouteInput): ModelRoute {
    const providerName = input.fallback ? env.FALLBACK_AI_PROVIDER : env.PRIMARY_AI_PROVIDER;
    const model = input.fallback
      ? (env.HUGGINGFACE_CHAT_MODEL ?? 'fallback-model')
      : env.OPENAI_CHAT_MODEL;
    const baseMax = input.messageTokens > 6000 ? 2048 : 4096;
    const maxTokens = input.useRag ? Math.min(baseMax, 3072) : baseMax;
    const temperature = input.mode === 'webdev' ? 0.2 : input.mode === 'general' ? 0.5 : 0.35;
    return { providerName, model, temperature, maxTokens };
  }
}
