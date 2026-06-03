import { z } from 'zod';
export const uuidParamSchema = z.object({
  conversationId: z.string().uuid().optional(),
  documentId: z.string().uuid().optional(),
});
export const metadataSchema = z.record(z.string(), z.unknown()).default({});
