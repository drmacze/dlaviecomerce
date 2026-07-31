import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  and,
  categoriesTable,
  db,
  eq,
  inventoryTable,
  productImagesTable,
  productsTable,
  productVariantsTable,
} from '../../lib/db/src/index.js';
import { env } from '../config/env.js';
import { calculateDigiflazzSellingPrice, fetchDigiflazzPriceList } from '../commerce/digiflazz.js';
import { requireCommerceAdmin } from '../middleware/commerceAdmin.js';

const syncInputSchema = z.object({
  cmd: z.enum(['prepaid', 'pasca']).default('prepaid'),
  maxProducts: z.number().int().min(1).max(2_000).default(1_000),
  markupPercent: z.number().min(0).max(100).optional(),
  minimumMarkupAmount: z.number().int().min(0).max(10_000_000).optional(),
});

function slugify(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
  return normalized || 'digital';
}

function normalizeSku(value: string): string {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `DIGI-${normalized}`.slice(0, 64);
}

function numeric(value: number | string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
}

export async function commerceProviderRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/v1/admin/commerce/providers/status',
    { preHandler: requireCommerceAdmin },
    async () => ({
      data: {
        catalog: {
          provider: 'digiflazz',
          enabled: env.ENABLE_DIGIFLAZZ,
          configured: Boolean(env.DIGIFLAZZ_USERNAME && env.DIGIFLAZZ_API_KEY),
          testing: env.DIGIFLAZZ_TESTING,
          markupPercent: env.DIGIFLAZZ_MARKUP_PERCENT,
          minimumMarkupAmount: env.DIGIFLAZZ_MINIMUM_MARKUP_AMOUNT,
        },
        payment: {
          provider: 'midtrans',
          enabled: env.ENABLE_PAYMENTS,
          configured: Boolean(env.MIDTRANS_SERVER_KEY),
          production: env.MIDTRANS_IS_PRODUCTION,
        },
      },
    }),
  );

  app.post(
    '/v1/admin/commerce/providers/digiflazz/sync',
    { preHandler: requireCommerceAdmin },
    async (request) => {
      const input = syncInputSchema.parse(request.body ?? {});
      const providerProducts = (await fetchDigiflazzPriceList(input.cmd)).slice(
        0,
        input.maxProducts,
      );
      const result = {
        received: providerProducts.length,
        createdProducts: 0,
        updatedProducts: 0,
        createdVariants: 0,
        updatedVariants: 0,
        skipped: 0,
      };

      for (const item of providerProducts) {
        const providerSku = String(item.buyer_sku_code ?? '').trim();
        const productName = String(item.product_name ?? '').trim();
        const providerPrice = numeric(item.price);
        if (!providerSku || !productName || providerPrice === null || providerPrice <= 0) {
          result.skipped += 1;
          continue;
        }

        const categoryName = String(item.category ?? 'Digital').trim() || 'Digital';
        const brand = String(item.brand ?? '').trim();
        const type = String(item.type ?? '').trim();
        const description =
          String(item.desc ?? '').trim() ||
          [brand, type, categoryName].filter(Boolean).join(' · ') ||
          'Produk digital DLavie Commerce.';
        const categorySlug = `digiflazz-${slugify(categoryName)}`;
        const productSlug = `digiflazz-${slugify(providerSku)}`;
        const variantSku = normalizeSku(providerSku);
        const active = item.buyer_product_status !== false && item.seller_product_status !== false;
        const reportedStock = numeric(item.stock);
        const targetStock = item.unlimited_stock
          ? 1_000_000
          : (reportedStock ?? (active ? 10_000 : 0));
        const sellingPrice = calculateDigiflazzSellingPrice(
          providerPrice,
          input.markupPercent,
          input.minimumMarkupAmount,
        );

        await db.transaction(async (tx) => {
          let [category] = await tx
            .select({ id: categoriesTable.id })
            .from(categoriesTable)
            .where(eq(categoriesTable.slug, categorySlug))
            .limit(1);
          if (!category) {
            [category] = await tx
              .insert(categoriesTable)
              .values({
                name: categoryName,
                slug: categorySlug,
                description: `Produk ${categoryName} dari katalog Digiflazz.`,
                isActive: true,
              })
              .returning({ id: categoriesTable.id });
          } else {
            await tx
              .update(categoriesTable)
              .set({ name: categoryName, isActive: true, updatedAt: new Date() })
              .where(eq(categoriesTable.id, category.id));
          }
          if (!category) throw new Error('Digiflazz category could not be persisted.');

          let [product] = await tx
            .select({ id: productsTable.id })
            .from(productsTable)
            .where(eq(productsTable.slug, productSlug))
            .limit(1);
          if (!product) {
            [product] = await tx
              .insert(productsTable)
              .values({
                categoryId: category.id,
                name: productName,
                slug: productSlug,
                description,
                status: active ? 'active' : 'archived',
                requiresShipping: false,
                seoTitle: `${productName} — DLavie Commerce`.slice(0, 70),
                seoDescription: description.slice(0, 170),
              })
              .returning({ id: productsTable.id });
            result.createdProducts += 1;
          } else {
            await tx
              .update(productsTable)
              .set({
                categoryId: category.id,
                name: productName,
                description,
                status: active ? 'active' : 'archived',
                requiresShipping: false,
                seoTitle: `${productName} — DLavie Commerce`.slice(0, 70),
                seoDescription: description.slice(0, 170),
                updatedAt: new Date(),
              })
              .where(eq(productsTable.id, product.id));
            result.updatedProducts += 1;
          }
          if (!product) throw new Error('Digiflazz product could not be persisted.');

          const attributes = {
            provider: 'digiflazz',
            providerSku,
            category: categoryName,
            brand: brand || 'Digital',
            type: type || input.cmd,
            customerReferenceRequired: 'true',
            multi: item.multi ? 'true' : 'false',
          };

          let [variant] = await tx
            .select({ id: productVariantsTable.id })
            .from(productVariantsTable)
            .where(eq(productVariantsTable.sku, variantSku))
            .limit(1);
          if (!variant) {
            [variant] = await tx
              .insert(productVariantsTable)
              .values({
                productId: product.id,
                sku: variantSku,
                name: productName.slice(0, 120),
                priceAmount: sellingPrice,
                costAmount: providerPrice,
                currency: 'IDR',
                weightGrams: 0,
                attributes,
                isActive: active,
              })
              .returning({ id: productVariantsTable.id });
            result.createdVariants += 1;
          } else {
            await tx
              .update(productVariantsTable)
              .set({
                productId: product.id,
                name: productName.slice(0, 120),
                priceAmount: sellingPrice,
                costAmount: providerPrice,
                attributes,
                isActive: active,
                updatedAt: new Date(),
              })
              .where(eq(productVariantsTable.id, variant.id));
            result.updatedVariants += 1;
          }
          if (!variant) throw new Error('Digiflazz variant could not be persisted.');

          const [inventory] = await tx
            .select({ reserved: inventoryTable.reserved })
            .from(inventoryTable)
            .where(eq(inventoryTable.variantId, variant.id))
            .limit(1);
          if (!inventory) {
            await tx.insert(inventoryTable).values({
              variantId: variant.id,
              onHand: targetStock,
              reserved: 0,
            });
          } else {
            await tx
              .update(inventoryTable)
              .set({ onHand: Math.max(targetStock, inventory.reserved), updatedAt: new Date() })
              .where(eq(inventoryTable.variantId, variant.id));
          }

          const imageUrl = `${env.STOREFRONT_URL.replace(/\/$/, '')}/brand/dlavie-mark.svg`;
          const [image] = await tx
            .select({ id: productImagesTable.id })
            .from(productImagesTable)
            .where(
              and(
                eq(productImagesTable.productId, product.id),
                eq(productImagesTable.url, imageUrl),
              ),
            )
            .limit(1);
          if (!image) {
            await tx.insert(productImagesTable).values({
              productId: product.id,
              url: imageUrl,
              altText: productName,
              sortOrder: 0,
              isPrimary: true,
            });
          }
        });
      }

      request.log.info({ result, cmd: input.cmd }, 'Digiflazz catalog sync completed');
      return {
        data: result,
        pricing: {
          markupPercent: input.markupPercent ?? env.DIGIFLAZZ_MARKUP_PERCENT,
          minimumMarkupAmount: input.minimumMarkupAmount ?? env.DIGIFLAZZ_MINIMUM_MARKUP_AMOUNT,
        },
      };
    },
  );
}
