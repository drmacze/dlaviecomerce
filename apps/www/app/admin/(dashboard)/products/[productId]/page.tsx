import { AdminProductEditor } from '../../../../../src/components/admin/AdminProductEditor';

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return <AdminProductEditor productId={productId} />;
}
