import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, service: 'dlavie-midtrans-recurring-webhook' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Reserved for future DLAVIE subscription / recurring payment flows.
  // Return 200 so Midtrans dashboard URL tests and future non-critical notifications do not fail.
  return res.status(200).json({ ok: true, received: true, service: 'dlavie-midtrans-recurring-webhook' });
}
