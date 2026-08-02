'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { formatIdr } from '../commerce/format';
import type { PaymentView } from '../commerce/types';
import { CommerceV2ClientError, getOrderV2 } from './client';
import type { FulfillmentView, OrderViewV2 } from './types';
import styles from './order.module.css';

type Locale = 'id' | 'en';

const copy = {
  id: {
    loading: 'Memuat status pesanan',
    unavailable: 'Pesanan belum dapat diakses.',
    retry: 'Coba lagi',
    eyebrow: 'Status pesanan',
    title: 'Transaksi digitalmu.',
    order: 'Nomor pesanan',
    total: 'Total',
    payment: 'Pembayaran',
    resumePayment: 'Lanjutkan pembayaran',
    items: 'Produk dan fulfillment',
    destination: 'Tujuan',
    serial: 'Serial / token',
    updated: 'Diperbarui otomatis',
    catalog: 'Kembali ke katalog',
    pendingPayment: 'Menunggu pembayaran',
    processing: 'Pembayaran diterima, produk sedang diproses',
    completed: 'Pesanan selesai',
    cancelled: 'Pesanan dibatalkan',
    refunded: 'Pembayaran dikembalikan',
    paid: 'Pembayaran terkonfirmasi',
    paymentPending: 'Menunggu pembayaran',
    paymentAuthorized: 'Pembayaran diotorisasi',
    paymentPaid: 'Pembayaran berhasil',
    paymentFailed: 'Pembayaran gagal',
    paymentExpired: 'Pembayaran kedaluwarsa',
    paymentCancelled: 'Pembayaran dibatalkan',
    paymentRefunded: 'Pembayaran dikembalikan',
    paymentPartiallyRefunded: 'Dikembalikan sebagian',
    paymentReview: 'Perlu pemeriksaan',
    waitingProvider: 'Menunggu pembayaran',
    providerPending: 'Dalam antrean provider',
    providerProcessing: 'Sedang diproses provider',
    providerRetrying: 'Sedang mencoba kembali',
    providerSucceeded: 'Berhasil diproses',
    providerFailed: 'Pemrosesan gagal',
    providerReview: 'Perlu pemeriksaan operator',
    providerCancelled: 'Fulfillment dibatalkan',
  },
  en: {
    loading: 'Loading order status',
    unavailable: 'The order is currently unavailable.',
    retry: 'Try again',
    eyebrow: 'Order status',
    title: 'Your digital transaction.',
    order: 'Order number',
    total: 'Total',
    payment: 'Payment',
    resumePayment: 'Continue payment',
    items: 'Products and fulfillment',
    destination: 'Destination',
    serial: 'Serial / token',
    updated: 'Updated automatically',
    catalog: 'Return to catalog',
    pendingPayment: 'Waiting for payment',
    processing: 'Payment received, product is being processed',
    completed: 'Order completed',
    cancelled: 'Order cancelled',
    refunded: 'Payment refunded',
    paid: 'Payment confirmed',
    paymentPending: 'Waiting for payment',
    paymentAuthorized: 'Payment authorized',
    paymentPaid: 'Payment successful',
    paymentFailed: 'Payment failed',
    paymentExpired: 'Payment expired',
    paymentCancelled: 'Payment cancelled',
    paymentRefunded: 'Payment refunded',
    paymentPartiallyRefunded: 'Partially refunded',
    paymentReview: 'Review required',
    waitingProvider: 'Waiting for payment',
    providerPending: 'Queued with provider',
    providerProcessing: 'Provider is processing',
    providerRetrying: 'Retrying provider request',
    providerSucceeded: 'Successfully processed',
    providerFailed: 'Processing failed',
    providerReview: 'Operator review required',
    providerCancelled: 'Fulfillment cancelled',
  },
} as const;

function fulfillmentLabel(locale: Locale, status: FulfillmentView['status']): string {
  const t = copy[locale];
  const labels: Record<FulfillmentView['status'], string> = {
    waiting_payment: t.waitingProvider,
    pending: t.providerPending,
    processing: t.providerProcessing,
    retrying: t.providerRetrying,
    succeeded: t.providerSucceeded,
    failed: t.providerFailed,
    requires_review: t.providerReview,
    cancelled: t.providerCancelled,
  };
  return labels[status];
}

function orderLabel(locale: Locale, status: OrderViewV2['status']): string {
  const t = copy[locale];
  const labels: Record<OrderViewV2['status'], string> = {
    pending_payment: t.pendingPayment,
    paid: t.paid,
    processing: t.processing,
    shipped: t.processing,
    completed: t.completed,
    cancelled: t.cancelled,
    refunded: t.refunded,
  };
  return labels[status];
}

function paymentLabel(locale: Locale, status: PaymentView['status']): string {
  const t = copy[locale];
  const labels: Record<PaymentView['status'], string> = {
    pending: t.paymentPending,
    authorized: t.paymentAuthorized,
    paid: t.paymentPaid,
    failed: t.paymentFailed,
    expired: t.paymentExpired,
    cancelled: t.paymentCancelled,
    refunded: t.paymentRefunded,
    partially_refunded: t.paymentPartiallyRefunded,
    requires_review: t.paymentReview,
  };
  return labels[status];
}

