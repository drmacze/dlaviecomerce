import type { NextApiRequest, NextApiResponse } from 'next';
import { getRuntimeState } from '@/lib/runtime-control';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const state = await getRuntimeState();
    return res.status(200).json({ ok: true, ...state });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Runtime status failed';
    return res.status(500).json({ ok: false, error: message });
  }
}
