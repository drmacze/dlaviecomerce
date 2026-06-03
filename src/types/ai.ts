export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';
export type ChatMode = 'dlavie' | 'webdev' | 'lumina' | 'general';

export type AIMessage = { role: Exclude<ChatRole, 'tool'>; content: string };
export type Usage = { prompt_tokens: number; completion_tokens: number; total_tokens: number };
export type ChatInput = {
  messages: AIMessage[];
  model: string;
  temperature: number;
  max_tokens: number;
  metadata?: Record<string, unknown>;
};
export type ChatOutput = {
  content: string;
  provider: string;
  model: string;
  usage: Usage;
  raw?: unknown;
};
export type ChatStreamChunk = { delta: string; done?: boolean; usage?: Usage };
export type ModelRoute = {
  providerName: string;
  model: string;
  temperature: number;
  maxTokens: number;
};
