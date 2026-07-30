import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const skuPattern = /^[A-Z0-9][A-Z0-9._-]{1,63}$/;
const orderNumberPattern = /^[A-Z0-9]{2,8}-\d{8}-[A-F0-9]{10}$/;
const secureTokenPattern = /^[A-Za-z0-9._~-]{32,128}$/;

export const uuidSchema = z.string().uuid();
export const orderNumberSchema = z.string().regex(orderNumberPattern);
export const idempotencyKeySchema = z.string().regex(secureTokenPattern);

export const catalogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().trim().min(2).max(100).optional(),
  category: z.string().trim().toLowerCase().regex(slugPattern).optional(),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().regex(slugPattern).max(120),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(100_000).default(0),
});

export const productInputSchema = z.object({
  categoryId: uuidSchema.optional(),
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().toLowerCase().regex(slugPattern).max(200),
  description: z.string().trim().min(1).max(20_000),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  requiresShipping: z.boolean().default(false),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
});

export const productPatchSchema = productInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

const attributesSchema = z.record(z.string().min(1).max(50), z.string().max(200)).default({});

export const variantInputSchema = z.object({
  sku: z.string().trim().toUpperCase().regex(skuPattern),
  name: z.string().trim().min(1).max(120),
  priceAmount: z.number().int().min(0).max(2_000_000_000),
  compareAtAmount: z.number().int().min(0).max(2_000_000_000).optional(),
  costAmount: z.number().int().min(0).max(2_000_000_000).optional(),
  currency: z.literal('IDR').default('IDR'),
  weightGrams: z.number().int().min(0).max(1_000_000).default(0),
  attributes: attributesSchema,
  isActive: z.boolean().default(true),
});

export const variantPatchSchema = variantInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');

export const imageInputSchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname);
    }, 'Image URL must use HTTPS outside local development.'),
  altText: z.string().trim().min(1).max(250),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
  isPrimary: z.boolean().default(false),
});

export const shippingMethodInputSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{1,31}$/),
  name: z.string().trim().min(2).max(100),
  flatRateAmount: z.number().int().min(0).max(2_000_000_000),
  freeAboveAmount: z.number().int().min(0).max(2_000_000_000).optional(),
  isActive: z.boolean().default(true),
});

export const inventoryAdjustmentSchema = z.object({
  delta: z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0),
  reason: z.string().trim().min(3).max(500),
});

export const cartItemSchema = z.object({
  variantId: uuidSchema,
  quantity: z.number().int().min(1).max(99),
});

export const cartItemQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const addressSchema = z.object({
  recipientName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  line1: z.string().trim().min(3).max(250),
  line2: z.string().trim().max(250).optional(),
  district: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  province: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().regex(/^[0-9A-Za-z -]{3,12}$/),
  countryCode: z.string().trim().toUpperCase().length(2).default('ID'),
});

export const checkoutInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().min(6).max(30).optional(),
  shippingMethodId: uuidSchema.optional(),
  shippingAddress: addressSchema.optional(),
  customerNote: z.string().trim().max(500).optional(),
});

export const midtransWebhookSchema = z
  .object({
    order_id: z.string().min(1).max(200),
    status_code: z.string().min(3).max(3),
    gross_amount: z.string().regex(/^\d+(?:\.\d{1,2})?$/),
    signature_key: z.string().regex(/^[a-fA-F0-9]{128}$/),
    transaction_status: z.string().min(1).max(50),
    transaction_id: z.string().min(1).max(200).optional(),
    fraud_status: z.string().max(50).optional(),
    settlement_time: z.string().max(100).optional(),
    payment_type: z.string().max(100).optional(),
  })
  .passthrough();

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
export type MidtransWebhook = z.infer<typeof midtransWebhookSchema>;
