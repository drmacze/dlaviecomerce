import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { safeEqual } from '../utils/crypto.js';
import type { AddressSnapshot, ProductAttributes } from '../../lib/db/src/schema/index.js';

export type MidtransItem = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type MidtransCustomer = {
  fullName: string;
  email: string;
  phone?: string;
  shippingAddress?: AddressSnapshot;
};

export type SnapTransactionInput = {
  providerOrderId: string;
  orderNumber: string;
  amount: number;
  items: MidtransItem[];
  customer: MidtransCustomer;
  finishPath?: string;
};

export type SnapTransaction = {
  token: string;
  redirectUrl: string;
  raw: Record<string, unknown>;
};

export class MidtransRequestError extends AppError {
  constructor(
    message: string,
    public outcome: 'rejected' | 'unknown',
    details?: unknown,
  ) {
    super('PAYMENT_PROVIDER_ERROR', message, 502, details);
  }
}

function snapEndpoint(): string {
  return env.MIDTRANS_IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : value.slice(0, maxLength);
}

function finishUrl(input: SnapTransactionInput): string {
  const base = env.STOREFRONT_URL.replace(/\/$/, '');
  if (input.finishPath) {
    const path = input.finishPath.startsWith('/') ? input.finishPath : `/${input.finishPath}`;
    return `${base}${path}`;
  }
  return `${base}/orders/${encodeURIComponent(input.orderNumber)}`;
}

export async function createSnapTransaction(input: SnapTransactionInput): Promise<SnapTransaction> {
  if (!env.ENABLE_PAYMENTS || !env.MIDTRANS_SERVER_KEY) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Payment processing is not configured.', 503);
  }

  const shippingAddress = input.customer.shippingAddress;
  const payload = {
    transaction_details: {
      order_id: input.providerOrderId,
      gross_amount: input.amount,
    },
    item_details: input.items.map((item) => ({
      id: truncate(item.id, 50),
      price: item.price,
      quantity: item.quantity,
      name: truncate(item.name, 50),
    })),
    customer_details: {
      first_name: truncate(input.customer.fullName, 255),
      email: input.customer.email,
      ...(input.customer.phone ? { phone: input.customer.phone } : {}),
      ...(shippingAddress
        ? {
            shipping_address: {
              first_name: truncate(shippingAddress.recipientName, 255),
              phone: shippingAddress.phone,
              address: truncate(
                [shippingAddress.line1, shippingAddress.line2].filter(Boolean).join(', '),
                255,
              ),
              city: truncate(shippingAddress.city, 100),
              postal_code: shippingAddress.postalCode,
              country_code: shippingAddress.countryCode,
            },
          }
        : {}),
    },
    callbacks: {
      finish: finishUrl(input),
    },
    expiry: {
      duration: env.PAYMENT_EXPIRY_MINUTES,
      unit: 'minutes',
    },
  };

  let response: Response;
  try {
    response = await fetch(snapEndpoint(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new MidtransRequestError(
      'Payment provider did not return a definitive response. The order requires reconciliation.',
      'unknown',
      { cause: error instanceof Error ? error.name : 'network_error' },
    );
  }

  const responseBody = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new MidtransRequestError(
      'Payment provider rejected the transaction request.',
      'rejected',
      {
        providerStatus: response.status,
        providerCode:
          typeof responseBody.status_code === 'string' ? responseBody.status_code : undefined,
      },
    );
  }

  const token = responseBody.token;
  const redirectUrl = responseBody.redirect_url;
  if (typeof token !== 'string' || typeof redirectUrl !== 'string') {
    throw new MidtransRequestError(
      'Payment provider returned an incomplete transaction response.',
      'unknown',
    );
  }

  return { token, redirectUrl, raw: responseBody };
}

export function calculateMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  serverKey: string;
}): string {
  return crypto
    .createHash('sha512')
    .update(`${input.orderId}${input.statusCode}${input.grossAmount}${input.serverKey}`)
    .digest('hex');
}

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  if (!env.MIDTRANS_SERVER_KEY) return false;
  const expected = calculateMidtransSignature({
    orderId: input.orderId,
    statusCode: input.statusCode,
    grossAmount: input.grossAmount,
    serverKey: env.MIDTRANS_SERVER_KEY,
  });
  return safeEqual(expected.toLowerCase(), input.signatureKey.toLowerCase());
}

export function parseGrossAmount(value: string): number {
  if (!/^\d+(?:\.0{1,2})?$/.test(value)) {
    throw new AppError('BAD_REQUEST', 'Payment amount format is invalid.', 400);
  }
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new AppError('BAD_REQUEST', 'Payment amount is invalid.', 400);
  }
  return amount;
}

export type LocalPaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'requires_review';

export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus: string | undefined,
  previousStatus: LocalPaymentStatus,
): LocalPaymentStatus {
  switch (transactionStatus) {
    case 'authorize':
      return 'authorized';
    case 'capture':
      if (fraudStatus === 'challenge') return 'authorized';
      if (fraudStatus === 'deny') return previousStatus === 'paid' ? 'requires_review' : 'failed';
      return 'paid';
    case 'settlement':
      return 'paid';
    case 'pending':
      return 'pending';
    case 'expire':
      return 'expired';
    case 'cancel':
      return previousStatus === 'paid' ? 'requires_review' : 'cancelled';
    case 'deny':
    case 'failure':
      return previousStatus === 'paid' ? 'requires_review' : 'failed';
    case 'refund':
      return 'refunded';
    case 'partial_refund':
      return 'partially_refunded';
    case 'chargeback':
    case 'partial_chargeback':
      return 'requires_review';
    default:
      return 'requires_review';
  }
}

export type OrderItemForPayment = {
  sku: string;
  productName: string;
  variantName: string;
  attributes: ProductAttributes;
  unitPriceAmount: number;
  quantity: number;
};
