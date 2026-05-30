import { createSupabaseServiceClient } from './supabase-server.js';
import { sendTelegramMessageToAdmins } from './telegram.js';

type CommerceAuditInput = {
  action: string;
  actor?: string;
  targetType?: string;
  targetId?: string;
  status?: string;
  amount?: number;
  userId?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
};

const rupiah = (value = 0) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export async function auditAndNotifyCommerce(input: CommerceAuditInput) {
  try {
    const supabase = createSupabaseServiceClient();
    await supabase.from('commerce_audit_log').insert({
      action: input.action,
      actor: input.actor || 'system',
      target_type: input.targetType || null,
      target_id: input.targetId || null,
      status: input.status || 'success',
      amount: input.amount || null,
      user_id: input.userId || null,
      reference: input.reference || null,
      metadata: input.metadata || {},
      created_at: new Date().toISOString()
    });
  } catch {}

  try {
    const isFailure = input.status === 'failed' || input.status === 'blocked';
    const emoji = isFailure ? '🚨' : '✅';
    const text = [
      `${emoji} Commerce Audit: ${input.action}`,
      `Actor: ${input.actor || 'system'}`,
      input.amount ? `Amount: ${rupiah(input.amount)}` : null,
      input.status ? `Status: ${input.status.toUpperCase()}` : null,
    ].filter(Boolean).join('\n');

    if (isFailure) {
      await sendTelegramMessageToAdmins(text).catch(() => {});
    }
  } catch {}
}
