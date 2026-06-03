import { z } from 'zod';
import { metadataSchema } from './common.schema';
import { sanitizeText } from '../utils/text';
export const documentCreateSchema = z.object({
  title: z.string().transform(sanitizeText).pipe(z.string().min(1).max(300)),
  content: z.string().transform(sanitizeText).pipe(z.string().min(1).max(500_000)),
  source_type: z.enum(['manual', 'url', 'file', 'open_data', 'internal']).default('manual'),
  source_url: z.string().url().optional(),
  metadata: metadataSchema,
});
export const kbSearchSchema = z.object({
  query: z.string().transform(sanitizeText).pipe(z.string().min(1).max(4000)),
  limit: z.number().int().min(1).max(20).default(5),
  similarity_threshold: z.number().min(0).max(1).default(0.72),
});
