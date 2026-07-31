'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCartSession } from '../../commerce/client';
import { subscribeToCartUpdates } from '../../commerce/storage';

export function CartLink() {
  const [hasCart, setHasCart] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const session = await getCartSession().catch(() => null);
      if (active) setHasCart(Boolean(session));
    };
    void refresh();
    const unsubscribe = subscribeToCartUpdates(() => void refresh());
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <Link className="commerce-header__cart" href="/cart" aria-label="Buka keranjang">
      <ShoppingBag size={18} aria-hidden="true" />
      <span>Keranjang</span>
      {hasCart ? <span className="commerce-header__cart-dot" aria-label="Keranjang aktif" /> : null}
    </Link>
  );
}
