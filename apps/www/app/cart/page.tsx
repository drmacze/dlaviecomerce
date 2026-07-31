import type { Metadata } from 'next';
import { CartClient } from '../../src/components/commerce/CartClient';
import { CommerceHeader } from '../../src/components/commerce/CommerceHeader';

export const metadata: Metadata = {
  title: 'Keranjang — DLavie Commerce',
  description: 'Periksa produk, jumlah, harga, dan ketersediaan sebelum checkout.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="commerce-page">
      <CommerceHeader />
      <main className="commerce-shell commerce-shell--cart">
        <CartClient />
      </main>
    </div>
  );
}
