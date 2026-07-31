import type { Metadata } from 'next';
import { CommerceHeader } from '../../../src/components/commerce/CommerceHeader';
import { OrderStatusClient } from '../../../src/components/commerce/OrderStatusClient';

export const metadata: Metadata = {
  title: 'Status Pesanan — DLavie Commerce',
  description: 'Periksa status pesanan dan pembayaran DLavie.',
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;

  return (
    <div className="commerce-page">
      <CommerceHeader />
      <main className="commerce-shell commerce-shell--order">
        <OrderStatusClient orderNumber={orderNumber} />
      </main>
    </div>
  );
}
