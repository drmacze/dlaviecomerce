import type { Metadata } from 'next';
import { CheckoutClient } from '../../src/components/commerce/CheckoutClient';
import { CommerceHeader } from '../../src/components/commerce/CommerceHeader';

export const metadata: Metadata = {
  title: 'Checkout — DLavie Commerce',
  description: 'Lengkapi kontak, pengiriman, dan lanjutkan ke pembayaran DLavie.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="commerce-page">
      <CommerceHeader />
      <main className="commerce-shell commerce-shell--checkout">
        <CheckoutClient />
      </main>
    </div>
  );
}
