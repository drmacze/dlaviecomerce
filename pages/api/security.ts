import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

type SecurityResponse =
  | {
      ok: true;
      user: {
        id: string;
        email: string | null;
        emailConfirmed: boolean;
        createdAt: string | null;
        lastSignInAt: string | null;
      };
      trustedDeviceCount: number;
    }
  | {
      ok: false;
      error: string;
    };

function getBearerToken(req: NextApiRequest) {
  const authorization = req.headers.authorization;

  if (!authorization) return null;

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) return null;

  return token;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SecurityResponse>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const supabase = createSupabaseAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ ok: false, error: 'Invalid session' });
  }

  const { count, error: deviceError } = await supabase
    .from('trusted_devices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (deviceError) {
    return res.status(500).json({ ok: false, error: 'Failed to load security data' });
  }

  return res.status(200).json({
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? null,
      emailConfirmed: Boolean(user.email_confirmed_at),
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
    },
    trustedDeviceCount: count ?? 0,
  });
}
