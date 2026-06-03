import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import type { AIProvider } from './ai-provider.interface';
import { HuggingFaceProvider } from './huggingface.provider';
import { OpenAICompatibleProvider } from './openai-compatible.provider';

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();
  constructor() {
    this.providers.set(
      'openai',
      new OpenAICompatibleProvider({
        apiKey: env.OPENAI_API_KEY,
        baseUrl: env.OPENAI_BASE_URL,
        name: 'openai',
      }),
    );
    this.providers.set(
      'huggingface',
      new HuggingFaceProvider({
        apiKey: env.HUGGINGFACE_API_KEY,
        model: env.HUGGINGFACE_CHAT_MODEL,
      }),
    );
  }
  get(name: string): AIProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new AppError('AI_PROVIDER_ERROR', `Unknown AI provider: ${name}`, 500);
    return provider;
  }
}
