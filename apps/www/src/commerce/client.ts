'use client';

import type {
  ApiErrorBody,
  CartSession,
  CartView,
  CheckoutInput,
  CommerceSessionState,
  OrderView,
  ShippingMethod,
} from './types';

export class CommerceClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = 'COMMERCE_CLIENT_ERROR',
  ) {
    super(message);
    this.name = 'CommerceClientError';
  }
}

async function readError(response: Response): Promise<CommerceClientError> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return new CommerceClientError(
    body.error?.message ?? 'Permintaan commerce gagal.',
    response.status,
    body.error?.code ?? 'COMMERCE_CLIENT_ERROR',
  );
}

async function request<T>(
  pathname: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const response = await fetch(`/api/commerce${pathname}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: 'no-store',
    credentials: 'same-origin',
  });

  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function getCommerceSession(): Promise<CommerceSessionState> {
  const response = await request<{ data: CommerceSessionState }>('/session');
  return response.data;
}

export async function createCart(): Promise<CartSession> {
  const response = await request<{ data: CartSession }>('/v1/carts', { method: 'POST' });
  return response.data;
}

export async function getCart(): Promise<CartView> {
  const response = await request<{ data: CartView }>('/v1/carts/current');
  return response.data;
}

export async function setCartItem(variantId: string, quantity: number): Promise<CartView> {
  const response = await request<{ data: CartView }>(
    `/v1/carts/current/items/${encodeURIComponent(variantId)}`,
    {
      method: 'PUT',
      body: { quantity },
    },
  );
  return response.data;
}

export async function removeCartItem(variantId: string): Promise<CartView> {
  const response = await request<{ data: CartView }>(
    `/v1/carts/current/items/${encodeURIComponent(variantId)}`,
    { method: 'DELETE' },
  );
  return response.data;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const response = await request<{ data: ShippingMethod[] }>('/v1/catalog/shipping-methods');
  return response.data;
}

export async function checkout(
  idempotencyKey: string,
  input: CheckoutInput,
): Promise<OrderView> {
  const body: Record<string, unknown> = {
    fullName: input.fullName,
    email: input.email,
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.shippingMethodId ? { shippingMethodId: input.shippingMethodId } : {}),
    ...(input.shippingAddress ? { shippingAddress: input.shippingAddress } : {}),
    ...(input.customerNote ? { customerNote: input.customerNote } : {}),
  };
  const response = await request<{ data: OrderView }>('/v1/checkout/current', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body,
  });
  return response.data;
}

export async function getOrder(orderNumber: string): Promise<OrderView> {
  const response = await request<{ data: OrderView }>(
    `/v1/orders/${encodeURIComponent(orderNumber)}`,
  );
  return response.data;
}
