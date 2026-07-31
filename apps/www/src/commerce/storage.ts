'use client';

import type { CartSession } from './types';

const cartStorageKey = 'dlavie-commerce-cart-v1';
const orderStoragePrefix = 'dlavie-commerce-order-v1:';
const cartUpdatedEvent = 'dlavie:commerce-cart-updated';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function readCartSession(): CartSession | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(cartStorageKey);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<CartSession>;
    if (
      typeof value.id !== 'string' ||
      typeof value.token !== 'string' ||
      typeof value.expiresAt !== 'string' ||
      value.token.length < 32
    ) {
      clearCartSession();
      return null;
    }
    if (new Date(value.expiresAt).getTime() <= Date.now()) {
      clearCartSession();
      return null;
    }
    return { id: value.id, token: value.token, expiresAt: value.expiresAt };
  } catch {
    clearCartSession();
    return null;
  }
}

export function writeCartSession(session: CartSession): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(cartStorageKey, JSON.stringify(session));
  window.dispatchEvent(new Event(cartUpdatedEvent));
}

export function clearCartSession(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(cartStorageKey);
  window.dispatchEvent(new Event(cartUpdatedEvent));
}

export function subscribeToCartUpdates(listener: () => void): () => void {
  if (!hasWindow()) return () => undefined;
  window.addEventListener(cartUpdatedEvent, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(cartUpdatedEvent, listener);
    window.removeEventListener('storage', listener);
  };
}

export function writeOrderAccess(orderNumber: string, token: string): void {
  if (!hasWindow() || token.length < 32) return;
  window.localStorage.setItem(`${orderStoragePrefix}${orderNumber}`, token);
}

export function readOrderAccess(orderNumber: string): string | null {
  if (!hasWindow()) return null;
  const token = window.localStorage.getItem(`${orderStoragePrefix}${orderNumber}`);
  return token && token.length >= 32 ? token : null;
}
