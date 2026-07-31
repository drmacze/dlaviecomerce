export type AdminSessionView = {
  email: string;
  expiresAt: number;
};

export type AdminOverview = {
  products: { total: number; draft: number; active: number; archived: number };
  orders: {
    total: number;
    pendingPayment: number;
    paid: number;
    processing: number;
    shipped: number;
    completed: number;
    grossPaidAmount: number;
  };
  inventory: { onHand: number; reserved: number; lowStockVariants: number };
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminShippingMethod = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  flatRateAmount: number;
  freeAboveAmount: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductStatus = 'draft' | 'active' | 'archived';

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  requiresShipping: boolean;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
  variantCount: number;
  activeVariantCount: number;
  availableQuantity: number;
  lowStockVariantCount: number;
  primaryImageUrl: string | null;
};

export type AdminVariant = {
  id: string;
  sku: string;
  name: string;
  priceAmount: number;
  compareAtAmount: number | null;
  currency: 'IDR';
  attributes: Record<string, string>;
  weightGrams: number;
  isActive: boolean;
  onHand: number;
  reserved: number;
  lowStockThreshold: number;
  availableQuantity: number;
  updatedAt: string;
};

export type AdminProductImage = {
  id: string;
  productId: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: ProductStatus;
  categoryId: string | null;
  categoryName: string | null;
  requiresShipping: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  variants: AdminVariant[];
  images: AdminProductImage[];
};

export type AdminOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  email: string;
  status: AdminOrderStatus;
  totalAmount: number;
  currency: 'IDR';
  createdAt: string;
  paidAt: string | null;
};

export type AdminOrderDetail = AdminOrderListItem & {
  phone: string | null;
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  shippingAddress: Record<string, unknown> | null;
  customerNote: string | null;
  cancelledAt: string | null;
  updatedAt: string;
  items: Array<{
    id: string;
    sku: string;
    productName: string;
    variantName: string;
    attributes: Record<string, string>;
    quantity: number;
    unitPriceAmount: number;
    lineTotalAmount: number;
  }>;
  payments: Array<{
    id: string;
    provider: string;
    status: string;
    amount: number;
    currency: 'IDR';
    providerTransactionId: string | null;
    expiresAt: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type AdminApiErrorBody = {
  error?: { code?: string; message?: string; details?: unknown };
};

export type Paginated<T> = {
  data: T[];
  pagination: { page: number; limit: number; total?: number };
};
