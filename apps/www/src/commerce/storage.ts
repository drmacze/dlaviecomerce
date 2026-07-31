'use client';

const cartUpdatedEvent = 'dlavie:commerce-cart-updated';

export function notifyCartUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(cartUpdatedEvent));
}

export function subscribeToCartUpdates(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(cartUpdatedEvent, listener);
  return () => window.removeEventListener(cartUpdatedEvent, listener);
}
