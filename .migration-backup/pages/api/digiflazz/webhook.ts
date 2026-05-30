import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false
  }
};

function headerValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(rawBody: Buffer, signature?: string) {
  const secret = process.env.DIGIFLAZZ_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  const expected = `sha1=${crypto.createHmac('sha1', secret).update(rawBody).digest('hex')}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const rawBody = await readRawBody(req);
  const signature = headerValue(req.headers['x-hub-signature']);
  if (!verifySignature(rawBody, signature)) return res.status(401).json({ ok: false, error: 'Invalid signature' });

  let payload: unknown = {};
  try {
    payload = rawBody.length ? JSON.parse(rawBody.toString('utf8')) : {};
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }

  console.log('[digiflazz-webhook]', {
    event: headerValue(req.headers['x-digiflazz-event']) || null,
    user_agent: headerValue(req.headers['user-agent']) || null,
    payload
  });

  return res.status(200).json({ ok: true });
}
