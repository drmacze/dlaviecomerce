import { AdminOrderDetail } from '../../../../../src/components/admin/AdminOrderDetail';

export default async function AdminOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <AdminOrderDetail orderId={orderId} />;
}
