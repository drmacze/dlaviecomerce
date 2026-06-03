import { z } from 'zod';
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
export const messagesPaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
});
export function nextCursor<T extends { created_at?: string; updated_at?: string }>(
  items: T[],
  limit: number,
  field: 'created_at' | 'updated_at',
) {
  return items.length === limit ? (items.at(-1)?.[field] ?? null) : null;
}
