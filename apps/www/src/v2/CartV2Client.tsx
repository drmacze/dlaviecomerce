'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  CommerceClientError,
  getCart,
  getCommerceSession,
  removeCartItem,
} from '../commerce/client';
import { formatIdr } from '../commerce/format';
import type { CartItem, CartView } from '../commerce/types';
import type { CustomerReference } from './types';
import styles from './cart.module.css';

type Locale = 'id' | 'en';
type V2CartItem = CartItem & { customerReference: CustomerReference | null };
type V2Cart = Omit<CartView, 'items'> & { items: V2CartItem[] };

const copy = {
  id: {
    loading: 'Memuat keranjang',
    title: 'Keranjang kamu',
    subtitle: 'Periksa produk dan data tujuan sebelum masuk ke checkout.',
    emptyTitle: 'Keranjang masih kosong',
    emptyCopy: 'Pilih produk dari katalog, isi nomor atau ID tujuan, lalu kembali ke sini.',
    browse: 'Jelajahi produk',
    destination: 'Tujuan',
    quantity: 'Jumlah',
    remove: 'Hapus',
    subtotal: 'Subtotal',
    protected: 'Data tujuan tersimpan di server commerce dan tidak diletakkan di URL.',
    checkout: 'Lanjut ke checkout',
    checkoutCopy: 'Pembayaran dibuka melalui Midtrans dan produk diproses setelah konfirmasi pembayaran.',
    retry: 'Coba lagi',
    unavailable: 'Keranjang belum dapat diakses.',
  },
  en: {
    loading: 'Loading cart',
    title: 'Your cart',
    subtitle: 'Review the product and destination details before checkout.',
    emptyTitle: 'Your cart is empty',
    emptyCopy: 'Choose a product, enter the destination number or ID, then return here.',
    browse: 'Browse products',
    destination: 'Destination',
    quantity: 'Quantity',
    remove: 'Remove',
    subtotal: 'Subtotal',
    protected: 'Destination details are stored on the commerce server and are not placed in the URL.',
    checkout: 'Continue to checkout',
    checkoutCopy: 'Payment opens through Midtrans and the product is processed after confirmation.',
    retry: 'Try again',
    unavailable: 'The cart is currently unavailable.',
  },
} as const;

function referenceLabel(locale: Locale, kind: CustomerReference['kind']): string {
  const labels = {
    phone: { id: 'Nomor tujuan', en: 'Destination number' },
    meter_number: { id: 'Nomor meter', en: 'Meter number' },
    customer_id: { id: 'ID pelanggan', en: 'Customer ID' },
    game_id: { id: 'User ID / server', en: 'User ID / server' },
    account_id: { id: 'ID akun', en: 'Account ID' },
  } as const;
  return labels[kind][locale];
}

export function CartV2Client({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [cart, setCart] = useState<V2Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function loadCart() {
    setLoading(true);
    setError(null);
    try {
      const session = await getCommerceSession();
      if (!session.cart) {
        setCart(null);
        return;
      }
      setCart((await getCart()) as V2Cart);
    } catch (cause) {
      setError(cause instanceof CommerceClientError ? cause.message : t.unavailable);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCart();
  }, []);

  async function removeItem(variantId: string) {
    setRemovingId(variantId);
    setError(null);
    try {
      setCart((await removeCartItem(variantId)) as V2Cart);
    } catch (cause) {
      setError(cause instanceof CommerceClientError ? cause.message : t.unavailable);
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) {
    return (
      <main className={styles.state}>
        <LoaderCircle className={styles.spin} size={28} aria-hidden="true" />
        <p>{t.loading}</p>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className={styles.state}>
        <RefreshCw size={28} aria-hidden="true" />
        <h1>{t.unavailable}</h1>
        <p>{error}</p>
        <button type="button" onClick={() => void loadCart()}>
          {t.retry}
        </button>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className={styles.state}>
        <ShoppingBag size={30} aria-hidden="true" />
        <h1>{t.emptyTitle}</h1>
        <p>{t.emptyCopy}</p>
        <Link href="/v2">
          {t.browse} <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </main>
    );
  }

  const checkoutReady = cart.items.every((item) => item.purchasable && item.customerReference);

  return (
    <main className={styles.shell}>
      <Link className={styles.back} href="/v2">
        <ArrowLeft size={16} aria-hidden="true" /> {t.browse}
      </Link>

      <div className={styles.heading}>
        <div>
          <p>DLavie Commerce v2</p>
          <h1>{t.title}</h1>
        </div>
        <span>{t.subtitle}</span>
      </div>

      {error ? <div className={styles.error} role="alert">{error}</div> : null}

      <div className={styles.layout}>
        <section className={styles.items} aria-label={t.title}>
          {cart.items.map((item, index) => (
            <article key={item.variantId} className={styles.item}>
              <div className={styles.itemIndex}>0{index + 1}</div>
              <div className={styles.itemMain}>
                <span>{item.product.name}</span>
                <h2>{item.variantName}</h2>
                <small>{item.sku}</small>

                {item.customerReference ? (
                  <div className={styles.target}>
                    <span>{referenceLabel(locale, item.customerReference.kind)}</span>
                    <strong>{item.customerReference.value}</strong>
                  </div>
                ) : null}
              </div>

              <div className={styles.itemMeta}>
                <span>{t.quantity}: {item.quantity}</span>
                <strong>{formatIdr(item.lineTotalAmount)}</strong>
                <button
                  type="button"
                  disabled={removingId === item.variantId}
                  onClick={() => void removeItem(item.variantId)}
                >
                  {removingId === item.variantId ? (
                    <LoaderCircle className={styles.spin} size={15} aria-hidden="true" />
                  ) : (
                    <Trash2 size={15} aria-hidden="true" />
                  )}
                  {t.remove}
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className={styles.summary}>
          <div className={styles.summaryTop}>
            <PackageCheck size={22} aria-hidden="true" />
            <span>{cart.items.length} item</span>
          </div>
          <div className={styles.total}>
            <span>{t.subtotal}</span>
            <strong>{formatIdr(cart.subtotalAmount)}</strong>
          </div>
          <div className={styles.protected}>
            <LockKeyhole size={18} aria-hidden="true" />
            <p>{t.protected}</p>
          </div>
          <button
            className={styles.checkout}
            type="button"
            disabled={!checkoutReady}
            onClick={() => window.location.assign('/v2/checkout')}
          >
            {t.checkout}
          </button>
          <p className={styles.checkoutCopy}>{t.checkoutCopy}</p>
        </aside>
      </div>
    </main>
  );
}
