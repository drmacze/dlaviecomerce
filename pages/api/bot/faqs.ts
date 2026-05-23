import type { NextApiRequest, NextApiResponse } from 'next';
import { withBotApi } from './_lib/guard';
import { safeSelect } from './_lib/db';

export default withBotApi(['GET'], async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const result = await safeSelect('faqs', {
    filters: { enabled: true },
    orderBy: 'sort_order',
    ascending: true,
    limit: 200
  });

  res.status(200).json({
    ok: true,
    faqs: result.data,
    source: result.source
  });
});
