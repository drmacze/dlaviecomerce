import type { NextApiRequest, NextApiResponse } from 'next';

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const orderNumber = makeId('PPOB');
  return res.status(201).json({
    ok: true,
    order: { order_number: orderNumber, status: 'pending' },
    orderNumber
  });
}
