'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Commerce route failed', error);
  }, [error]);

  return (
    <div className="commerce-page">
      <header className="commerce-header">
        <div className="commerce-header__inner">
          <Link className="commerce-header__brand" href="/shop">
            <span className="commerce-header__brand-mark" aria-hidden="true">
              D
            </span>
            <span>
              <strong>DLavie</strong>
              <small>Commerce</small>
            </span>
          </Link>
        </div>
      </header>
      <main className="commerce-shell">
        <section className="commerce-service-state" role="alert">
          <AlertTriangle size={32} aria-hidden="true" />
          <p className="commerce-eyebrow">Layanan bermasalah</p>
          <h1>Halaman commerce belum dapat ditampilkan</h1>
          <p>
            Tidak ada katalog lokal atau data contoh yang digunakan ketika backend gagal. Muat ulang
            setelah layanan commerce kembali sehat.
          </p>
          <div className="commerce-add">
            <button
              className="commerce-button commerce-button--primary"
              type="button"
              onClick={reset}
            >
              <RefreshCw size={16} aria-hidden="true" /> Coba lagi
            </button>
            <Link className="commerce-button commerce-button--secondary" href="/">
              Kembali ke DLavie OS
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
