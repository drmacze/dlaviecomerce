import type { Metadata } from 'next';
import { getRequestLocale } from '../../../src/i18n/server';
import { RecentOrdersV2 } from '../../../src/v2/RecentOrdersV2';

export const metadata: Metadata = {
  title: 'Pesanan — DLavie Commerce v2',
  description: 'Buka kembali pesanan yang tersimpan aman pada sesi browser ini.',
  robots: { index: false, follow: false },
};

export default async function RecentOrdersV2Page() {
  const locale = await getRequestLocale();
  return <RecentOrdersV2 locale={locale} />;
}
