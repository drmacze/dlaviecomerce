import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminFromAuthHeader } from '@/lib/auth-server';
import { writeAuditLog } from '@/lib/observability';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

async function safeCount(supabase: ReturnType<typeof createSupabaseServiceClient>, table: string) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return { count: count || 0, error: error?.message || null };
}

async function safeRows(supabase: ReturnType<typeof createSupabaseServiceClient>, table: string, query: string, limit = 25) {
  const { data, error } = await supabase.from(table).select(query).order('created_at', { ascending: false }).limit(limit);
  return { rows: data || [], error: error?.message || null };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdminFromAuthHeader(req.headers.authorization);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = createSupabaseServiceClient();
  const [ordersCount, productsCount, couponsCount, profilesCount, notificationLogsCount, auditLogsCount, ordersResult, productsResult, couponsResult, notificationResult, auditResult] = await Promise.all([
    safeCount(supabase, 'orders'),
    safeCount(supabase, 'products'),
    safeCount(supabase, 'coupons'),
    safeCount(supabase, 'profiles'),
    safeCount(supabase, 'notification_logs'),
    safeCount(supabase, 'admin_audit_logs'),
    safeRows(supabase, 'orders', 'id, buyer_email, total_amount, status, created_at', 50),
    safeRows(supabase, 'products', 'id, name, price, is_published, stock, created_at', 20),
    safeRows(supabase, 'coupons', 'id, code, discount_type, amount, is_active, redeemed_count, usage_limit, created_at', 20),
    safeRows(supabase, 'notification_logs', 'id, type, channel, status, title, created_at', 20),
    safeRows(supabase, 'admin_audit_logs', 'id, admin_email, action, target_type, target_id, created_at', 20),
  ]);

  const orders = ordersResult.rows as Array<{ total_amount?: number; status?: string }>;
  const revenueVisible = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const statusBreakdown = orders.reduce<Record<string, number>>((acc, order) => {
    const key = String(order.status || 'unknown');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const notifications = notificationResult.rows as Array<{ status?: string }>;
  const notificationBreakdown = notifications.reduce<Record<string, number>>((acc, item) => {
    const key = String(item.status || 'unknown');
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  await writeAuditLog({
    adminEmail: admin.email || undefined,
    action: 'admin.stats.read',
    targetType: 'admin_stats',
    metadata: { visibleOrders: orders.length, visibleNotifications: notifications.length },
    req,
  });

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    counts: {
      orders: ordersCount,
      products: productsCount,
      coupons: couponsCount,
      profiles: profilesCount,
      notificationLogs: notificationLogsCount,
      auditLogs: auditLogsCount,
    },
    commerce: {
      revenueVisible,
      statusBreakdown,
      recentOrders: ordersResult.rows,
    },
    catalog: {
      recentProducts: productsResult.rows,
      recentCoupons: couponsResult.rows,
    },
    observability: {
      notificationBreakdown,
      recentNotifications: notificationResult.rows,
      recentAudits: auditResult.rows,
    },
    health: {
      supabase: 'reachable',
      env: {
        appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
        supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        adminEmails: Boolean(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
        telegramBot: Boolean(process.env.TELEGRAM_BOT_TOKEN),
        telegramAdmins: Boolean(process.env.DLAVIE_ADMIN_IDS),
        telegramSetup: Boolean(process.env.TELEGRAM_SETUP_KEY),
      },
      tableErrors: {
        orders: ordersCount.error || ordersResult.error,
        products: productsCount.error || productsResult.error,
        coupons: couponsCount.error || couponsResult.error,
        profiles: profilesCount.error,
        notificationLogs: notificationLogsCount.error || notificationResult.error,
        auditLogs: auditLogsCount.error || auditResult.error,
      },
    },
  });
}
