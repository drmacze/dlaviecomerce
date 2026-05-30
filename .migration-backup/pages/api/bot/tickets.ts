import type { NextApiRequest, NextApiResponse } from 'next';

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, tickets: [] });
  }

  if (req.method === 'POST') {
    const ticketNumber = makeId('TICKET');
    return res.status(201).json({ ok: true, ticket: { ticket_number: ticketNumber, status: 'open' }, ticketNumber });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
