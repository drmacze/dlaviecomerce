import crypto from 'crypto';

export function midtransServerKey() {
  return process.env.MIDTRANS_SERVER_KEY || '';
}

export function midtransBaseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com';
}

export function midtransAuthHeader() {
  const key = midtransServerKey();
  if (!key) throw new Error('MIDTRANS_SERVER_KEY is not configured');
  return `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
}

export function verifyMidtransSignature(payload: { order_id?: string; status_code?: string; gross_amount?: string; signature_key?: string }) {
  const key = midtransServerKey();
  if (!key) return false;
  const raw = `${payload.order_id || ''}${payload.status_code || ''}${payload.gross_amount || ''}${key}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');
  return Boolean(payload.signature_key && expected === payload.signature_key);
}

export function isPaidMidtransStatus(status?: string, fraudStatus?: string) {
  return status === 'settlement' || (status === 'capture' && (!fraudStatus || fraudStatus === 'accept'));
}

export function isFailedMidtransStatus(status?: string) {
  return ['deny', 'cancel', 'expire', 'failure'].includes(String(status || ''));
}
