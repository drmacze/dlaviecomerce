import type { NextApiRequest, NextApiResponse } from 'next';
import { withBotApi, asString, publicId } from './_lib/guard';
import { safeInsert, safeSelect } from './_lib/db';

export default withBotApi(['GET', 'POST'], async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const waNumber = asString(req.query.waNumber);
    const filters: Record<string, string> = {};
    if (waNumber) filters.wa_number = waNumber;

    const result = await safeSelect('tickets', {
      filters,
      orderBy: 'created_at',
      ascending: false,
      limit: 50
    });

    res.status(200).json({ ok: true, tickets: result.data, source: result.source });
    return;
  }

  const body = req.body || {};
  const ticketNumber = publicId('TICKET');
  const payload = {
    ticket_number: ticketNumber,
    channel: 'whatsapp',
    wa_number: asString(body.waNumber),
    account_id: asString(body.accountId),
    category: asString(body.category, 'lainnya'),
    subject: asString(body.subject, 'Pengajuan CS Dlavie'),
    description: asString(body.description),
    photo_url: asString(body.photoUrl),
    status: 'open',
    priority: asString(body.priority, 'normal'),
    created_at: new Date().toISOString()
  };

  const result = await safeInsert('tickets', payload);

  if (!result.ok) {
    res.status(503).json({ ok: false, error: result.error });
    return;
  }

  res.status(201).json({
    ok: true,
    ticket: result.data,
    ticketNumber
  });
});
