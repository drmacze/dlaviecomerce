'use client';

import { AlertTriangle, ArrowLeft, RefreshCw, Truck } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminClientError, getOrder, updateOrderStatus } from '../../admin/client';
import type { AdminOrderDetail as OrderDetail } from '../../admin/types';
import { formatDateTime, formatIdr, humanizeStatus } from '../../commerce/format';

function nextStatus(status: OrderDetail['status']): 'processing' | 'shipped' | 'completed' | null {
  if (status === 'paid') return 'processing';
  if (status === 'processing') return 'shipped';
  if (status === 'shipped') return 'completed';
  return null;
}

function addressLines(address: Record<string, unknown> | null): string[] {
  if (!address) return [];
  return [
    address.recipientName,
    address.phone,
    address.line1,
    address.line2,
    [address.district, address.city].filter(Boolean).join(', '),
    [address.province, address.postalCode].filter(Boolean).join(' '),
    address.countryCode,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
}

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await getOrder(orderId));
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Pesanan belum dapat dimuat.',
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const next = order ? nextStatus(order.status) : null;
  const address = useMemo(() => addressLines(order?.shippingAddress ?? null), [order]);

  async function advance(): Promise<void> {
    if (!order || !next || updating) return;
    setUpdating(true);
    setError(null);
    try {
      await updateOrderStatus(order.id, next);
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Status belum dapat diperbarui.',
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading && !order)
    return (
      <main className="admin-auth-state">
        <span className="admin-loader" />
        <p>Memuat pesanan…</p>
      </main>
    );
  if (!order)
    return (
      <main className="admin-page">
        <p className="admin-alert admin-alert--error">
          <AlertTriangle size={17} />
          {error ?? 'Pesanan tidak ditemukan.'}
        </p>
        <Link className="admin-button admin-button--secondary" href="/admin/orders">
          Kembali
        </Link>
      </main>
    );

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <Link className="admin-back-link" href="/admin/orders">
            <ArrowLeft size={16} /> Semua pesanan
          </Link>
          <p className="admin-eyebrow">{order.orderNumber}</p>
          <h1>{humanizeStatus(order.status)}</h1>
          <p>
            Dibuat {formatDateTime(order.createdAt)} · {order.email}
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-button admin-button--secondary"
            type="button"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={loading ? 'admin-spin' : undefined} size={16} /> Perbarui
          </button>
          {next ? (
            <button
              className="admin-button admin-button--primary"
              type="button"
              onClick={advance}
              disabled={updating}
            >
              <Truck size={16} />
              {updating ? 'Memproses…' : `Tandai ${humanizeStatus(next)}`}
            </button>
          ) : null}
        </div>
      </header>

      {error ? (
        <p className="admin-alert admin-alert--error" role="alert">
          <AlertTriangle size={17} />
          {error}
        </p>
      ) : null}

      <section className="admin-stat-grid admin-stat-grid--order">
        <article>
          <span>Status order</span>
          <strong>{humanizeStatus(order.status)}</strong>
          <small>Dibayar: {formatDateTime(order.paidAt)}</small>
        </article>
        <article>
          <span>Total</span>
          <strong>{formatIdr(order.totalAmount)}</strong>
          <small>Subtotal {formatIdr(order.subtotalAmount)}</small>
        </article>
        <article>
          <span>Pembayaran</span>
          <strong>{humanizeStatus(order.payments[0]?.status ?? 'belum ada')}</strong>
          <small>{order.payments[0]?.provider ?? 'Provider belum dibuat'}</small>
        </article>
        <article>
          <span>Kontak</span>
          <strong>{order.email}</strong>
          <small>{order.phone ?? 'Tanpa nomor telepon'}</small>
        </article>
      </section>

      <div className="admin-panel-grid admin-panel-grid--order">
        <section className="admin-panel">
          <div className="admin-panel__heading">
            <h2>Item pesanan</h2>
            <span>{order.items.length} jenis</span>
          </div>
          <div className="admin-order-items">
            {order.items.map((item) => (
              <article key={item.id}>
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
          </div>
          <dl className="admin-order-totals">
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
            <div>
              <dt>Total</dt>
              <dd>{formatIdr(order.totalAmount)}</dd>
            </div>
          </dl>
        </section>

        <div className="admin-panel-stack">
          <section className="admin-panel">
            <div className="admin-panel__heading">
              <h2>Pembayaran</h2>
            </div>
            {order.payments.length === 0 ? (
              <p className="admin-empty-inline">Belum ada transaksi pembayaran.</p>
            ) : (
              order.payments.map((payment) => (
                <dl className="admin-detail-list" key={payment.id}>
                  <div>
                    <dt>Status</dt>
                    <dd>{humanizeStatus(payment.status)}</dd>
                  </div>
                  <div>
                    <dt>Provider</dt>
                    <dd>{payment.provider}</dd>
                  </div>
                  <div>
                    <dt>Nilai</dt>
                    <dd>{formatIdr(payment.amount)}</dd>
                  </div>
                  <div>
                    <dt>Transaction ID</dt>
                    <dd>{payment.providerTransactionId ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Dibayar</dt>
                    <dd>{formatDateTime(payment.terminalProcessedAt)}</dd>
                  </div>
                </dl>
              ))
            )}
          </section>
          <section className="admin-panel">
            <div className="admin-panel__heading">
              <h2>Alamat pengiriman</h2>
            </div>
            {address.length > 0 ? (
              <address className="admin-address">
                {address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            ) : (
              <p className="admin-empty-inline">Pesanan tidak memerlukan pengiriman.</p>
            )}
          </section>
          {order.customerNote ? (
            <section className="admin-panel">
              <div className="admin-panel__heading">
                <h2>Catatan pelanggan</h2>
              </div>
              <p className="admin-note">{order.customerNote}</p>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
