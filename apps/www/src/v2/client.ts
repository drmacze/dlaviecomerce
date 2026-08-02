'use client';

import type { ApiErrorBody } from '../commerce/types';
import type { CheckoutInputV2, OrderViewV2 } from './types';

export class CommerceV2ClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code = 'COMMERCE_V2_CLIENT_ERROR',
  ) {
    super(message);
    this.name = 'CommerceV2ClientError';
  }
}

async function readError(
  response: Response,
  fallbackMessage: string,
): Promise<CommerceV2ClientError> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return new CommerceV2ClientError(
    body.error?.message ?? fallbackMessage,
    response.status,
    body.error?.code ?? 'COMMERCE_V2_CLIENT_ERROR',
  );
}

async function request<T>(
  pathname: string,
  fallbackMessage: string,
  options?: { method?: 'GET' | 'POST'; body?: unknown },
) {
  const response = await fetch(`/api/commerce-v2${pathname}`, {
    method: options?.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok) throw await readError(response, fallbackMessage);
  return (await response.json()) as T;
}

export async function checkoutV2(
  input: CheckoutInputV2,
  fallbackMessage: string,
): Promise<OrderViewV2> {
  const response = await request<{ data: OrderViewV2 }>('/checkout/current', fallbackMessage, {
    method: 'POST',
    body: input,
  });
  return response.data;
}

export async function getOrderV2(
  orderNumber: string,
  fallbackMessage: string,
): Promise<OrderViewV2> {
  const response = await request<{ data: OrderViewV2 }>(
    `/orders/${encodeURIComponent(orderNumber)}`,
    fallbackMessage,
  );
  return response.data;
}
