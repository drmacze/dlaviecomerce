import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyDigiflazzWebhookSignature } from '@/lib/digiflazz';
import type { DigiflazzWebhookPayload } from '@/lib/digiflazz';
import { settlePpobOrder } from '@/lib/ppob-settlement';

export const config = {
  api: {
    bodyParser: false
  }
};

const DEFAULT_DIGIFLAZZ_ALLOWED_IPS = ['52.74.250.133'];

function configuredAllowedIps() {
  const custom = (process.env.DIGIFLAZZ_ALLOWED_IPS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return custom.length ? custom : DEFAULT_DIGIFLAZZ_ALLOWED_IPS;
}

function clientIp(req: NextApiRequest) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0];
  return String(firstForwardedIp || req.socket.remoteAddress || '').trim().replace(/^::ffff:/, '');
}

function isAllowedDigiflazzIp(req: NextApiRequest) {
  const allowedIps = configuredAllowedIps();
  const ip = clientIp(req);
  return Boolean(ip && allowedIps.includes(ip));
}

async function readRawBody(req: NextApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, service: 'dlavie-digiflazz-webhook' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAllowedDigiflazzIp(req)) return res.status(403).json({ error: 'Forbidden webhook source' });

  const rawBody = await readRawBody(req);
  if (!verifyDigiflazzWebhookSignature(rawBody, req.headers['x-hub-signature'])) {
    return res.status(401).json({ error: 'Invalid Digiflazz signature' });
  }

  let payload: DigiflazzWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as DigiflazzWebhookPayload;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const data = payload.data;
  const refId = String(data?.ref_id || '');
  if (!data || !refId) return res.status(200).json({ ok: true, ignored: true, reason: 'missing-ref-id' });

  try {
    const result = await settlePpobOrder(refId, data, 'digiflazz_webhook');
    return res.status(200).json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Digiflazz webhook failed';
    return res.status(500).json({ error: message });
  }
}
