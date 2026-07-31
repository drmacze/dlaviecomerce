import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CartLink } from './CartLink';

export function CommerceHeader() {
  return (
    <header className="commerce-header">
      <div className="commerce-header__utility">
        <p>Belanja dengan informasi harga dan stok terkini</p>
        <Link href="/">
          Ekosistem DLavie <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className="commerce-header__inner">
        <Link className="commerce-header__brand" href="/shop" aria-label="DLavie Commerce">
          <span className="commerce-header__brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>DLAVIE</strong>
            <small>Commerce</small>
          </span>
        </Link>

        <nav className="commerce-header__nav" aria-label="Navigasi utama toko">
          <Link href="/shop">Belanja</Link>
          <Link href="/shop#categories">Kategori</Link>
          <Link href="/shop#catalog">Katalog</Link>
        </nav>

        <div className="commerce-header__actions">
          <Link className="commerce-header__back" href="/">
            Tentang DLavie
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
