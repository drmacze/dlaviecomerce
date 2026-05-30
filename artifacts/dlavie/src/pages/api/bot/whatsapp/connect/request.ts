import type { NextApiRequest, NextApiResponse } from 'next';

type ConnectRequestBody = {
  phone?: string;
  device_name?: string;
};

function cleanText(value: unknown, max = 80) {
  return String(value || '')
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, max);
}

function normalizePhone(value: unknown) {
  return String(value || '')
    .replace(/[^0-9]/g, '')
    .slice(0, 20);
}

function createSessionId() {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `DLV-WA-${Date.now()}-${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Gunakan POST.'
    });
  }

  const body = (req.body || {}) as ConnectRequestBody;
  const phone = normalizePhone(body.phone);
  const deviceName = cleanText(body.device_name || 'Dlavie WhatsApp Bot', 80);

  if (phone.length < 9) {
    return res.status(400).json({
      ok: false,
      error: 'Nomor WhatsApp wajib diisi dengan format valid, contoh 628xxxxxxxxxx.'
    });
  }

  const sessionId = createSessionId();

  return res.status(200).json({
    ok: true,
    status: 'pending',
    mode: 'manual-test',
    session_id: sessionId,
    phone,
    device_name: deviceName,
    message: 'Request koneksi WhatsApp dibuat. Tahap ini masih manual-test; integrasi Baileys/WhatsApp Cloud API bisa disambungkan setelah endpoint dasar aktif.',
    next: {
      verify_url: `/api/bot/whatsapp/connect/verify?session_id=${encodeURIComponent(sessionId)}`,
      instruction: 'Panggil verify_url untuk cek status session.'
    }
  });
}
