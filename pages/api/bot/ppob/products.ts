import type { NextApiRequest, NextApiResponse } from 'next';
import { withBotApi, asString } from '../_lib/guard';
import { safeSelect } from '../_lib/db';

export default withBotApi(['GET'], async function handler(req: NextApiRequest, res: NextApiResponse) {
  const category = asString(req.query.category);
  const provider = asString(req.query.provider);

  const filters: Record<string, string | boolean> = { enabled: true };
  if (category) filters.category = category;
  if (provider) filters.provider = provider;

  const result = await safeSelect('ppob_products', {
    filters,
    orderBy: 'sort_order',
    ascending: true,
    limit: 300
  });

  res.status(200).json({
    ok: true,
    products: result.data,
    source: result.source
  });
});
