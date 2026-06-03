import { AppError } from '../../lib/errors';
import type { ChatInput, ChatOutput } from '../../types/ai';
import type { AIProvider } from './ai-provider.interface';

export class HuggingFaceProvider implements AIProvider {
  name = 'huggingface';
  constructor(private config: { apiKey: string | undefined; model: string | undefined }) {}
  async chat(input: ChatInput): Promise<ChatOutput> {
    if (!this.config.apiKey || !this.config.model)
      throw new AppError('AI_PROVIDER_ERROR', 'Hugging Face fallback is not configured.', 502);
    const prompt = input.messages.map((m) => `${m.role}: ${m.content}`).join('\n');
    const res = await fetch(
      `https://api-inference.huggingface.co/models/${encodeURIComponent(this.config.model)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: input.max_tokens, temperature: input.temperature },
        }),
      },
    );
    if (!res.ok)
      throw new AppError('AI_PROVIDER_ERROR', 'Hugging Face request failed.', 502, {
        status: res.status,
      });
    const json = (await res.json()) as any;
    const content = Array.isArray(json)
      ? json[0]?.generated_text
      : (json.generated_text ?? json[0]?.summary_text);
    return {
      content: typeof content === 'string' ? content : JSON.stringify(json),
      provider: this.name,
      model: this.config.model,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      raw: json,
    };
  }
}
