import crypto from 'crypto';

export type VipaymentService = {
  code?: string;
  name?: string;
  price?: number | string | { basic?: number | string; premium?: number | string; special?: number | string };
  status?: string | boolean;
  category?: string;
  brand?: string;
  type?: string;
  prepost?: string;
  note?: string;
  multi?: string | boolean;
  multi_trx?: string | boolean;
  maintenace?: string;
};

export type VipaymentTransaction = {
  trxid?: string;
  data?: string;
  data_no?: string;
  service?: string;
  service_name?: string;
  code?: string;
  status?: string;
  note?: string;
  price?: number | string;
  balance?: number | string;
};

export type VipaymentProfile = {
  full_name?: string;
  username?: string;
  balance?: number | string;
  point?: number | string;
  level?: string;
  registered?: string;
};

type VipaymentResponse<T> = {
  result?: boolean;
  status?: boolean | string;
  message?: string;
  data?: T;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function md5(value: string) {
  return crypto.createHash('md5').update(value).digest('hex');
}

export function vipaymentBaseUrl() {
  return process.env.VIPAYMENT_BASE_URL || 'https://vip-reseller.co.id';
}

export function vipaymentApiId() {
  return requiredEnv('VIPAYMENT_API_ID');
}

export function vipaymentApiKey() {
  return requiredEnv('VIPAYMENT_API_KEY');
}

export function vipaymentSign() {
  return md5(`${vipaymentApiId()}${vipaymentApiKey()}`);
}

export function hasVipaymentEnv() {
  return Boolean(process.env.VIPAYMENT_API_ID && process.env.VIPAYMENT_API_KEY);
}

async function postVipayment<T>(path: string, input: Record<string, string | number | boolean | undefined>) {
  const body = new URLSearchParams();
  body.set('key', vipaymentApiKey());
  body.set('sign', vipaymentSign());

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null && value !== '') body.set(key, String(value));
  }

  const response = await fetch(`${vipaymentBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body: body.toString()
  });

  const text = await response.text();
  let json: VipaymentResponse<T>;
  try {
    json = JSON.parse(text) as VipaymentResponse<T>;
  } catch {
    throw new Error(`VIPayment returned non JSON response: ${text.slice(0, 180)}`);
  }

  if (!response.ok) throw new Error(`VIPayment request failed with HTTP ${response.status}`);
  if (json.result === false || json.status === false) throw new Error(json.message || 'VIPayment request rejected');
  return json;
}

export async function fetchVipaymentProfile() {
  const json = await postVipayment<VipaymentProfile>('/api/profile', {});
  if (!json.data) throw new Error('VIPayment profile response missing data payload');
  return json.data;
}

export async function fetchVipaymentPrepaidServices(input?: { filterType?: string; filterValue?: string }) {
  const json = await postVipayment<VipaymentService[]>('/api/prepaid', {
    type: 'services',
    filter_type: input?.filterType,
    filter_value: input?.filterValue
  });

  return Array.isArray(json.data) ? json.data : [];
}

export async function requestVipaymentPrepaidOrder(input: { service: string; dataNo: string }) {
  const json = await postVipayment<VipaymentTransaction>('/api/prepaid', {
    type: 'order',
    service: input.service,
    data_no: input.dataNo
  });

  if (!json.data) throw new Error('VIPayment order response missing data payload');
  return json.data;
}

export async function fetchVipaymentPrepaidStatus(input: { trxid: string }) {
  const json = await postVipayment<VipaymentTransaction | VipaymentTransaction[]>('/api/prepaid', {
    type: 'status',
    trxid: input.trxid
  });

  return json.data;
}
