import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pool } from '../lib/db/src/index.js';
import { buildApp } from '../src/app.js';

const adminKey = process.env.ADMIN_API_KEY;
if (!adminKey) throw new Error('ADMIN_API_KEY is required for the commerce smoke test.');

const app = await buildApp();
const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
const adminHeaders = { 'x-admin-api-key': adminKey };

type IdResponse = { data: { id: string } };
type ReadyResponse = { ok: boolean; checks: { database: { ok: boolean } } };
type InventoryResponse = { data: { onHand: number; reserved: number } };
type CatalogResponse = {
  data: Array<{
    id: string;
    variants: Array<{ availableQuantity: number }>;
  }>;
};
type CartCreationResponse = { data: { id: string; token: string } };
type CartResponse = {
  data: {
    subtotalAmount: number;
    items: Array<{ purchasable: boolean; availableQuantity: number }>;
  };
};
type AdminOverviewResponse = {
  data: {
    products: { total: number; active: number };
    inventory: { onHand: number; reserved: number; lowStockVariants: number };
  };
};
type AdminCategoriesResponse = { data: Array<{ id: string; slug: string }> };
type AdminProductsResponse = {
  data: Array<{
    id: string;
    availableQuantity: number;
    variantCount: number;
    primaryImageUrl: string | null;
  }>;
  pagination: { total: number };
};
type AdminProductDetailResponse = {
  data: {
    id: string;
    status: string;
    variants: Array<{ id: string; availableQuantity: number; lowStockThreshold: number }>;
    images: Array<{ isPrimary: boolean }>;
  };
};
type InventoryMovementsResponse = {
  data: Array<{ quantityDelta: number; reason: string; actor: string }>;
};
type ErrorResponse = { error: { code: string } };

async function expectJson<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  expectedStatus: number,
  options: { headers?: Record<string, string>; payload?: Record<string, unknown> } = {},
): Promise<T> {
  const response = await app.inject({
    method,
    url,
    ...(options.headers ? { headers: options.headers } : {}),
    ...(options.payload ? { payload: options.payload } : {}),
  });
  assert.equal(
    response.statusCode,
    expectedStatus,
    `${method} ${url} returned ${response.statusCode}: ${response.body}`,
  );
  return response.json<T>();
}

