'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { readCartSession, subscribeToCartUpdates } from '../../commerce/storage';

export function CartLink() {
  const [hasCart, setHasCart] = useState(false);

  useEffect(() => {
    const refresh = () => setHasCart(Boolean(readCartSession()));
    refresh();
    return subscribeToCartUpdates(refresh);
  }, []);

  return (
    <Link className="commerce-header__cart" href="/cart" aria-label="Buka keranjang">
      <ShoppingBag size={18} aria-hidden="true" />
      <span>Keranjang</span>
      {hasCart ? <span className="commerce-header__cart-dot" aria-label="Keranjang aktif" /> : null}
    </Link>
  );
}
