import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

type TrustedDevice = {
  id: string;
  device_name: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_seen_at: string | null;
};

type ApiResponse =
  | {
      ok: true;
      devices?: TrustedDevice[];
      device?: TrustedDevice;
      deletedId?: string;
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

function getClientIp(req: NextApiRequest) {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(',')[0]?.trim() ?? null;
  }

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() ?? null;
  }

  return req.socket.remoteAddress ?? null;
}

function getDeviceName(body: unknown) {
  if (
    typeof body === 'object' &&
    body !== null &&
    'deviceName' in body &&
    typeof body.deviceName === 'string' &&
    body.deviceName.trim()
  ) {
    return body.deviceName.trim().slice(0, 120);
  }

  return 'Perangkat ini';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
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

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('id, device_name, user_agent, ip_address, created_at, last_seen_at')
      .eq('user_id', user.id)
      .order('last_seen_at', { ascending: false });

    if (error) {
      return res.status(500).json({ ok: false, error: 'Failed to load trusted devices' });
    }

    return res.status(200).json({ ok: true, devices: data ?? [] });
  }

  if (req.method === 'POST') {
    const userAgent = req.headers['user-agent'] ?? 'Unknown device';
    const ipAddress = getClientIp(req);
    const deviceName = getDeviceName(req.body);

    const { data, error } = await supabase
      .from('trusted_devices')
      .insert({
        user_id: user.id,
        device_name: deviceName,
        user_agent: userAgent,
        ip_address: ipAddress,
        last_seen_at: new Date().toISOString(),
      })
      .select('id, device_name, user_agent, ip_address, created_at, last_seen_at')
      .single();

    if (error) {
      return res.status(500).json({ ok: false, error: 'Failed to add trusted device' });
    }

    return res.status(201).json({ ok: true, device: data });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;

    if (typeof id !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing device id' });
    }

    const { error } = await supabase
      .from('trusted_devices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return res.status(500).json({ ok: false, error: 'Failed to delete trusted device' });
    }

    return res.status(200).json({ ok: true, deletedId: id });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
