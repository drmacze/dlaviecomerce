import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';

const allowed = ['paid', 'fulfilled', 'cancelled'];

function appBaseUrl(req: NextApiRequest) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  if (host) return `${proto}://${host}`.replace(/\/$/, '');
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://dlaviecomerce-dlavie.vercel.app').replace(/\/$/, '');
}

function actionKey() {
  return String(process.env.DLAVIE_ADMIN_ACTION_KEY || process.env.TELEGRAM_SETUP_KEY || '').trim();
}

function rupiah(value = 0) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = String(req.query.key || '').trim();
    const orderId = String(req.query.orderId || '').trim();
    const status = String(req.query.status || '').trim().toLowerCase();
    const secret = actionKey();

    if (!secret || key !== secret) return res.status(401).json({ error: 'Invalid action key' });
    if (!orderId) return res.status(400).json({ error: 'orderId wajib diisi' });
    if (!allowed.includes(status)) return res.status(400).json({ error: 'status tidak valid' });

    const supabase = createSupabaseServiceClient();
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('id, buyer_email, total_amount, status')
      .single();

    if (error || !order) return res.status(404).json({ error: error?.message || 'Order tidak ditemukan' });

    await sendTelegramMessageToAdmins([
      '✅ Order status updated',
      '',
      `Order: ${String(order.id).slice(0, 8)}...`,
      `Email: ${order.buyer_email}`,
      `Total: ${rupiah(order.total_amount)}`,
      `Status: ${String(order.status).toUpperCase()}`,
    ].join('\n'), {
      replyMarkup: {
        inline_keyboard: [[{ text: '🛒 Open Orders', url: `${appBaseUrl(req)}/admin/order-pulse?orderId=${encodeURIComponent(String(order.id))}` }]],
      },
    });

    res.writeHead(302, { Location: `/admin/order-pulse?orderId=${encodeURIComponent(String(order.id))}` });
    return res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Order action failed';
    return res.status(500).json({ error: message });
  }
}
