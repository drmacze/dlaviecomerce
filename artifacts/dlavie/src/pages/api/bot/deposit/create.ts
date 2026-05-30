import type { NextApiRequest, NextApiResponse } from 'next';
import { withBotApi, asString, asNumber, publicId } from '../_lib/guard';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

async function insertDepositRequest(payload: Record<string, unknown>) {
  const supabase = createSupabaseServiceClient();
  const result = await supabase.from('deposit_requests').insert(payload).select('*').single();

  if (result.error) {
    return { ok: false, data: null, error: result.error.message };
  }

  return { ok: true, data: result.data, error: null };
}

export default withBotApi(['POST'], async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body || {};
  const depositNumber = publicId('DEP');

  const payload = {
    deposit_number: depositNumber,
    channel: 'whatsapp',
    wa_number: asString(body.waNumber),
    account_id: asString(body.accountId),
    method_id: asString(body.methodId),
    method_name: asString(body.methodName),
    amount: asNumber(body.amount),
    status: 'pending',
    raw_payload: body,
    created_at: new Date().toISOString()
  };

  const result = await insertDepositRequest(payload);

  if (!result.ok) {
    res.status(503).json({ ok: false, error: result.error });
    return;
  }

  res.status(201).json({
    ok: true,
    deposit: result.data,
    depositNumber
  });
});