try {
  const ready = await expectJson<ReadyResponse>('GET', '/health/ready', 200);
  assert.equal(ready.ok, true);
  assert.equal(ready.checks.database.ok, true);

  await expectJson<ErrorResponse>('GET', '/v1/admin/commerce/overview', 401);
  await expectJson<ErrorResponse>('POST', '/v1/admin/commerce/products', 401, {
    payload: {
      name: `Unauthorized ${suffix}`,
      slug: `unauthorized-${suffix}`,
      description: 'This request must not be accepted.',
    },
  });

  const categoryResponse = await expectJson<IdResponse>(
    'POST',
    '/v1/admin/commerce/categories',
    201,
    {
      headers: adminHeaders,
      payload: {
        name: `CI Category ${suffix}`,
        slug: `ci-category-${suffix}`,
        description: 'Ephemeral integration-test category.',
        sortOrder: 1,
      },
    },
  );
  const categoryId = categoryResponse.data.id;
  assert.match(categoryId, /^[0-9a-f-]{36}$/i);

  const productResponse = await expectJson<IdResponse>('POST', '/v1/admin/commerce/products', 201, {
    headers: adminHeaders,
    payload: {
      categoryId,
      name: `CI Product ${suffix}`,
      slug: `ci-product-${suffix}`,
      description: 'Ephemeral product used only inside the disposable CI database.',
      status: 'draft',
      requiresShipping: false,
    },
  });
  const productId = productResponse.data.id;

  const variantResponse = await expectJson<IdResponse>(
    'POST',
    `/v1/admin/commerce/products/${productId}/variants`,
    201,
    {
      headers: adminHeaders,
      payload: {
        sku: `CI-${suffix.toUpperCase()}`,
        name: 'Default',
        priceAmount: 125000,
        currency: 'IDR',
        weightGrams: 0,
        attributes: {},
      },
    },
  );
  const variantId = variantResponse.data.id;

  await expectJson<IdResponse>('POST', `/v1/admin/commerce/products/${productId}/images`, 201, {
    headers: adminHeaders,
    payload: {
      url: `https://example.com/ci-commerce-${suffix}.webp`,
      altText: `CI product ${suffix}`,
      isPrimary: true,
    },
  });

  const inventoryResponse = await expectJson<InventoryResponse>(
    'POST',
    `/v1/admin/commerce/inventory/${variantId}/adjustments`,
    201,
    {
      headers: adminHeaders,
      payload: { delta: 5, reason: 'Ephemeral CI stock verification.' },
    },
  );
  assert.equal(inventoryResponse.data.onHand, 5);
  assert.equal(inventoryResponse.data.reserved, 0);

  await expectJson<IdResponse>('PATCH', `/v1/admin/commerce/products/${productId}`, 200, {
    headers: adminHeaders,
    payload: { status: 'active' },
  });

  const overview = await expectJson<AdminOverviewResponse>(
    'GET',
    '/v1/admin/commerce/overview',
    200,
    { headers: adminHeaders },
  );
  assert.ok(overview.data.products.total >= 1);
  assert.ok(overview.data.products.active >= 1);
  assert.ok(overview.data.inventory.onHand >= 5);
  assert.equal(overview.data.inventory.reserved, 0);

  const adminCategories = await expectJson<AdminCategoriesResponse>(
    'GET',
    '/v1/admin/commerce/categories',
    200,
    { headers: adminHeaders },
  );
  assert.ok(adminCategories.data.some((category) => category.id === categoryId));

  const adminProducts = await expectJson<AdminProductsResponse>(
    'GET',
    `/v1/admin/commerce/products?search=${encodeURIComponent(`CI Product ${suffix}`)}`,
    200,
    { headers: adminHeaders },
  );
  assert.equal(adminProducts.pagination.total, 1);
  assert.equal(adminProducts.data[0]?.id, productId);
  assert.equal(adminProducts.data[0]?.variantCount, 1);
  assert.equal(adminProducts.data[0]?.availableQuantity, 5);
  assert.match(adminProducts.data[0]?.primaryImageUrl ?? '', /^https:\/\//);

  const adminProduct = await expectJson<AdminProductDetailResponse>(
    'GET',
    `/v1/admin/commerce/products/${productId}`,
    200,
    { headers: adminHeaders },
  );
  assert.equal(adminProduct.data.status, 'active');
  assert.equal(adminProduct.data.variants[0]?.id, variantId);
  assert.equal(adminProduct.data.variants[0]?.availableQuantity, 5);
  assert.equal(adminProduct.data.variants[0]?.lowStockThreshold, 0);
  assert.equal(adminProduct.data.images[0]?.isPrimary, true);

  const movements = await expectJson<InventoryMovementsResponse>(
    'GET',
    `/v1/admin/commerce/inventory/${variantId}/movements`,
    200,
    { headers: adminHeaders },
  );
  assert.equal(movements.data[0]?.quantityDelta, 5);
  assert.equal(movements.data[0]?.actor, 'admin-api-key');

  const catalog = await expectJson<CatalogResponse>(
    'GET',
    `/v1/catalog/products?q=${encodeURIComponent(`CI Product ${suffix}`)}`,
    200,
  );
  assert.equal(catalog.data.length, 1);
  assert.equal(catalog.data[0]?.id, productId);
  assert.equal(catalog.data[0]?.variants[0]?.availableQuantity, 5);

  const cartResponse = await expectJson<CartCreationResponse>('POST', '/v1/carts', 201);
  const cartId = cartResponse.data.id;
  const cartToken = cartResponse.data.token;
  assert.ok(cartToken.length >= 32);

  const cart = await expectJson<CartResponse>(
    'PUT',
    `/v1/carts/${cartId}/items/${variantId}`,
    200,
    {
      headers: { 'x-cart-token': cartToken },
      payload: { quantity: 2 },
    },
  );
  assert.equal(cart.data.subtotalAmount, 250000);
  assert.equal(cart.data.items[0]?.purchasable, true);
  assert.equal(cart.data.items[0]?.availableQuantity, 5);

  const checkoutDisabled = await expectJson<ErrorResponse>('POST', `/v1/checkout/${cartId}`, 503, {
    headers: {
      'x-cart-token': cartToken,
      'idempotency-key': randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', ''),
    },
    payload: {
      fullName: 'CI Commerce Verification',
      email: `ci-${suffix}@example.invalid`,
    },
  });
  assert.equal(checkoutDisabled.error.code, 'SERVICE_UNAVAILABLE');

  console.log('commerce API smoke test passed');
} finally {
  await app.close();
  await pool.end();
}
