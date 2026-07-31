import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowUpRight, UserRound } from 'lucide-react';
import { DlavieBrand } from '../brand/DlavieBrand';
import { getRequestLocale } from '../../i18n/server';
import { DLAVIE_ACCESS_COOKIE } from '../../lib/supabase/session';
import { CartLink } from './CartLink';

const copy = {
  en: {
    utility: 'Prices and stock are updated directly from the commerce system',
    ecosystem: 'DLavie ecosystem',
    nav: 'Store navigation',
    shop: 'Shop',
    categories: 'Categories',
    catalog: 'Catalog',
    about: 'About',
    account: 'Account',
    login: 'Sign in',
  },
  id: {
    utility: 'Harga dan stok diperbarui langsung dari sistem commerce',
    ecosystem: 'Ekosistem DLavie',
    nav: 'Navigasi utama toko',
    shop: 'Belanja',
    categories: 'Kategori',
    catalog: 'Katalog',
    about: 'Tentang',
    account: 'Akun',
    login: 'Masuk',
  },
} as const;

export async function CommerceHeader() {
  const [cookieStore, locale] = await Promise.all([cookies(), getRequestLocale()]);
  const hasAccountSession = Boolean(cookieStore.get(DLAVIE_ACCESS_COOKIE)?.value);
  const labels = copy[locale];

  return (
    <header className="commerce-header">
      <div className="commerce-header__utility">
        <p>{labels.utility}</p>
        <Link href="/">
          {labels.ecosystem} <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </div>

      <div className="commerce-header__inner">
        <Link className="commerce-header__brand" href="/shop" aria-label="DLavie Commerce">
          <DlavieBrand product="Commerce" compact />
        </Link>

        <nav className="commerce-header__nav" aria-label={labels.nav}>
          <Link href="/shop">{labels.shop}</Link>
          <Link href="/shop#categories">{labels.categories}</Link>
          <Link href="/shop#catalog">{labels.catalog}</Link>
          <Link href="/">{labels.about}</Link>
        </nav>

        <div className="commerce-header__actions">
          <Link
            className="commerce-header__account"
            href={hasAccountSession ? '/account/dashboard' : '/account/login'}
          >
            <UserRound size={17} aria-hidden="true" />
            <span>{hasAccountSession ? labels.account : labels.login}</span>
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
