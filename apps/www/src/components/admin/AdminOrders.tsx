'use client';

import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminClientError, getOrders } from '../../admin/client';
import type { AdminOrderListItem, AdminOrderStatus } from '../../admin/types';
import { formatDateTime, formatIdr, humanizeStatus } from '../../commerce/format';

const statuses: AdminOrderStatus[] = [
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded',
];

export function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [status, setStatus] = useState<AdminOrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrders({ page, limit: 50, ...(status ? { status } : {}) });
      setOrders(result.data);
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Pesanan belum dapat dimuat.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Order operations</p>
          <h1>Pesanan</h1>
          <p>
            Status pembayaran berasal dari webhook tervalidasi; operator hanya mengubah tahap
            fulfillment.
          </p>
        </div>
        <button
          className="admin-button admin-button--secondary"
          type="button"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className={loading ? 'admin-spin' : undefined} size={16} /> Perbarui
        </button>
      </header>

      {error ? (
        <p className="admin-alert admin-alert--error" role="alert">
          <AlertTriangle size={17} />
          {error}
        </p>
      ) : null}

      <section className="admin-toolbar">
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as AdminOrderStatus | '');
            setPage(1);
          }}
          aria-label="Filter status pesanan"
        >
          <option value="">Semua status</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {humanizeStatus(value)}
            </option>
          ))}
        </select>
      </section>

      {loading && orders.length === 0 ? (
        <section className="admin-loading">
          <span className="admin-loader" />
          <p>Memuat pesanan…</p>
        </section>
      ) : null}
      {!loading && orders.length === 0 ? (
        <section className="admin-empty">
          <SearchX size={30} />
          <h2>Tidak ada pesanan</h2>
          <p>Tidak ada data yang cocok dengan filter ini.</p>
        </section>
      ) : null}

      {orders.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nomor</th>
                <th>Pelanggan</th>
                <th>Status</th>
                <th>Total</th>
                <th>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/admin/orders/${encodeURIComponent(order.id)}`)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter')
                      router.push(`/admin/orders/${encodeURIComponent(order.id)}`);
                  }}
                >
                  <td>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>{order.email}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.status}`}>
                      {humanizeStatus(order.status)}
                    </span>
                  </td>
                  <td>{formatIdr(order.totalAmount)}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <nav className="admin-pagination" aria-label="Pagination pesanan">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          Sebelumnya
        </button>
        <span>Halaman {page}</span>
        <button
          type="button"
          disabled={orders.length < 50}
          onClick={() => setPage((value) => value + 1)}
        >
          Berikutnya
        </button>
      </nav>
    </main>
  );
}
