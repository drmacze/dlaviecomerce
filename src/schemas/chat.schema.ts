import { z } from 'zod';
import { sanitizeText } from '../utils/text.js';
import { metadataSchema } from './common.schema.js';

export const chatModes = ['dlavie', 'webdev', 'lumina', 'general'] as const;
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().transform(sanitizeText).pipe(z.string().min(1).max(12000)),
});
export const chatRequestSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  mode: z.enum(chatModes).default('dlavie'),
  use_rag: z.boolean().default(true),
  stream: z.boolean().default(false),
  messages: z.array(chatMessageSchema).min(1).max(20),
  metadata: metadataSchema,
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;
