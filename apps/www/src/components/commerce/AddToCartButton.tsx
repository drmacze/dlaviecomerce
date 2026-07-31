'use client';

import { Minus, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CommerceClientError, createCart, setCartItem } from '../../commerce/client';
import {
  clearCartSession,
  readCartSession,
  writeCartSession,
} from '../../commerce/storage';

export function AddToCartButton({
  variantId,
  availableQuantity,
}: {
  variantId: string;
  availableQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<'idle' | 'submitting' | 'added'>('idle');
  const [error, setError] = useState<string | null>(null);
  const maximum = Math.min(availableQuantity, 99);
  const soldOut = maximum < 1;

  async function add(): Promise<void> {
    if (soldOut || state === 'submitting') return;
    setState('submitting');
    setError(null);

    try {
      let session = readCartSession();
      if (!session) {
        session = await createCart();
        writeCartSession(session);
      }

      try {
        await setCartItem(session, variantId, quantity);
      } catch (requestError) {
        if (!(requestError instanceof CommerceClientError) || requestError.status !== 401) {
          throw requestError;
        }
        clearCartSession();
        session = await createCart();
        writeCartSession(session);
        await setCartItem(session, variantId, quantity);
      }

      setState('added');
    } catch (requestError) {
      setState('idle');
      setError(
        requestError instanceof CommerceClientError
          ? requestError.message
          : 'Produk belum dapat ditambahkan ke keranjang.',
      );
    }
  }

  if (soldOut) {
    return <p className="commerce-stock commerce-stock--empty">Stok habis</p>;
  }

  return (
    <div className="commerce-add">
      <div className="commerce-quantity" aria-label="Jumlah produk">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          disabled={quantity <= 1 || state === 'submitting'}
          aria-label="Kurangi jumlah"
        >
          <Minus size={15} aria-hidden="true" />
        </button>
        <output aria-live="polite">{quantity}</output>
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.min(maximum, current + 1))}
          disabled={quantity >= maximum || state === 'submitting'}
          aria-label="Tambah jumlah"
        >
          <Plus size={15} aria-hidden="true" />
        </button>
      </div>

      {state === 'added' ? (
        <Link className="commerce-button commerce-button--primary" href="/cart">
          Lihat keranjang
        </Link>
      ) : (
        <button
          type="button"
          className="commerce-button commerce-button--primary"
          onClick={add}
          disabled={state === 'submitting'}
        >
          <ShoppingBag size={17} aria-hidden="true" />
          {state === 'submitting' ? 'Menambahkan…' : 'Tambah ke keranjang'}
        </button>
      )}

      {error ? (
        <p className="commerce-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
