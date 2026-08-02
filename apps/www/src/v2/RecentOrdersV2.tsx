'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, LoaderCircle, PackageSearch, ReceiptText } from 'lucide-react';
import { CommerceClientError, getCommerceSession } from '../commerce/client';
import styles from './orders.module.css';

type Locale = 'id' | 'en';

const copy = {
  id: {
    eyebrow: 'Pesanan tersimpan',
    title: 'Pantau transaksi dari perangkat ini.',
    description:
      'Demi keamanan, hanya pesanan yang dibuat dan tersimpan pada sesi browser ini yang ditampilkan.',
    back: 'Kembali ke toko',
    loading: 'Memuat pesanan',
    emptyTitle: 'Belum ada pesanan tersimpan',
    emptyCopy: 'Pesanan baru akan muncul setelah kamu menyelesaikan checkout di perangkat ini.',
    browse: 'Jelajahi produk',
    open: 'Lihat status',
    unavailable: 'Daftar pesanan belum dapat dimuat.',
  },
  en: {
    eyebrow: 'Saved orders',
    title: 'Follow transactions from this device.',
    description:
      'For security, only orders created and stored in this browser session are displayed.',
    back: 'Back to store',
    loading: 'Loading orders',
    emptyTitle: 'No saved orders yet',
    emptyCopy: 'New orders will appear after checkout is completed on this device.',
    browse: 'Browse products',
    open: 'View status',
    unavailable: 'The order list could not be loaded.',
  },
} as const;

export function RecentOrdersV2({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const session = await getCommerceSession();
        setOrderNumbers(session.orderNumbers);
      } catch (cause) {
        setError(cause instanceof CommerceClientError ? cause.message : t.unavailable);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [t.unavailable]);

  return (
    <main className={styles.shell}>
      <Link className={styles.back} href="/v2">
        <ArrowLeft size={16} aria-hidden="true" /> {t.back}
      </Link>

      <header className={styles.heading}>
        <p>{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <span>{t.description}</span>
      </header>

      {loading ? (
        <section className={styles.state} aria-live="polite">
          <LoaderCircle className={styles.spin} size={28} aria-hidden="true" />
          <p>{t.loading}</p>
        </section>
      ) : error ? (
        <section className={styles.state} role="alert">
          <PackageSearch size={30} aria-hidden="true" />
          <h2>{t.unavailable}</h2>
          <p>{error}</p>
        </section>
      ) : orderNumbers.length === 0 ? (
        <section className={styles.state}>
          <ReceiptText size={30} aria-hidden="true" />
          <h2>{t.emptyTitle}</h2>
          <p>{t.emptyCopy}</p>
          <Link className={styles.primaryAction} href="/v2">
            {t.browse} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <section className={styles.orderList} aria-label={t.eyebrow}>
          {orderNumbers.map((orderNumber, index) => (
            <Link key={orderNumber} href={`/v2/orders/${encodeURIComponent(orderNumber)}`}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.orderCopy}>
                <small>DLavie Commerce</small>
                <strong>{orderNumber}</strong>
              </span>
              <span className={styles.open}>
                {t.open} <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
