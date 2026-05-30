import crypto from 'crypto';

export type DigiflazzStatus = 'success' | 'pending' | 'failed';

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

export type DigiflazzWebhookPayload = {
  data?: DigiflazzTransactionData;
};

type PriceListResponse = { data?: DigiflazzPriceProduct[] };
type TransactionResponse = { data?: DigiflazzTransactionData };

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function md5(value: string) {
  return crypto.createHash('md5').update(value).digest('hex');
}

export function digiflazzUsername() {
  return requiredEnv('DIGIFLAZZ_USERNAME');
}

export function digiflazzApiKey() {
  return requiredEnv('DIGIFLAZZ_API_KEY');
}

export function digiflazzBaseUrl() {
  return import.meta.env.DIGIFLAZZ_BASE_URL || 'https://api.digiflazz.com';
}

export function digiflazzTestingEnabled() {
  return import.meta.env.DIGIFLAZZ_TESTING === 'true';
}

export function digiflazzCallbackUrl() {
  return import.meta.env.DIGIFLAZZ_CALLBACK_URL || '';
}

export function digiflazzPriceListSign() {
  return md5(`${digiflazzUsername()}${digiflazzApiKey()}pricelist`);
}

export function digiflazzTopupSign(refId: string) {
  return md5(`${digiflazzUsername()}${digiflazzApiKey()}${refId}`);
}

export function normalizeDigiflazzStatus(status?: string): DigiflazzStatus {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'sukses' || value === 'success') return 'success';
  if (value === 'gagal' || value === 'failed') return 'failed';
  return 'pending';
}

export function verifyDigiflazzWebhookSignature(rawBody: string, header?: string | string[]) {
  const secret = import.meta.env.DIGIFLAZZ_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = Array.isArray(header) ? header[0] : header;
  if (!signature?.startsWith('sha1=')) return false;

  const expected = `sha1=${crypto.createHmac('sha1', secret).update(rawBody).digest('hex')}`;
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return signatureBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

async function digiflazzPost<T>(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${digiflazzBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let json: T;
  try {
    json = JSON.parse(text) as T;
  } catch {
    throw new Error(`Digiflazz returned non JSON response: ${text.slice(0, 180)}`);
  }

  if (!res.ok) throw new Error(`Digiflazz request failed with HTTP ${res.status}`);
  return json;
}

export async function fetchDigiflazzPriceList(cmd: 'prepaid' | 'pasca' = 'prepaid') {
  const payload = {
    cmd,
    username: digiflazzUsername(),
    sign: digiflazzPriceListSign()
  };
  const json = await digiflazzPost<PriceListResponse>('/v1/price-list', payload);
  return Array.isArray(json.data) ? json.data : [];
}

export async function requestDigiflazzTopup(input: { skuCode: string; customerNo: string; refId: string }) {
  const cbUrl = digiflazzCallbackUrl();
  const payload: Record<string, unknown> = {
    username: digiflazzUsername(),
    buyer_sku_code: input.skuCode,
    customer_no: input.customerNo,
    ref_id: input.refId,
    sign: digiflazzTopupSign(input.refId)
  };

  if (digiflazzTestingEnabled()) payload.testing = true;
  if (cbUrl) payload.cb_url = cbUrl;

  const json = await digiflazzPost<TransactionResponse>('/v1/transaction', payload);
  if (!json.data) throw new Error('Digiflazz response missing data payload');
  return json.data;
}
