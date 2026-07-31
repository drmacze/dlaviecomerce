import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { safeEqual } from '../utils/crypto.js';

export type DigiflazzPriceProduct = {
  product_name?: string;
  category?: string;
  brand?: string;
  type?: string;
  price?: number | string;
  buyer_sku_code?: string;
  buyer_product_status?: boolean;
  seller_product_status?: boolean;
  unlimited_stock?: boolean;
  stock?: number | string;
  multi?: boolean;
  desc?: string;
};

export type DigiflazzTransactionData = {
  ref_id?: string;
  customer_no?: string;
  buyer_sku_code?: string;
  message?: string;
  status?: string;
  rc?: string;
  sn?: string;
  price?: number | string;
  buyer_last_saldo?: number | string;
};

type PriceListResponse = { data?: DigiflazzPriceProduct[] };
type TransactionResponse = { data?: DigiflazzTransactionData };

function assertConfigured(): { username: string; apiKey: string } {
  if (!env.ENABLE_DIGIFLAZZ || !env.DIGIFLAZZ_USERNAME || !env.DIGIFLAZZ_API_KEY) {
    throw new AppError('SERVICE_UNAVAILABLE', 'Digiflazz is not configured.', 503);
  }
  return { username: env.DIGIFLAZZ_USERNAME, apiKey: env.DIGIFLAZZ_API_KEY };
}

function md5(value: string): string {
  return crypto.createHash('md5').update(value).digest('hex');
}

async function postDigiflazz<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.DIGIFLAZZ_BASE_URL.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new AppError('PROVIDER_ERROR', 'Digiflazz did not respond in time.', 502, {
      cause: error instanceof Error ? error.name : 'network_error',
    });
  }

  const text = await response.text();
  let payload: T;
  try {
    payload = JSON.parse(text) as T;
  } catch {
    throw new AppError('PROVIDER_ERROR', 'Digiflazz returned an invalid response.', 502, {
      providerStatus: response.status,
    });
  }

  if (!response.ok) {
    throw new AppError('PROVIDER_ERROR', 'Digiflazz rejected the request.', 502, {
      providerStatus: response.status,
    });
  }

  return payload;
}

export async function fetchDigiflazzPriceList(
  cmd: 'prepaid' | 'pasca' = 'prepaid',
): Promise<DigiflazzPriceProduct[]> {
  const { username, apiKey } = assertConfigured();
  const payload = await postDigiflazz<PriceListResponse>('/v1/price-list', {
    cmd,
    username,
    sign: md5(`${username}${apiKey}pricelist`),
  });
  return Array.isArray(payload.data) ? payload.data : [];
}

export async function requestDigiflazzTransaction(input: {
  skuCode: string;
  customerNumber: string;
  referenceId: string;
}): Promise<DigiflazzTransactionData> {
  const { username, apiKey } = assertConfigured();
  const body: Record<string, unknown> = {
    username,
    buyer_sku_code: input.skuCode,
    customer_no: input.customerNumber,
    ref_id: input.referenceId,
    sign: md5(`${username}${apiKey}${input.referenceId}`),
  };
  if (env.DIGIFLAZZ_TESTING) body.testing = true;
  if (env.DIGIFLAZZ_CALLBACK_URL) body.cb_url = env.DIGIFLAZZ_CALLBACK_URL;

  const payload = await postDigiflazz<TransactionResponse>('/v1/transaction', body);
  if (!payload.data) {
    throw new AppError('PROVIDER_ERROR', 'Digiflazz returned an incomplete transaction.', 502);
  }
  return payload.data;
}

export function verifyDigiflazzWebhook(rawBody: string, signatureHeader: string | undefined): boolean {
  if (!env.DIGIFLAZZ_WEBHOOK_SECRET) return false;
  if (!signatureHeader?.startsWith('sha1=')) return false;
  const expected = `sha1=${crypto
    .createHmac('sha1', env.DIGIFLAZZ_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')}`;
  return safeEqual(expected, signatureHeader);
}

export function calculateDigiflazzSellingPrice(
  providerPrice: number,
  markupPercent = env.DIGIFLAZZ_MARKUP_PERCENT,
  minimumMarkup = env.DIGIFLAZZ_MINIMUM_MARKUP_AMOUNT,
): number {
  const percentageMarkup = Math.ceil((providerPrice * markupPercent) / 100);
  const markup = Math.max(percentageMarkup, minimumMarkup);
  const unrounded = providerPrice + markup;
  return Math.ceil(unrounded / 100) * 100;
}
