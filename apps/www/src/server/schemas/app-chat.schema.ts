import { z } from 'zod';
import { sanitizeText } from '../utils/text';
import { metadataSchema } from './common.schema';

export const appChatModes = ['fast', 'smart', 'agent', 'research', 'private'] as const;

export const appChatRequestSchema = z.object({
  message: z.string().transform(sanitizeText).pipe(z.string().min(1).max(12000)),
  mode: z.enum(appChatModes).default('smart'),
  conversation_id: z.string().uuid().optional(),
  use_rag: z.boolean().optional(),
  metadata: metadataSchema,
});

export type AppChatRequest = z.infer<typeof appChatRequestSchema>;
export type AppChatMode = (typeof appChatModes)[number];
