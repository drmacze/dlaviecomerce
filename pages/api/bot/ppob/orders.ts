import type { NextApiRequest, NextApiResponse } from 'next';
import { withBotApi, asString, asNumber, publicId } from '../_lib/guard';
import { safeInsert } from '../_lib/db';

export default withBotApi(['POST'], async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body || {};
  const orderNumber = publicId('PPOB');

  const payload = {
    order_number: orderNumber,
    channel: 'whatsapp',
    wa_number: asString(body.waNumber),
    account_id: asString(body.accountId),
    product_id: asString(body.productId),
    product_code: asString(body.productCode),
    product_name: asString(body.productName),
    target: asString(body.target),
    customer_note: asString(body.note),
    price: asNumber(body.price),
    status: 'pending',
    raw_payload: body,
    created_at: new Date().toISOString()
  };

  const result = await safeInsert('ppob_orders', payload);

  if (!result.ok) {
    res.status(503).json({ ok: false, error: result.error });
    return;
  }

  res.status(201).json({
    ok: true,
    order: result.data,
    orderNumber
  });
});
