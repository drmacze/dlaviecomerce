import type { PaymentView } from '../commerce/types';

export type CustomerReference = {
  kind: 'phone' | 'meter_number' | 'customer_id' | 'game_id' | 'account_id';
  value: string;
};

export type FulfillmentView = {
  provider: string;
  status:
    | 'waiting_payment'
    | 'pending'
    | 'processing'
    | 'retrying'
    | 'succeeded'
    | 'failed'
    | 'requires_review'
    | 'cancelled';
  attempts: number;
  providerCode: string | null;
  providerMessage: string | null;
  serialNumber: string | null;
  completedAt: string | null;
  updatedAt: string;
};

export type OrderItemV2 = {
  id: string;
  sku: string;
  productName: string;
  variantName: string;
  attributes: Record<string, string>;
  quantity: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
  customerReference: CustomerReference | null;
  fulfillment: FulfillmentView | null;
};

export type OrderViewV2 = {
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
  customerNote: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemV2[];
  payment: PaymentView | null;
};

export type CheckoutInputV2 = {
  fullName: string;
  email: string;
  phone?: string;
  customerNote?: string;
};
