export type ProductImage = {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  priceAmount: number;
  compareAtAmount: number | null;
  currency: 'IDR';
  attributes: Record<string, string>;
  weightGrams: number;
  availableQuantity: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  requiresShipping: boolean;
  category: { id: string; name: string; slug: string } | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type ProductDetail = CatalogProduct & {
  seo: { title: string | null; description: string | null };
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type ShippingMethod = {
  id: string;
  code: string;
  name: string;
  flatRateAmount: number;
  freeAboveAmount: number | null;
};

export type CartSession = {
  id: string;
  expiresAt: string;
};

export type CartItem = {
  variantId: string;
  quantity: number;
  sku: string;
  variantName: string;
  attributes: Record<string, string>;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    requiresShipping: boolean;
  };
  unitPriceAmount: number;
  lineTotalAmount: number;
  currency: 'IDR';
  availableQuantity: number;
  purchasable: boolean;
};

export type CartView = {
  id: string;
  status: 'active' | 'converted' | 'abandoned';
  expiresAt: string;
  updatedAt: string;
  currency: 'IDR';
  subtotalAmount: number;
  items: CartItem[];
};

export type AddressInput = {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: 'ID';
};

export type CheckoutInput = {
  fullName: string;
  email: string;
  phone?: string;
  shippingMethodId?: string;
  shippingAddress?: AddressInput;
  customerNote?: string;
};

export type PaymentView = {
  id: string;
  provider: string;
  status:
    | 'pending'
    | 'authorized'
    | 'paid'
    | 'failed'
    | 'expired'
    | 'cancelled'
    | 'refunded'
    | 'partially_refunded'
    | 'requires_review';
  amount: number;
  currency: 'IDR';
  checkoutToken: null;
  checkoutUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderView = {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  status:
    | 'pending_payment'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'refunded';
  currency: 'IDR';
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: AddressInput | null;
  customerNote: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
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
  payment: PaymentView | null;
};

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export type PaginatedProducts = {
  data: CatalogProduct[];
  pagination: { page: number; limit: number; total: number };
};
