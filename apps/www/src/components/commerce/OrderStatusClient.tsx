'use client';

import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CommerceClientError, getOrder } from '../../commerce/client';
import { formatDateTime, formatIdr, humanizeStatus } from '../../commerce/format';
import { readOrderAccess } from '../../commerce/storage';
import type { OrderView } from '../../commerce/types';

const activeStatuses = new Set(['pending_payment', 'paid', 'processing', 'shipped']);

export function OrderStatusClient({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing-access' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      const token = readOrderAccess(orderNumber);
      if (!token) {
        setState('missing-access');
        return;
      }

      if (silent) setRefreshing(true);
      else setState('loading');
      setError(null);
      try {
        const current = await getOrder(orderNumber, token);
        setOrder(current);
        setState('ready');
      } catch (requestError) {
        setState('error');
        setError(
          requestError instanceof CommerceClientError
            ? requestError.message
            : 'Status pesanan belum dapat dimuat.',
        );
      } finally {
        setRefreshing(false);
      }
    },
    [orderNumber],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!order || !activeStatuses.has(order.status)) return;
    const timer = window.setInterval(() => {
      void load(true);
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [load, order]);

  if (state === 'loading') {
    return (
      <section className="commerce-loading" aria-live="polite">
        <RefreshCw className="commerce-spin" size={24} aria-hidden="true" />
        <p>Memuat status pesanan…</p>
      </section>
    );
  }

  if (state === 'missing-access') {
    return (
      <section className="commerce-service-state" role="alert">
        <ShieldAlert size={30} aria-hidden="true" />
        <p className="commerce-eyebrow">Akses pesanan diperlukan</p>
        <h1>Token pesanan tidak ditemukan di perangkat ini</h1>
        <p>
          Demi privasi, nomor pesanan saja tidak cukup untuk membuka detail. Gunakan perangkat dan
          browser yang dipakai saat checkout.
        </p>
        <Link className="commerce-button commerce-button--secondary" href="/shop">
          Kembali ke katalog
        </Link>
      </section>
    );
  }

  if (state === 'error' || !order) {
    return (
      <section className="commerce-service-state" role="alert">
        <AlertTriangle size={30} aria-hidden="true" />
        <p className="commerce-eyebrow">Pesanan belum dapat dibuka</p>
        <h1>Status tidak tersedia</h1>
        <p>{error}</p>
        <button className="commerce-button commerce-button--secondary" type="button" onClick={() => load()}>
          Coba lagi
        </button>
      </section>
    );
  }

  const paymentNeedsAction =
    order.status === 'pending_payment' &&
    order.payment?.status === 'pending' &&
    Boolean(order.payment.checkoutUrl);
  const needsReview = order.payment?.status === 'requires_review';

  return (
    <div className="commerce-order-page">
      <section className="commerce-order-status-card">
        <div className="commerce-order-status-card__icon" data-status={order.status}>
          {['paid', 'processing', 'shipped', 'completed'].includes(order.status) ? (
            <CheckCircle2 size={29} aria-hidden="true" />
          ) : needsReview ? (
            <ShieldAlert size={29} aria-hidden="true" />
          ) : (
            <RefreshCw size={29} aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="commerce-eyebrow">Pesanan {order.orderNumber}</p>
          <h1>{humanizeStatus(order.status)}</h1>
          <p>
            Status pembayaran:{' '}
            <strong>{humanizeStatus(order.payment?.status ?? 'belum tersedia')}</strong>
          </p>
        </div>
        <button
          className="commerce-icon-button"
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          aria-label="Perbarui status pesanan"
        >
          <RefreshCw className={refreshing ? 'commerce-spin' : undefined} size={19} aria-hidden="true" />
        </button>
      </section>

      {paymentNeedsAction && order.payment?.checkoutUrl ? (
        <section className="commerce-payment-action">
          <div>
            <h2>Pembayaran belum selesai</h2>
            <p>Lanjutkan melalui halaman pembayaran provider yang dibuat untuk pesanan ini.</p>
          </div>
          <a
            className="commerce-button commerce-button--primary"
            href={order.payment.checkoutUrl}
            rel="noopener noreferrer"
          >
            Lanjut pembayaran <ExternalLink size={16} aria-hidden="true" />
          </a>
        </section>
      ) : null}

      {needsReview ? (
        <section className="commerce-payment-warning" role="alert">
          <ShieldAlert size={21} aria-hidden="true" />
          <div>
            <h2>Pembayaran sedang ditinjau</h2>
            <p>
              Sistem menerima kondisi provider yang ambigu atau reversal. Status tidak dipaksakan
              menjadi berhasil dan memerlukan rekonsiliasi operator.
            </p>
          </div>
        </section>
      ) : null}

      <div className="commerce-order-layout">
        <section className="commerce-order-items" aria-labelledby="order-items-heading">
          <div className="commerce-section-heading">
            <div>
              <p className="commerce-eyebrow">Rincian</p>
              <h2 id="order-items-heading">Produk dipesan</h2>
            </div>
            <span>{order.items.length} jenis produk</span>
          </div>

          {order.items.map((item) => (
            <article className="commerce-order-item" key={item.id}>
              <div>
                <p>SKU {item.sku}</p>
                <h3>{item.productName}</h3>
                <span>{item.variantName}</span>
                {Object.keys(item.attributes).length > 0 ? (
                  <small>
                    {Object.entries(item.attributes)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(' · ')}
                  </small>
                ) : null}
              </div>
              <div>
                <span>
                  {item.quantity} × {formatIdr(item.unitPriceAmount)}
                </span>
                <strong>{formatIdr(item.lineTotalAmount)}</strong>
              </div>
            </article>
          ))}
        </section>

        <aside className="commerce-order-summary">
          <p className="commerce-eyebrow">Total</p>
          <h2>{formatIdr(order.totalAmount)}</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatIdr(order.subtotalAmount)}</dd>
            </div>
            <div>
              <dt>Pengiriman</dt>
              <dd>{formatIdr(order.shippingAmount)}</dd>
            </div>
            <div>
              <dt>Diskon</dt>
              <dd>−{formatIdr(order.discountAmount)}</dd>
            </div>
            <div className="commerce-order-summary__total">
              <dt>Total</dt>
              <dd>{formatIdr(order.totalAmount)}</dd>
            </div>
          </dl>
          <div className="commerce-order-meta">
            <p>
              <span>Dibuat</span>
              <strong>{formatDateTime(order.createdAt)}</strong>
            </p>
            <p>
              <span>Dibayar</span>
              <strong>{formatDateTime(order.paidAt)}</strong>
            </p>
            <p>
              <span>Email</span>
              <strong>{order.email}</strong>
            </p>
          </div>
        </aside>
      </div>

      {order.shippingAddress ? (
        <section className="commerce-order-address">
          <p className="commerce-eyebrow">Pengiriman</p>
          <h2>Alamat penerima</h2>
          <address>
            <strong>{order.shippingAddress.recipientName}</strong>
            <span>{order.shippingAddress.phone}</span>
            <span>{order.shippingAddress.line1}</span>
            {order.shippingAddress.line2 ? <span>{order.shippingAddress.line2}</span> : null}
            <span>
              {order.shippingAddress.district}, {order.shippingAddress.city}
            </span>
            <span>
              {order.shippingAddress.province} {order.shippingAddress.postalCode}
            </span>
          </address>
        </section>
      ) : null}
    </div>
  );
}
