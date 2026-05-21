import type { NextApiRequest } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type JsonRecord = Record<string, unknown>;

export type NotificationLogInput = {
  type: string;
  channel?: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  recipient?: string;
  title?: string;
  message?: string;
  payload?: JsonRecord;
  errorMessage?: string;
  sentAt?: string;
};

export type AuditLogInput = {
  adminEmail?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: JsonRecord;
  req?: NextApiRequest;
};

function firstHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getRequestIp(req?: NextApiRequest) {
  if (!req) return undefined;
  return firstHeader(req.headers['x-forwarded-for'])?.split(',')[0]?.trim() || req.socket.remoteAddress;
}

export function getUserAgent(req?: NextApiRequest) {
  if (!req) return undefined;
  return firstHeader(req.headers['user-agent']);
}

export async function writeNotificationLog(input: NotificationLogInput) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('notification_logs')
    .insert({
      type: input.type,
      channel: input.channel || 'telegram',
      status: input.status,
      recipient: input.recipient || null,
      title: input.title || null,
      message: input.message || null,
      payload: input.payload || {},
      error_message: input.errorMessage || null,
      sent_at: input.sentAt || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('writeNotificationLog failed:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id as string | undefined };
}

export async function writeAuditLog(input: AuditLogInput) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .insert({
      admin_email: input.adminEmail || null,
      action: input.action,
      target_type: input.targetType || null,
      target_id: input.targetId || null,
      metadata: input.metadata || {},
      ip_address: getRequestIp(input.req) || null,
      user_agent: getUserAgent(input.req) || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('writeAuditLog failed:', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id as string | undefined };
}
