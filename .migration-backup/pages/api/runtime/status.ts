import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type Setting = { key: string; value: Record<string, unknown> };

const fallback = {
  maintenance: { enabled: false, title: 'DLAVIE sedang maintenance', message: 'Kami sedang meningkatkan sistem.' },
  demo: { enabled: false, title: 'Mode demo aktif', message: 'Kamu bisa melihat halaman, tapi transaksi dinonaktifkan.' },
  announcement: { enabled: true, version: 'welcome-v1', videoUrl: 'https://image-link.edgeone.app/1779988010622-t0qa9o.mp4', title: 'Kenali DLAVIE', message: 'Lihat wallet, produk, orders, dan notifikasi sebelum mulai transaksi.' }
};

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('dlavie_runtime_settings').select('key,value');
    if (error) return res.status(200).json({ ok: true, ...fallback, degraded: true });
    const mapped = Object.fromEntries(((data || []) as Setting[]).map((row) => [row.key, row.value || {}]));
    return res.status(200).json({ ok: true, ...fallback, ...mapped });
  } catch {
    return res.status(200).json({ ok: true, ...fallback, degraded: true });
  }
}
