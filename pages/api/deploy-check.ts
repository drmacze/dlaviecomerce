import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true, branch: 'dlavie-redesign-v1', feature: 'telegram-admin', generatedAt: new Date().toISOString() });
}
