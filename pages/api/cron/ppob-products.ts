import type { NextApiRequest, NextApiResponse } from 'next';
import { syncDigiflazzPrepaidProducts } from '@/lib/ppob-sync';

function isAuthorizedCron(req: NextApiRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.authorization === `Bearer ${secret}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!isAuthorizedCron(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await syncDigiflazzPrepaidProducts();
    return res.status(200).json({ ...result, source: 'scheduled-ppob-products-sync' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PPOB products sync failed';
    return res.status(500).json({ error: message });
  }
}
