import type { NextApiRequest, NextApiResponse } from 'next';
import { withBotApi } from '../_lib/guard';

export default withBotApi(['GET'], async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    methods: [],
    source: 'placeholder'
  });
});
