import { z } from 'zod';
export const conversationParamSchema = z.object({ conversationId: z.string().uuid() });
