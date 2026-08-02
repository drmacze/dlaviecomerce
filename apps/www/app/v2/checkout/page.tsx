import type { Metadata } from 'next';
import { getRequestLocale } from '../../../src/i18n/server';
import { CheckoutV2Client } from '../../../src/v2/CheckoutV2Client';

export const metadata: Metadata = {
  title: 'Checkout — DLavie Commerce v2',
  description: 'Selesaikan pembayaran produk digital melalui Midtrans.',
  robots: { index: false, follow: false },
};

export default async function CheckoutV2Page() {
  const locale = await getRequestLocale();
  return <CheckoutV2Client locale={locale} />;
}
