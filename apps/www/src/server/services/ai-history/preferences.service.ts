import { AppError } from '../../lib/errors';
import { getSupabaseAdmin } from '../../lib/supabase';

export class AiPreferencesService {
  async get(userId: string): Promise<{ historyEnabled: boolean }> {
    const { data, error } = await (getSupabaseAdmin() as any).from('dlavie_ai_preferences').select('history_enabled').eq('user_id', userId).maybeSingle();
    if (error) throw new AppError('DATABASE_ERROR', 'Failed to load AI preferences.', 500, { message: error.message });
    return { historyEnabled: data?.history_enabled === true };
  }

  async update(userId: string, historyEnabled: boolean): Promise<{ historyEnabled: boolean }> {
    const { error } = await (getSupabaseAdmin() as any).from('dlavie_ai_preferences').upsert({ user_id: userId, history_enabled: historyEnabled, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) throw new AppError('DATABASE_ERROR', 'Failed to update AI preferences.', 500, { message: error.message });
    return { historyEnabled };
  }
}
