'use client';

import type {
  AdminApiErrorBody,
  AdminCategory,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderStatus,
  AdminOverview,
  AdminProductDetail,
  AdminProductListItem,
  AdminSessionView,
  AdminShippingMethod,
  AdminVariant,
  Paginated,
  ProductStatus,
} from './types';

export class AdminClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = 'ADMIN_CLIENT_ERROR',
  ) {
    super(message);
    this.name = 'AdminClientError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
};

async function parseError(response: Response): Promise<AdminClientError> {
  const body = (await response.json().catch(() => ({}))) as AdminApiErrorBody;
  return new AdminClientError(
    body.error?.message ?? 'Permintaan admin gagal.',
    response.status,
    body.error?.code ?? 'ADMIN_CLIENT_ERROR',
  );
}

async function request<T>(pathname: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(pathname, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function signIn(email: string, password: string): Promise<AdminSessionView> {
  const response = await request<{ data: AdminSessionView }>('/api/admin/session', {
    method: 'POST',
    body: { email, password },
  });
  return response.data;
}

export async function getSession(): Promise<AdminSessionView> {
  const response = await request<{ data: AdminSessionView }>('/api/admin/session');
  return response.data;
}

export async function signOut(): Promise<void> {
  await request<void>('/api/admin/session', { method: 'DELETE' });
}

function adminPath(pathname: string): string {
  return `/api/admin/commerce${pathname}`;
}

export async function getOverview(): Promise<AdminOverview> {
  const response = await request<{ data: AdminOverview }>(adminPath('/overview'));
  return response.data;
}

export async function getCategories(): Promise<AdminCategory[]> {
  const response = await request<{ data: AdminCategory[] }>(adminPath('/categories'));
  return response.data;
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<AdminCategory> {
  const response = await request<{ data: AdminCategory }>(adminPath('/categories'), {
    method: 'POST',
    body: input,
  });
  return response.data;
}

export async function patchCategory(
  id: string,
  input: Partial<Pick<AdminCategory, 'name' | 'slug' | 'description' | 'isActive' | 'sortOrder'>>,
): Promise<AdminCategory> {
  const response = await request<{ data: AdminCategory }>(
    adminPath(`/categories/${encodeURIComponent(id)}`),
    { method: 'PATCH', body: input },
  );
  return response.data;
}

export async function getShippingMethods(): Promise<AdminShippingMethod[]> {
  const response = await request<{ data: AdminShippingMethod[] }>(adminPath('/shipping-methods'));
  return response.data;
}

export async function createShippingMethod(input: {
  code: string;
  name: string;
  flatRateAmount: number;
  freeAboveAmount?: number;
  isActive: boolean;
}): Promise<AdminShippingMethod> {
  const response = await request<{ data: AdminShippingMethod }>(adminPath('/shipping-methods'), {
    method: 'POST',
    body: input,
  });
  return response.data;
}

export async function patchShippingMethod(
  id: string,
  input: Partial<
    Pick<
      AdminShippingMethod,
      'code' | 'name' | 'flatRateAmount' | 'freeAboveAmount' | 'isActive'
    >
  >,
): Promise<AdminShippingMethod> {
  const response = await request<{ data: AdminShippingMethod }>(
    adminPath(`/shipping-methods/${encodeURIComponent(id)}`),
    { method: 'PATCH', body: input },
  );
  return response.data;
}

export async function getProducts(filters: {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  search?: string;
} = {}): Promise<Paginated<AdminProductListItem>> {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.status) query.set('status', filters.status);
  if (filters.search) query.set('search', filters.search);
  return request<Paginated<AdminProductListItem>>(
    adminPath(`/products${query.size > 0 ? `?${query.toString()}` : ''}`),
  );
}

export async function getProduct(id: string): Promise<AdminProductDetail> {
  const response = await request<{ data: AdminProductDetail }>(
    adminPath(`/products/${encodeURIComponent(id)}`),
  );
  return response.data;
}

export async function createProduct(input: {
  categoryId?: string;
  name: string;
  slug: string;
  description: string;
  requiresShipping: boolean;
  seoTitle?: string;
  seoDescription?: string;
}): Promise<AdminProductDetail> {
  const response = await request<{ data: AdminProductDetail }>(adminPath('/products'), {
    method: 'POST',
    body: { ...input, status: 'draft' },
  });
  return response.data;
}

export async function patchProduct(
  id: string,
  input: Partial<{
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    status: ProductStatus;
    requiresShipping: boolean;
    seoTitle: string;
    seoDescription: string;
  }>,
): Promise<AdminProductDetail> {
  const response = await request<{ data: AdminProductDetail }>(
    adminPath(`/products/${encodeURIComponent(id)}`),
    { method: 'PATCH', body: input },
  );
  return response.data;
}

export async function createVariant(
  productId: string,
  input: {
    sku: string;
    name: string;
    priceAmount: number;
    compareAtAmount?: number;
    costAmount?: number;
    weightGrams: number;
    attributes: Record<string, string>;
    isActive: boolean;
  },
): Promise<AdminVariant> {
  const response = await request<{ data: AdminVariant }>(
    adminPath(`/products/${encodeURIComponent(productId)}/variants`),
    { method: 'POST', body: { ...input, currency: 'IDR' } },
  );
  return response.data;
}

export async function patchVariant(
  id: string,
  input: Partial<{
    sku: string;
    name: string;
    priceAmount: number;
    compareAtAmount: number | null;
    costAmount: number | null;
    weightGrams: number;
    attributes: Record<string, string>;
    isActive: boolean;
  }>,
): Promise<AdminVariant> {
  const response = await request<{ data: AdminVariant }>(
    adminPath(`/variants/${encodeURIComponent(id)}`),
    { method: 'PATCH', body: input },
  );
  return response.data;
}

export async function addProductImage(
  productId: string,
  input: { url: string; altText: string; sortOrder: number; isPrimary: boolean },
): Promise<void> {
  await request(adminPath(`/products/${encodeURIComponent(productId)}/images`), {
    method: 'POST',
    body: input,
  });
}

export async function adjustInventory(
  variantId: string,
  delta: number,
  reason: string,
): Promise<void> {
  await request(adminPath(`/inventory/${encodeURIComponent(variantId)}/adjustments`), {
    method: 'POST',
    body: { delta, reason },
  });
}

export async function getOrders(filters: {
  page?: number;
  limit?: number;
  status?: AdminOrderStatus;
} = {}): Promise<Paginated<AdminOrderListItem>> {
  const query = new URLSearchParams();
  if (filters.page) query.set('page', String(filters.page));
  if (filters.limit) query.set('limit', String(filters.limit));
  if (filters.status) query.set('status', filters.status);
  return request<Paginated<AdminOrderListItem>>(
    adminPath(`/orders${query.size > 0 ? `?${query.toString()}` : ''}`),
  );
}

export async function getOrder(id: string): Promise<AdminOrderDetail> {
  const response = await request<{ data: AdminOrderDetail }>(
    adminPath(`/orders/${encodeURIComponent(id)}`),
  );
  return response.data;
}

export async function updateOrderStatus(
  id: string,
  status: 'processing' | 'shipped' | 'completed',
): Promise<void> {
  await request(adminPath(`/orders/${encodeURIComponent(id)}/status`), {
    method: 'PATCH',
    body: { status },
  });
}
