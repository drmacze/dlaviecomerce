import { z } from 'zod';
export const conversationIdParamSchema = z.object({ conversationId: z.string().uuid() });
export const documentIdParamSchema = z.object({ documentId: z.string().uuid() });
export const metadataSchema = z.record(z.string(), z.unknown()).default({});
