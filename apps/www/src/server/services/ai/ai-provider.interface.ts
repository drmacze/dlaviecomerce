import type { ChatInput, ChatOutput, ChatStreamChunk } from '../../types/ai';
export interface AIProvider {
  name: string;
  chat(input: ChatInput): Promise<ChatOutput>;
  streamChat?(input: ChatInput): AsyncIterable<ChatStreamChunk>;
}
