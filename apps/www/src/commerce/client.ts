'use client';

import type {
  ApiErrorBody,
  CartSession,
  CartView,
  CheckoutInput,
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
  });

  if (!response.ok) throw await readError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function createCart(): Promise<CartSession> {
  const response = await request<{ data: CartSession }>('/v1/carts', { method: 'POST' });
  return response.data;
}

export async function getCart(session: CartSession): Promise<CartView> {
  const response = await request<{ data: CartView }>(`/v1/carts/${encodeURIComponent(session.id)}`, {
    headers: { 'X-Cart-Token': session.token },
  });
  return response.data;
}

export async function setCartItem(
  session: CartSession,
  variantId: string,
  quantity: number,
): Promise<CartView> {
  const response = await request<{ data: CartView }>(
    `/v1/carts/${encodeURIComponent(session.id)}/items/${encodeURIComponent(variantId)}`,
    {
      method: 'PUT',
      headers: { 'X-Cart-Token': session.token },
      body: { quantity },
    },
  );
  return response.data;
}

export async function removeCartItem(
  session: CartSession,
  variantId: string,
): Promise<CartView> {
  const response = await request<{ data: CartView }>(
    `/v1/carts/${encodeURIComponent(session.id)}/items/${encodeURIComponent(variantId)}`,
    {
      method: 'DELETE',
      headers: { 'X-Cart-Token': session.token },
    },
  );
  return response.data;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  const response = await request<{ data: ShippingMethod[] }>('/v1/catalog/shipping-methods');
  return response.data;
}

export async function checkout(
  session: CartSession,
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
  const response = await request<{ data: OrderView }>(
    `/v1/checkout/${encodeURIComponent(session.id)}`,
    {
      method: 'POST',
      headers: {
        'X-Cart-Token': session.token,
        'Idempotency-Key': idempotencyKey,
      },
      body,
    },
  );
  return response.data;
}

export async function getOrder(orderNumber: string, token: string): Promise<OrderView> {
  const response = await request<{ data: OrderView }>(
    `/v1/orders/${encodeURIComponent(orderNumber)}`,
    { headers: { 'X-Order-Token': token } },
  );
  return response.data;
}
