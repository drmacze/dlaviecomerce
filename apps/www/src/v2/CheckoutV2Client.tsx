'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  CommerceClientError,
  getCart,
  getCommerceSession,
} from '../commerce/client';
import { formatIdr } from '../commerce/format';
import type { CartItem, CartView } from '../commerce/types';
import { checkoutV2, CommerceV2ClientError } from './client';
import type { CustomerReference } from './types';
import styles from './checkout.module.css';

type Locale = 'id' | 'en';
type V2CartItem = CartItem & { customerReference: CustomerReference | null };
type V2Cart = Omit<CartView, 'items'> & { items: V2CartItem[] };

const copy = {
  id: {
    eyebrow: 'Checkout aman',
    title: 'Selesaikan pesanan digitalmu.',
    subtitle: 'Periksa data pelanggan sebelum membuka pembayaran Midtrans.',
    back: 'Kembali ke keranjang',
    contact: 'Informasi pelanggan',
    fullName: 'Nama lengkap',
    email: 'Email',
    phone: 'Nomor WhatsApp',
    note: 'Catatan opsional',
    namePlaceholder: 'Nama penerima transaksi',
    emailPlaceholder: 'nama@email.com',
    phonePlaceholder: '08xxxxxxxxxx',
    notePlaceholder: 'Catatan untuk pesanan',
    summary: 'Ringkasan pesanan',
    destination: 'Tujuan',
    total: 'Total pembayaran',
    pay: 'Lanjut ke Midtrans',
    processing: 'Menyiapkan pembayaran',
    secure: 'Checkout dibuat di server dan payment URL berasal langsung dari Midtrans.',
    provider: 'Produk akan diproses oleh Digiflazz hanya setelah pembayaran terkonfirmasi.',
    empty: 'Keranjang tidak ditemukan atau sudah diproses.',
    browse: 'Kembali ke katalog',
    retry: 'Coba lagi',
    unavailable: 'Checkout belum dapat digunakan.',
  },
  en: {
    eyebrow: 'Secure checkout',
    title: 'Complete your digital order.',
    subtitle: 'Review customer details before opening the Midtrans payment page.',
    back: 'Back to cart',
    contact: 'Customer information',
    fullName: 'Full name',
    email: 'Email',
    phone: 'WhatsApp number',
    note: 'Optional note',
    namePlaceholder: 'Transaction recipient name',
    emailPlaceholder: 'name@email.com',
    phonePlaceholder: '08xxxxxxxxxx',
    notePlaceholder: 'Order note',
    summary: 'Order summary',
    destination: 'Destination',
    total: 'Payment total',
    pay: 'Continue to Midtrans',
    processing: 'Preparing payment',
    secure: 'Checkout is created server-side and the payment URL comes directly from Midtrans.',
    provider: 'Digiflazz processes the product only after payment is confirmed.',
    empty: 'The cart was not found or has already been processed.',
    browse: 'Return to catalog',
    retry: 'Try again',
    unavailable: 'Checkout is currently unavailable.',
  },
} as const;

export function CheckoutV2Client({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [cart, setCart] = useState<V2Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const session = await getCommerceSession();
        if (!session.cart) return;
        setCart((await getCart()) as V2Cart);
      } catch (cause) {
        setError(cause instanceof CommerceClientError ? cause.message : t.unavailable);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [t.unavailable]);

  const ready = useMemo(
    () =>
      Boolean(
        cart &&
          cart.items.length > 0 &&
          cart.items.every((item) => item.purchasable && item.customerReference),
      ),
    [cart],
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await checkoutV2(
        {
          fullName,
          email,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(note.trim() ? { customerNote: note.trim() } : {}),
        },
        t.unavailable,
      );
      if (order.payment?.checkoutUrl) {
        window.location.assign(order.payment.checkoutUrl);
        return;
      }
      window.location.assign(`/v2/orders/${encodeURIComponent(order.orderNumber)}`);
    } catch (cause) {
      setError(
        cause instanceof CommerceV2ClientError || cause instanceof CommerceClientError
          ? cause.message
          : t.unavailable,
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className={styles.state}>
        <LoaderCircle className={styles.spin} size={28} aria-hidden="true" />
        <p>{t.processing}</p>
      </main>
    );
  }

  if (!cart && error) {
    return (
      <main className={styles.state}>
        <RefreshCw size={30} aria-hidden="true" />
        <h1>{t.unavailable}</h1>
        <p>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          {t.retry}
        </button>
        <Link href="/v2/cart">{t.back}</Link>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className={styles.state}>
        <PackageCheck size={30} aria-hidden="true" />
        <h1>{t.empty}</h1>
        <Link href="/v2">{t.browse}</Link>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <Link className={styles.back} href="/v2/cart">
        <ArrowLeft size={16} aria-hidden="true" /> {t.back}
      </Link>

      <header className={styles.heading}>
        <p>{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <span>{t.subtitle}</span>
      </header>

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}

      <form className={styles.layout} onSubmit={submit}>
        <section className={styles.formCard}>
          <div className={styles.cardTitle}>
            <span>01</span>
            <h2>{t.contact}</h2>
          </div>

          <label>
            <span>{t.fullName}</span>
            <input
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder={t.namePlaceholder}
            />
          </label>
          <label>
            <span>{t.email}</span>
            <input
              required
              type="email"
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.emailPlaceholder}
            />
          </label>
          <label>
            <span>{t.phone}</span>
            <input
              inputMode="tel"
              minLength={6}
              maxLength={30}
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t.phonePlaceholder}
            />
          </label>
          <label>
            <span>{t.note}</span>
            <textarea
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t.notePlaceholder}
            />
          </label>

          <div className={styles.assurance}>
            <LockKeyhole size={18} aria-hidden="true" />
            <p>{t.secure}</p>
          </div>
        </section>

        <aside className={styles.summary}>
          <div className={styles.cardTitle}>
            <span>02</span>
            <h2>{t.summary}</h2>
          </div>

          <div className={styles.items}>
            {cart.items.map((item) => (
              <article key={item.variantId}>
                <div>
                  <strong>{item.variantName}</strong>
                  <small>{item.sku}</small>
                  {item.customerReference ? (
                    <span>
                      {t.destination}: {item.customerReference.value}
                    </span>
                  ) : null}
                </div>
                <b>{formatIdr(item.lineTotalAmount)}</b>
              </article>
            ))}
          </div>

          <div className={styles.total}>
            <span>{t.total}</span>
            <strong>{formatIdr(cart.subtotalAmount)}</strong>
          </div>

          <div className={styles.providerNote}>
            <ShieldCheck size={18} aria-hidden="true" />
            <p>{t.provider}</p>
          </div>

          <button type="submit" disabled={!ready || submitting}>
            {submitting ? (
              <LoaderCircle className={styles.spin} size={18} aria-hidden="true" />
            ) : (
              <CreditCard size={18} aria-hidden="true" />
            )}
            {submitting ? t.processing : t.pay}
            {!submitting ? <ArrowRight size={17} aria-hidden="true" /> : null}
          </button>
        </aside>
      </form>
    </main>
  );
}
