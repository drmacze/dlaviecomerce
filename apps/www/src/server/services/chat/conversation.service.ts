import { AppError } from '../../lib/errors';
import { getSupabaseAdmin } from '../../lib/supabase';
import type { ChatMode, ChatRole } from '../../types/ai';
export class ConversationService {
  async createConversation(userId: string, mode: ChatMode, title?: string): Promise<string> {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('conversations')
      .insert({ user_id: userId, mode, title: title?.slice(0, 120) ?? 'New conversation' })
      .select('id')
      .single();
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to create conversation.', 500, {
        message: error.message,
      });
    return data.id;
  }
  async assertOwner(conversationId: string, userId: string): Promise<void> {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to load conversation.', 500, {
        message: error.message,
      });
    if (!data) throw new AppError('NOT_FOUND', 'Conversation not found.', 404);
  }
  async addMessage(input: {
    conversationId: string;
    userId: string;
    role: ChatRole;
    content: string;
    model?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const { data, error } = await (getSupabaseAdmin() as any)
      .from('messages')
      .insert({
        conversation_id: input.conversationId,
        user_id: input.userId,
        role: input.role,
        content: input.content,
        model: input.model,
        provider: input.provider,
        metadata: input.metadata ?? {},
      })
      .select('id')
      .single();
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to store message.', 500, {
        message: error.message,
      });
    await (getSupabaseAdmin() as any)
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', input.conversationId);
    return data.id;
  }
  async list(userId: string, limit: number, cursor?: string) {
    let q = (getSupabaseAdmin() as any)
      .from('conversations')
      .select('id,title,mode,created_at,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (cursor) q = q.lt('updated_at', cursor);
    const { data, error } = await q;
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to list conversations.', 500, {
        message: error.message,
      });
    return data ?? [];
  }
  async messages(userId: string, conversationId: string, limit: number, cursor?: string) {
    await this.assertOwner(conversationId, userId);
    let q = (getSupabaseAdmin() as any)
      .from('messages')
      .select('id,role,content,created_at,metadata')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (cursor) q = q.gt('created_at', cursor);
    const { data, error } = await q;
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to list messages.', 500, {
        message: error.message,
      });
    return data ?? [];
  }
  async delete(userId: string, conversationId: string): Promise<void> {
    await this.assertOwner(conversationId, userId);
    const { error } = await (getSupabaseAdmin() as any)
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);
    if (error)
      throw new AppError('DATABASE_ERROR', 'Failed to delete conversation.', 500, {
        message: error.message,
      });
  }
}
