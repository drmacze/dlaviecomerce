import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { CommerceHeader } from '../../../src/components/commerce/CommerceHeader';

export default function ProductNotFound() {
  return (
    <div className="commerce-page">
      <CommerceHeader />
      <main className="commerce-shell">
        <section className="commerce-empty commerce-empty--large">
          <SearchX size={32} aria-hidden="true" />
          <p className="commerce-eyebrow">Produk tidak ditemukan</p>
          <h1>Produk ini tidak tersedia</h1>
          <p>
            Produk mungkin belum aktif, telah diarsipkan, atau alamatnya berubah. Katalog tidak
            menggantinya dengan produk contoh.
          </p>
          <Link className="commerce-button commerce-button--primary" href="/shop">
            Kembali ke katalog
          </Link>
        </section>
      </main>
    </div>
  );
}
