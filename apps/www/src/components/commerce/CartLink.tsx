'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCommerceSession } from '../../commerce/client';
import { subscribeToCartUpdates } from '../../commerce/storage';
import { useDlavieLocale } from '../i18n/LocaleExperience';

export function CartLink() {
  const { locale } = useDlavieLocale();
  const [hasCart, setHasCart] = useState(false);
  const label = locale === 'id' ? 'Keranjang' : 'Cart';

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const session = await getCommerceSession();
        if (active) setHasCart(Boolean(session.cart));
      } catch {
        if (active) setHasCart(false);
      }
    };
    void refresh();
    const unsubscribe = subscribeToCartUpdates(() => void refresh());
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <Link className="commerce-header__cart" href="/cart" aria-label={label}>
      <ShoppingBag size={18} aria-hidden="true" />
      <span>{label}</span>
      {hasCart ? (
        <span
          className="commerce-header__cart-dot"
          aria-label={locale === 'id' ? 'Keranjang aktif' : 'Active cart'}
        />
      ) : null}
    </Link>
  );
}
