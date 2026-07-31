import 'server-only';
import { commerceApiPath, CommerceConfigurationError } from './config';
import type { ApiErrorBody, CatalogCategory, PaginatedProducts, ProductDetail } from './types';

export class CommerceApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = 'COMMERCE_API_ERROR',
  ) {
    super(message);
    this.name = 'CommerceApiError';
  }
}

async function readError(response: Response): Promise<CommerceApiError> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return new CommerceApiError(
    body.error?.message ?? 'Commerce service returned an error.',
    response.status,
    body.error?.code ?? 'COMMERCE_API_ERROR',
  );
}

async function commerceFetch<T>(pathname: string): Promise<T> {
  const response = await fetch(commerceApiPath(pathname), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  }).catch((error: unknown) => {
    if (error instanceof CommerceConfigurationError) throw error;
    throw new CommerceApiError('Commerce service is currently unreachable.', 503, 'UNREACHABLE');
  });

  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

export async function getCatalogProducts(input: {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
}): Promise<PaginatedProducts> {
  const search = new URLSearchParams();
  search.set('page', String(input.page ?? 1));
  search.set('limit', String(input.limit ?? 24));
  if (input.query) search.set('q', input.query);
  if (input.category) search.set('category', input.category);
  return commerceFetch<PaginatedProducts>(`/v1/catalog/products?${search.toString()}`);
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const response = await commerceFetch<{ data: CatalogCategory[] }>('/v1/catalog/categories');
  return response.data;
}

export async function getCatalogProduct(slug: string): Promise<ProductDetail> {
  const response = await commerceFetch<{ data: ProductDetail }>(
    `/v1/catalog/products/${encodeURIComponent(slug)}`,
  );
  return response.data;
}
