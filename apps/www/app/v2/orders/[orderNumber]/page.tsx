import type { Metadata } from 'next';
import { getRequestLocale } from '../../../../src/i18n/server';
import { OrderV2Client } from '../../../../src/v2/OrderV2Client';

export const metadata: Metadata = {
  title: 'Status Pesanan — DLavie Commerce v2',
  description: 'Pantau pembayaran dan fulfillment produk digital.',
  robots: { index: false, follow: false },
};

export default async function OrderV2Page({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const [locale, { orderNumber }] = await Promise.all([getRequestLocale(), params]);
  return <OrderV2Client locale={locale} orderNumber={orderNumber} />;
}
