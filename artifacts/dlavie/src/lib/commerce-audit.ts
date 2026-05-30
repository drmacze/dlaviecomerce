import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { sendTelegramMessageToAdmins } from '@/lib/telegram';

type CommerceAuditInput = {
  action: string;
  actor?: string | null;
  targetType: string;
  targetId: string;
  status: 'success' | 'failed' | 'blocked';
  amount?: number | null;
  userId?: string | null;
  reference?: string | null;
  metadata?: Record<string, unknown>;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export async function writeCommerceAudit(input: CommerceAuditInput) {
  try {
    const supabase = createSupabaseServiceClient();
    await supabase.from('admin_audit_logs').insert({
      action: input.action,
      actor: input.actor || 'system',
      target_type: input.targetType,
      target_id: input.targetId,
      status: input.status,
      amount: input.amount || 0,
      user_id: input.userId || null,
      reference: input.reference || null,
      metadata: input.metadata || {},
    });
  } catch (error) {
    console.warn('Commerce audit log skipped:', error);
  }
}

export async function notifyCommerceAudit(input: CommerceAuditInput) {
  try {
    const title = input.status === 'success' ? '✅ Commerce action success' : input.status === 'blocked' ? '🛡 Commerce action blocked' : '⚠️ Commerce action failed';
    await sendTelegramMessageToAdmins([
      title,
      '',
      `Action: ${input.action}`,
      `Actor: ${input.actor || 'system'}`,
      `Target: ${input.targetType}/${input.targetId}`,
      `Status: ${input.status.toUpperCase()}`,
      input.amount ? `Amount: ${rupiah(input.amount)}` : '',
      input.userId ? `User: ${input.userId}` : '',
      input.reference ? `Ref: ${input.reference}` : '',
    ].filter(Boolean).join('\n'));
  } catch (error) {
    console.warn('Commerce audit telegram notification skipped:', error);
  }
}

export async function auditAndNotifyCommerce(input: CommerceAuditInput) {
  await Promise.allSettled([writeCommerceAudit(input), notifyCommerceAudit(input)]);
}
