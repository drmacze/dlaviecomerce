import { AppError } from '../../lib/errors';
import type { ChatInput, ChatOutput, ChatStreamChunk } from '../../types/ai';
import type { AIProvider } from './ai-provider.interface';

type Config = { apiKey: string | undefined; baseUrl: string; name?: string };
export class OpenAICompatibleProvider implements AIProvider {
  name: string;
  constructor(private config: Config) {
    this.name = config.name ?? 'openai';
  }
  async chat(input: ChatInput): Promise<ChatOutput> {
    if (!this.config.apiKey)
      throw new AppError('AI_PROVIDER_ERROR', `${this.name} API key is not configured.`, 502);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const res = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: input.model,
          messages: input.messages,
          temperature: input.temperature,
          max_tokens: input.max_tokens,
        }),
      });
      if (!res.ok)
        throw new AppError('AI_PROVIDER_ERROR', `${this.name} chat request failed.`, 502, {
          status: res.status,
        });
      const json = (await res.json()) as any;
      const content = json.choices?.[0]?.message?.content;
      if (typeof content !== 'string')
        throw new AppError('AI_PROVIDER_ERROR', `${this.name} returned an invalid response.`, 502);
      const usage = json.usage ?? {};
      return {
        content,
        provider: this.name,
        model: input.model,
        usage: {
          prompt_tokens: usage.prompt_tokens ?? 0,
          completion_tokens: usage.completion_tokens ?? 0,
          total_tokens: usage.total_tokens ?? 0,
        },
        raw: json,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && error.name === 'AbortError')
        throw new AppError('AI_PROVIDER_TIMEOUT', `${this.name} timed out.`, 504);
      throw new AppError('AI_PROVIDER_ERROR', `${this.name} provider error.`, 502);
    } finally {
      clearTimeout(timeout);
    }
  }
  async *streamChat(input: ChatInput): AsyncIterable<ChatStreamChunk> {
    const out = await this.chat(input);
    yield { delta: out.content, done: true, usage: out.usage };
  }
}
