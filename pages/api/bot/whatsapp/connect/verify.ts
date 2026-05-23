import type { NextApiRequest, NextApiResponse } from 'next';

function cleanText(value: unknown, max = 120) {
  return String(value || '')
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Gunakan GET atau POST.'
    });
  }

  const sessionId = cleanText(req.query.session_id || req.body?.session_id, 120);

  if (!sessionId) {
    return res.status(400).json({
      ok: false,
      error: 'session_id wajib diisi.'
    });
  }

  return res.status(200).json({
    ok: true,
    session_id: sessionId,
    status: 'pending',
    connected: false,
    mode: 'manual-test',
    message: 'Endpoint verify aktif. Session WhatsApp belum tersambung karena adapter WhatsApp asli belum dipasang.',
    next: {
      instruction: 'Jika endpoint ini sudah merespon, struktur folder connect sudah benar dan siap disambungkan ke adapter WhatsApp.'
    }
  });
}
