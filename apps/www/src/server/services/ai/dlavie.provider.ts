import { AppError } from '../../lib/errors';
import type { ChatInput, ChatOutput, ChatStreamChunk, Usage } from '../../types/ai';
import type { AIProvider } from './ai-provider.interface';

type DlavieProviderConfig = {
  apiKey: string | undefined;
  apiUrl: string | undefined;
  timeoutMs: number;
  name?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function contentToString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const text = value
      .map((part) => {
        if (typeof part === 'string') return part;
        if (!isRecord(part)) return '';
        return contentToString(part.text) ?? contentToString(part.content) ?? '';
      })
      .join('')
      .trim();
    return text.length > 0 ? text : undefined;
  }

  return undefined;
}

function firstText(...values: unknown[]): string | undefined {
  for (const value of values) {
    const text = contentToString(value);
    if (text) return text;
  }
  return undefined;
}

function readUsage(value: unknown): Usage {
  if (!isRecord(value)) return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

  const promptTokens = Number(value.prompt_tokens ?? value.promptTokens ?? 0);
  const completionTokens = Number(value.completion_tokens ?? value.completionTokens ?? 0);
  const totalTokens = Number(value.total_tokens ?? value.totalTokens ?? promptTokens + completionTokens);

  return {
    prompt_tokens: Number.isFinite(promptTokens) ? promptTokens : 0,
    completion_tokens: Number.isFinite(completionTokens) ? completionTokens : 0,
    total_tokens: Number.isFinite(totalTokens) ? totalTokens : 0,
  };
}

function extractAssistantContent(payload: unknown): string | undefined {
  if (!isRecord(payload)) return contentToString(payload);

  const firstChoice = Array.isArray(payload.choices) ? payload.choices[0] : undefined;
  const choice = isRecord(firstChoice) ? firstChoice : undefined;
  const choiceMessageValue = choice?.message;
  const choiceDeltaValue = choice?.delta;
  const payloadMessageValue = payload.message;
  const payloadDataValue = payload.data;
  const choiceMessage = isRecord(choiceMessageValue) ? choiceMessageValue : undefined;
  const choiceDelta = isRecord(choiceDeltaValue) ? choiceDeltaValue : undefined;
  const payloadMessage = isRecord(payloadMessageValue) ? payloadMessageValue : undefined;
  const payloadData = isRecord(payloadDataValue) ? payloadDataValue : undefined;
  const dataMessageValue = payloadData?.message;
  const dataMessage = isRecord(dataMessageValue) ? dataMessageValue : undefined;

  return firstText(
    choiceMessage?.content,
    choiceDelta?.content,
    choice?.text,
    payloadMessage?.content,
    payload.message,
    payload.answer,
    payload.response,
    payload.content,
    payload.output_text,
    payloadData?.answer,
    payloadData?.response,
    payloadData?.content,
    dataMessage?.content,
  );
}

export class DlavieProvider implements AIProvider {
  name: string;

  constructor(private config: DlavieProviderConfig) {
    this.name = config.name ?? 'dlavie';
  }

  async chat(input: ChatInput): Promise<ChatOutput> {
    if (!this.config.apiUrl) {
      throw new AppError('AI_PROVIDER_ERROR', 'DLavie AI endpoint is not configured.', 502);
    }
    if (!this.config.apiKey) {
      throw new AppError('AI_PROVIDER_ERROR', 'DLavie AI API key is not configured.', 502);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const res = await fetch(this.config.apiUrl, {
        method: 'POST',
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: input.model,
          messages: input.messages,
          temperature: input.temperature,
          max_tokens: input.max_tokens,
          stream: false,
          metadata: input.metadata ?? {},
        }),
      });

      if (!res.ok) {
        throw new AppError('AI_PROVIDER_ERROR', 'DLavie AI chat request failed.', 502, {
          status: res.status,
        });
      }

      const contentType = res.headers.get('content-type') ?? '';
      const payload: unknown = contentType.includes('application/json')
        ? await res.json()
        : { content: await res.text() };
      const content = extractAssistantContent(payload);

      if (!content) {
        throw new AppError('AI_PROVIDER_ERROR', 'DLavie AI returned an invalid response.', 502);
      }

      const raw = isRecord(payload) ? payload : {};
      const data = isRecord(raw.data) ? raw.data : undefined;
      const model = firstText(raw.model, data?.model, input.model) ?? input.model;

      return {
        content,
        provider: this.name,
        model,
        usage: readUsage(raw.usage),
        raw: payload,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('AI_PROVIDER_TIMEOUT', 'DLavie AI request timed out.', 504);
      }
      throw new AppError('AI_PROVIDER_ERROR', 'DLavie AI provider error.', 502);
    } finally {
      clearTimeout(timeout);
    }
  }

  async *streamChat(input: ChatInput): AsyncIterable<ChatStreamChunk> {
    const out = await this.chat(input);
    yield { delta: out.content, done: true, usage: out.usage };
  }
}
