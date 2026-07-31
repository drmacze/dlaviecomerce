import type { Metadata } from 'next';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { getRequestLocale } from '../../../src/i18n/server';
import { CartV2Client } from '../../../src/v2/CartV2Client';
import styles from '../../../src/v2/cart.module.css';

export const metadata: Metadata = {
  title: 'Keranjang — DLavie Commerce v2',
  description: 'Periksa produk digital dan data tujuan di DLavie Commerce.',
  robots: { index: false, follow: false },
};

export default async function CommerceV2CartPage() {
  const locale = await getRequestLocale();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/v2" aria-label="DLavie Commerce">
            <span className={styles.brandMark} aria-hidden="true">DL</span>
            <span className={styles.brandCopy}>
              <strong>DLavie</strong>
              <small>Commerce v2</small>
            </span>
          </Link>

          <Link className={styles.headerAction} href="/account/login">
            <UserRound size={17} aria-hidden="true" />
            <span>{locale === 'id' ? 'Akun' : 'Account'}</span>
          </Link>
        </div>
      </header>

      <CartV2Client locale={locale} />
    </div>
  );
}
