import { z } from 'zod';

export const customerReferenceKindSchema = z.enum([
  'phone',
  'meter_number',
  'customer_id',
  'game_id',
  'account_id',
]);

export const customerReferenceSchema = z.object({
  kind: customerReferenceKindSchema,
  value: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[0-9A-Za-z._:@+()\- ]+$/),
});

export const cartItemMutationSchema = z.object({
  quantity: z.number().int().min(1).max(99),
  customerReference: customerReferenceSchema.optional(),
});

export type CustomerReference = z.infer<typeof customerReferenceSchema>;

export function normalizeCustomerReference(reference: CustomerReference): CustomerReference {
  const value =
    reference.kind === 'phone' ||
    reference.kind === 'meter_number' ||
    reference.kind === 'customer_id'
      ? reference.value.replace(/[^0-9]/g, '')
      : reference.value.trim().replace(/\s+/g, ' ');

  return customerReferenceSchema.parse({ ...reference, value });
}
