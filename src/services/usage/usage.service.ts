import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
export class UsageService {
  async log(input: {
    userId?: string;
    route: string;
    provider?: string;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latencyMs?: number;
    status: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }) {
    if (!env.ENABLE_USAGE_LOGGING) return;
    try {
      await (getSupabaseAdmin() as any).from('usage_logs').insert({
        user_id: input.userId,
        route: input.route,
        provider: input.provider,
        model: input.model,
        prompt_tokens: input.promptTokens ?? 0,
        completion_tokens: input.completionTokens ?? 0,
        total_tokens: input.totalTokens ?? 0,
        latency_ms: input.latencyMs,
        status: input.status,
        error_message: input.errorMessage,
        metadata: input.metadata ?? {},
      });
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : 'unknown' },
        'usage logging failed',
      );
    }
  }
}
