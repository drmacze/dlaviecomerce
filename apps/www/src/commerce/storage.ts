'use client';

const cartUpdatedEvent = 'dlavie:commerce-cart-updated';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function notifyCartUpdated(): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new Event(cartUpdatedEvent));
}

export function subscribeToCartUpdates(listener: () => void): () => void {
  if (!hasWindow()) return () => undefined;
  window.addEventListener(cartUpdatedEvent, listener);
  return () => window.removeEventListener(cartUpdatedEvent, listener);
}
