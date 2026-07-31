import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CartLink } from './CartLink';

export function CommerceHeader() {
  return (
    <header className="commerce-header">
      <div className="commerce-header__inner">
        <Link className="commerce-header__brand" href="/shop" aria-label="DLavie Commerce">
          <span className="commerce-header__brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>DLavie</strong>
            <small>Commerce</small>
          </span>
        </Link>

        <nav className="commerce-header__nav" aria-label="Navigasi commerce">
          <Link href="/shop">Produk</Link>
          <Link href="/">Ekosistem</Link>
        </nav>

        <div className="commerce-header__actions">
          <Link className="commerce-header__back" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>DLavie OS</span>
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
