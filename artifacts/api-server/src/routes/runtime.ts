import { Router } from 'express';
import { getRuntimeState } from '../lib/runtime-control.js';
import { createSupabaseServiceClient } from '../lib/supabase-server.js';

const router = Router();

const fallback = {
  maintenance: { enabled: false, title: 'DLAVIE sedang maintenance', message: 'Kami sedang meningkatkan sistem.' },
  demo: { enabled: false, title: 'Mode demo aktif', message: 'Kamu bisa melihat halaman, tapi transaksi dinonaktifkan.' },
  announcement: { enabled: true, version: 'welcome-v1', title: 'Kenali DLAVIE', message: 'Lihat wallet, produk, orders, dan notifikasi sebelum mulai transaksi.' }
};

router.get('/runtime', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const state = await getRuntimeState();
    res.status(200).json({ ok: true, ...state });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Runtime status failed';
    res.status(500).json({ ok: false, error: message });
  }
});

router.get('/runtime/status', async (_req, res) => {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.from('dlavie_runtime_settings').select('key,value');
    if (error) return res.status(200).json({ ok: true, ...fallback, degraded: true });
    type Setting = { key: string; value: Record<string, unknown> };
    const mapped = Object.fromEntries(((data || []) as Setting[]).map((row) => [row.key, row.value || {}]));
    return res.status(200).json({ ok: true, ...fallback, ...mapped });
  } catch {
    return res.status(200).json({ ok: true, ...fallback, degraded: true });
  }
});

export default router;
