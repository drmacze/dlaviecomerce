import type { FastifyInstance } from 'fastify';
import {
  and,
  asc,
  categoriesTable,
  db,
  desc,
  eq,
  ilike,
  inArray,
  inventoryTable,
  or,
  productImagesTable,
  productsTable,
  productVariantsTable,
  shippingMethodsTable,
  sql,
} from '../../lib/db/src/index.js';
import { AppError } from '../lib/errors.js';
import { catalogQuerySchema } from '../commerce/validation.js';

function groupByProduct<T extends { productId: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const current = grouped.get(row.productId) ?? [];
    current.push(row);
    grouped.set(row.productId, current);
  }
  return grouped;
}

export async function commerceCatalogRoutes(app: FastifyInstance): Promise<void> {
  app.get('/v1/catalog/categories', async () => {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
      })
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));

    return { data: categories };
  });

  app.get('/v1/catalog/shipping-methods', async () => {
    const methods = await db
      .select({
        id: shippingMethodsTable.id,
        code: shippingMethodsTable.code,
        name: shippingMethodsTable.name,
        flatRateAmount: shippingMethodsTable.flatRateAmount,
        freeAboveAmount: shippingMethodsTable.freeAboveAmount,
      })
      .from(shippingMethodsTable)
      .where(eq(shippingMethodsTable.isActive, true))
      .orderBy(asc(shippingMethodsTable.flatRateAmount), asc(shippingMethodsTable.name));

    return { data: methods, currency: 'IDR' };
  });

  app.get('/v1/catalog/products', async (request) => {
    const query = catalogQuerySchema.parse(request.query);
    const searchCondition = query.q
      ? or(
          ilike(productsTable.name, `%${query.q}%`),
          ilike(productsTable.description, `%${query.q}%`),
        )
      : undefined;
    const where = and(
      eq(productsTable.status, 'active'),
      query.category ? eq(categoriesTable.slug, query.category) : undefined,
      searchCondition,
      sql`exists (
        select 1
        from product_variants pv
        join inventory inv on inv.variant_id = pv.id
        where pv.product_id = ${productsTable.id}
          and pv.is_active = true
      )`,
    );

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where);

    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        requiresShipping: productsTable.requiresShipping,
        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(productsTable.createdAt), asc(productsTable.name))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    const productIds = products.map((product) => product.id);
    if (productIds.length === 0) {
      return {
        data: [],
        pagination: { page: query.page, limit: query.limit, total: countRow?.count ?? 0 },
      };
    }

    const [images, variants] = await Promise.all([
      db
        .select({
          productId: productImagesTable.productId,
          id: productImagesTable.id,
          url: productImagesTable.url,
          altText: productImagesTable.altText,
          isPrimary: productImagesTable.isPrimary,
          sortOrder: productImagesTable.sortOrder,
        })
        .from(productImagesTable)
        .where(inArray(productImagesTable.productId, productIds))
        .orderBy(desc(productImagesTable.isPrimary), asc(productImagesTable.sortOrder)),
      db
        .select({
          productId: productVariantsTable.productId,
          id: productVariantsTable.id,
          sku: productVariantsTable.sku,
          name: productVariantsTable.name,
          priceAmount: productVariantsTable.priceAmount,
          compareAtAmount: productVariantsTable.compareAtAmount,
          currency: productVariantsTable.currency,
          attributes: productVariantsTable.attributes,
          weightGrams: productVariantsTable.weightGrams,
          availableQuantity: sql<number>`${inventoryTable.onHand} - ${inventoryTable.reserved}`,
        })
        .from(productVariantsTable)
        .innerJoin(inventoryTable, eq(inventoryTable.variantId, productVariantsTable.id))
        .where(
          and(
            inArray(productVariantsTable.productId, productIds),
            eq(productVariantsTable.isActive, true),
          ),
        )
        .orderBy(asc(productVariantsTable.priceAmount), asc(productVariantsTable.name)),
    ]);

    const imagesByProduct = groupByProduct(images);
    const variantsByProduct = groupByProduct(variants);

    return {
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        requiresShipping: product.requiresShipping,
        category: product.categoryId
          ? { id: product.categoryId, name: product.categoryName, slug: product.categorySlug }
          : null,
        images: imagesByProduct.get(product.id) ?? [],
        variants: variantsByProduct.get(product.id) ?? [],
      })),
      pagination: { page: query.page, limit: query.limit, total: countRow?.count ?? 0 },
    };
  });

  app.get('/v1/catalog/products/:slug', async (request) => {
    const { slug } = request.params as { slug: string };
    const normalizedSlug = slug.trim().toLowerCase();

    const [product] = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        slug: productsTable.slug,
        description: productsTable.description,
        requiresShipping: productsTable.requiresShipping,
        seoTitle: productsTable.seoTitle,
        seoDescription: productsTable.seoDescription,
        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(and(eq(productsTable.slug, normalizedSlug), eq(productsTable.status, 'active')))
      .limit(1);

    if (!product) throw new AppError('NOT_FOUND', 'Product was not found.', 404);

    const [images, variants] = await Promise.all([
      db
        .select({
          id: productImagesTable.id,
          url: productImagesTable.url,
          altText: productImagesTable.altText,
          isPrimary: productImagesTable.isPrimary,
          sortOrder: productImagesTable.sortOrder,
        })
        .from(productImagesTable)
        .where(eq(productImagesTable.productId, product.id))
        .orderBy(desc(productImagesTable.isPrimary), asc(productImagesTable.sortOrder)),
      db
        .select({
          id: productVariantsTable.id,
          sku: productVariantsTable.sku,
          name: productVariantsTable.name,
          priceAmount: productVariantsTable.priceAmount,
          compareAtAmount: productVariantsTable.compareAtAmount,
          currency: productVariantsTable.currency,
          attributes: productVariantsTable.attributes,
          weightGrams: productVariantsTable.weightGrams,
          availableQuantity: sql<number>`${inventoryTable.onHand} - ${inventoryTable.reserved}`,
        })
        .from(productVariantsTable)
        .innerJoin(inventoryTable, eq(inventoryTable.variantId, productVariantsTable.id))
        .where(
          and(
            eq(productVariantsTable.productId, product.id),
            eq(productVariantsTable.isActive, true),
          ),
        )
        .orderBy(asc(productVariantsTable.priceAmount), asc(productVariantsTable.name)),
    ]);

    return {
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        requiresShipping: product.requiresShipping,
        seo: { title: product.seoTitle, description: product.seoDescription },
        category: product.categoryId
          ? { id: product.categoryId, name: product.categoryName, slug: product.categorySlug }
          : null,
        images,
        variants,
      },
    };
  });
}
