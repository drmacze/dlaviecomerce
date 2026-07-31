'use client';

import { AlertTriangle, Boxes, CircleDollarSign, PackageCheck, RefreshCw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminClientError, getOverview } from '../../admin/client';
import type { AdminOverview } from '../../admin/types';
import { formatIdr } from '../../commerce/format';

export function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getOverview());
    } catch (requestError) {
      setError(
        requestError instanceof AdminClientError
          ? requestError.message
          : 'Ringkasan commerce belum dapat dimuat.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Commerce overview</p>
          <h1>Ringkasan operasional</h1>
          <p>Angka berasal langsung dari PostgreSQL dan tidak memakai dataset demo.</p>
        </div>
        <button className="admin-button admin-button--secondary" type="button" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? 'admin-spin' : undefined} size={16} aria-hidden="true" />
          Perbarui
        </button>
      </header>

      {error ? (
        <section className="admin-alert admin-alert--error" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <span>{error}</span>
        </section>
      ) : null}

      {!data && loading ? (
        <section className="admin-loading"><span className="admin-loader" /><p>Memuat data operasional…</p></section>
      ) : null}

      {data ? (
        <>
          <section className="admin-stat-grid" aria-label="Statistik utama">
            <article>
              <PackageCheck size={21} aria-hidden="true" />
              <span>Produk aktif</span>
              <strong>{data.products.active}</strong>
              <small>{data.products.draft} draft · {data.products.archived} arsip</small>
            </article>
            <article>
              <ShoppingBag size={21} aria-hidden="true" />
              <span>Pesanan dibayar</span>
              <strong>{data.orders.paid + data.orders.processing + data.orders.shipped + data.orders.completed}</strong>
              <small>{data.orders.pendingPayment} menunggu pembayaran</small>
            </article>
            <article>
              <CircleDollarSign size={21} aria-hidden="true" />
              <span>Nilai order dibayar</span>
              <strong>{formatIdr(data.orders.grossPaidAmount)}</strong>
              <small>Tidak termasuk pending/cancelled/refunded</small>
            </article>
            <article data-warning={data.inventory.lowStockVariants > 0 || undefined}>
              <Boxes size={21} aria-hidden="true" />
              <span>Stok tersedia</span>
              <strong>{Math.max(0, data.inventory.onHand - data.inventory.reserved)}</strong>
              <small>{data.inventory.reserved} unit direservasi · {data.inventory.lowStockVariants} SKU menipis</small>
            </article>
          </section>

          <section className="admin-panel-grid">
            <article className="admin-panel">
              <div className="admin-panel__heading"><h2>Produk</h2><Link href="/admin/products">Kelola</Link></div>
              <dl className="admin-breakdown">
                <div><dt>Total produk</dt><dd>{data.products.total}</dd></div>
                <div><dt>Draft</dt><dd>{data.products.draft}</dd></div>
                <div><dt>Aktif</dt><dd>{data.products.active}</dd></div>
                <div><dt>Diarsipkan</dt><dd>{data.products.archived}</dd></div>
              </dl>
            </article>
            <article className="admin-panel">
              <div className="admin-panel__heading"><h2>Fulfillment</h2><Link href="/admin/orders">Buka pesanan</Link></div>
              <dl className="admin-breakdown">
                <div><dt>Dibayar</dt><dd>{data.orders.paid}</dd></div>
                <div><dt>Diproses</dt><dd>{data.orders.processing}</dd></div>
                <div><dt>Dikirim</dt><dd>{data.orders.shipped}</dd></div>
                <div><dt>Selesai</dt><dd>{data.orders.completed}</dd></div>
              </dl>
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}
