import Link from 'next/link';
import { cookies } from 'next/headers';
import { ReceiptText, UserRound } from 'lucide-react';
import { DlavieBrand } from '../brand/DlavieBrand';
import { getRequestLocale } from '../../i18n/server';
import { DLAVIE_ACCESS_COOKIE } from '../../lib/supabase/session';
import { CartLink } from './CartLink';

const copy = {
  en: {
    utility: 'Digital products by Digiflazz · Secure payments by Midtrans',
    orders: 'Track order',
    nav: 'Commerce navigation',
    shop: 'Products',
    categories: 'Categories',
    catalog: 'Catalog',
    account: 'Account',
    login: 'Sign in',
  },
  id: {
    utility: 'Produk digital Digiflazz · Pembayaran aman melalui Midtrans',
    orders: 'Lacak pesanan',
    nav: 'Navigasi commerce',
    shop: 'Produk',
    categories: 'Kategori',
    catalog: 'Katalog',
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
        <Link href="/orders">
          <ReceiptText size={13} aria-hidden="true" /> {labels.orders}
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
