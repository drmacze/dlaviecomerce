import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowUpRight, UserRound } from 'lucide-react';
import { DlavieBrand } from '../brand/DlavieBrand';
import { DLAVIE_ACCESS_COOKIE } from '../../lib/supabase/session';
import { CartLink } from './CartLink';

export async function CommerceHeader() {
  const cookieStore = await cookies();
  const hasAccountSession = Boolean(cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value);

  return (
    <header className="commerce-header">
      <div className="commerce-header__utility">
        <p>Harga dan stok diperbarui langsung dari sistem commerce</p>
        <Link href="/">
          Ekosistem DLavie <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className="commerce-header__inner">
        <Link className="commerce-header__brand" href="/shop" aria-label="DLavie Commerce">
          <DlavieBrand product="Commerce" compact />
        </Link>

        <nav className="commerce-header__nav" aria-label="Navigasi utama toko">
          <Link href="/shop">Belanja</Link>
          <Link href="/shop#categories">Kategori</Link>
          <Link href="/shop#catalog">Katalog</Link>
          <Link href="/">Tentang</Link>
        </nav>

        <div className="commerce-header__actions">
          <Link
            className="commerce-header__account"
            href={hasAccountSession ? '/account/dashboard' : '/account/login'}
          >
            <UserRound size={17} aria-hidden="true" />
            <span>{hasAccountSession ? 'Akun' : 'Masuk'}</span>
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
