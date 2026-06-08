import { AppError } from '../../lib/errors';
import { getSupabaseAdmin } from '../../lib/supabase';
import { ConversationService } from '../chat/conversation.service';

export class AiHistoryService {
  private conversations = new ConversationService();

  async list(userId: string) {
    const items = await this.conversations.list(userId, 50);
    if (!items.length) return [];
    const ids = items.map((item: { id: string }) => item.id);
    const { data, error } = await (getSupabaseAdmin() as any).from('messages').select('conversation_id,content,created_at').eq('user_id', userId).in('conversation_id', ids).order('created_at', { ascending: false });
    if (error) throw new AppError('DATABASE_ERROR', 'Failed to load conversation previews.', 500, { message: error.message });
    const previews = new Map<string, string>();
    for (const message of data ?? []) if (!previews.has(message.conversation_id)) previews.set(message.conversation_id, message.content);
    return items.map((item: any) => ({ id: item.id, title: item.title || 'New conversation', mode: item.mode, createdAt: item.created_at, updatedAt: item.updated_at, preview: previews.get(item.id)?.slice(0, 180) || '' }));
  }

  async get(userId: string, conversationId: string) {
    await this.conversations.assertOwner(conversationId, userId);
    return this.conversations.messages(userId, conversationId, 200);
  }

  async delete(userId: string, conversationId: string) {
    return this.conversations.delete(userId, conversationId);
  }

  async deleteAll(userId: string) {
    const { error } = await (getSupabaseAdmin() as any).from('conversations').delete().eq('user_id', userId);
    if (error) throw new AppError('DATABASE_ERROR', 'Failed to delete AI history.', 500, { message: error.message });
  }
}