function terminal(order: OrderViewV2): boolean {
  return ['completed', 'cancelled', 'refunded'].includes(order.status);
}

export function OrderV2Client({ locale, orderNumber }: { locale: Locale; orderNumber: string }) {
  const t = copy[locale];
  const [order, setOrder] = useState<OrderViewV2 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(background = false) {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      setOrder(await getOrderV2(orderNumber, t.unavailable));
      setError(null);
    } catch (cause) {
      setError(cause instanceof CommerceV2ClientError ? cause.message : t.unavailable);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, [orderNumber]);

  useEffect(() => {
    if (!order || terminal(order)) return;
    const timer = window.setInterval(() => void load(true), 5_000);
    return () => window.clearInterval(timer);
  }, [order]);

  const progress = useMemo(() => {
    if (!order) return 0;
    if (order.status === 'pending_payment') return 25;
    if (order.status === 'completed') return 100;
    if (['cancelled', 'refunded'].includes(order.status)) return 100;
    const successful = order.items.filter((item) => item.fulfillment?.status === 'succeeded').length;
    return Math.max(55, Math.round(55 + (successful / Math.max(order.items.length, 1)) * 45));
  }, [order]);

  if (loading) {
    return (
      <main className={styles.state}>
        <LoaderCircle className={styles.spin} size={28} aria-hidden="true" />
        <p>{t.loading}</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className={styles.state}>
        <ShieldAlert size={30} aria-hidden="true" />
        <h1>{t.unavailable}</h1>
        <p>{error}</p>
        <button type="button" onClick={() => void load()}>
          {t.retry}
        </button>
      </main>
    );
  }

  const successful = order.status === 'completed';
  const stopped = ['cancelled', 'refunded'].includes(order.status);
  const StatusIcon = successful ? CheckCircle2 : stopped ? ShieldAlert : Clock3;

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <p>{t.eyebrow}</p>
            <h1>{t.title}</h1>
          </div>
          <span className={styles.live}>
            {refreshing ? (
              <LoaderCircle className={styles.spin} size={14} />
            ) : (
              <RefreshCw size={14} />
            )}
            {t.updated}
          </span>
        </div>

        <section className={styles.statusCard} data-status={order.status}>
          <div className={styles.statusIcon}>
            <StatusIcon size={26} aria-hidden="true" />
          </div>
          <div>
            <span>{t.order}</span>
            <strong>{order.orderNumber}</strong>
            <h2>{orderLabel(locale, order.status)}</h2>
          </div>
          <div className={styles.amount}>
            <span>{t.total}</span>
            <strong>{formatIdr(order.totalAmount)}</strong>
          </div>
          <div className={styles.progress} aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </div>
        </section>
      </header>

      {error ? (
        <div className={styles.error} role="alert">
          {error}
        </div>
      ) : null}

      <div className={styles.layout}>
        <section className={styles.items}>
          <div className={styles.sectionTitle}>
            <PackageCheck size={20} aria-hidden="true" />
            <h2>{t.items}</h2>
          </div>

          {order.items.map((item, index) => (
            <article key={item.id}>
              <span className={styles.index}>0{index + 1}</span>
              <div className={styles.itemCopy}>
                <small>{item.sku}</small>
                <h3>{item.variantName}</h3>
                {item.customerReference ? (
                  <p>
                    {t.destination}: <strong>{item.customerReference.value}</strong>
                  </p>
                ) : null}
                {item.fulfillment?.serialNumber ? (
                  <div className={styles.serial}>
                    <span>{t.serial}</span>
                    <strong>{item.fulfillment.serialNumber}</strong>
                  </div>
                ) : null}
              </div>
              <div
                className={styles.fulfillment}
                data-status={item.fulfillment?.status ?? 'none'}
              >
                <i />
                <span>
                  {item.fulfillment
                    ? fulfillmentLabel(locale, item.fulfillment.status)
                    : t.waitingProvider}
                </span>
                {item.fulfillment?.providerMessage ? (
                  <small>{item.fulfillment.providerMessage}</small>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <aside className={styles.payment}>
          <div className={styles.sectionTitle}>
            <CreditCard size={20} aria-hidden="true" />
            <h2>{t.payment}</h2>
          </div>
          <dl>
            <div>
              <dt>Provider</dt>
              <dd>Midtrans</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{order.payment ? paymentLabel(locale, order.payment.status) : '—'}</dd>
            </div>
            <div>
              <dt>{t.total}</dt>
              <dd>{formatIdr(order.totalAmount)}</dd>
            </div>
          </dl>
          {order.status === 'pending_payment' && order.payment?.checkoutUrl ? (
            <a className={styles.payButton} href={order.payment.checkoutUrl}>
              {t.resumePayment} <ArrowRight size={16} aria-hidden="true" />
            </a>
          ) : null}
          <Link className={styles.catalog} href="/v2">
            {t.catalog}
          </Link>
        </aside>
      </div>
    </main>
  );
}
