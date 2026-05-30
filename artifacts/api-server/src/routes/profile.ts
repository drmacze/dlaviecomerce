import { Router } from 'express';
import { bearerToken, verifySupabaseUser } from '../lib/auth-server.js';
import { createSupabaseServiceClient } from '../lib/supabase-server.js';

const router = Router();

function referralCode(email?: string | null, id?: string) {
  const name = String(email || 'DLAVIE').split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 5).toUpperCase() || 'DLV';
  return `DLV-${name}-${String(id || '').slice(0, 4).toUpperCase()}`;
}

router.get('/profile', async (req, res) => {
  try {
    const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const supabase = createSupabaseServiceClient();
    const existing = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

    if (existing.data) {
      if (!existing.data.referral_code) {
        const patched = await supabase.from('profiles').update({ referral_code: referralCode(existing.data.email || user.email, user.id) }).eq('id', user.id).select('*').single();
        if (!patched.error) return res.status(200).json({ profile: patched.data });
      }
      return res.status(200).json({ profile: existing.data });
    }

    const created = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || null,
      referral_code: referralCode(user.email, user.id),
      vip_level: 'free',
      affiliate_rank: 'starter'
    }).select('*').single();
    if (created.error) return res.status(500).json({ error: created.error.message });
    return res.status(200).json({ profile: created.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Profile failed';
    return res.status(500).json({ error: message });
  }
});

export default router;
