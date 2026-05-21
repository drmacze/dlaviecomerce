import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminFromAuthHeader } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { writeAuditLog } from '@/lib/observability';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdminFromAuthHeader(req.headers.authorization);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = createSupabaseServiceClient();
  const [notifications, audits] = await Promise.all([
    supabase
      .from('notification_logs')
      .select('id, type, channel, status, recipient, title, error_message, sent_at, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('admin_audit_logs')
      .select('id, admin_email, action, target_type, target_id, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  if (notifications.error) return res.status(500).json({ error: notifications.error.message });
  if (audits.error) return res.status(500).json({ error: audits.error.message });

  await writeAuditLog({
    adminEmail: admin.email || undefined,
    action: 'observability.read',
    targetType: 'admin_observability',
    metadata: { notificationCount: notifications.data?.length || 0, auditCount: audits.data?.length || 0 },
    req,
  });

  return res.status(200).json({
    notifications: notifications.data || [],
    audits: audits.data || [],
  });
}
