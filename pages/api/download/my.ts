import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({ error: 'Download library has been removed. DLAVIE now uses PPOB/commerce order fulfillment.' });
}
