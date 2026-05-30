import type { NextApiRequest, NextApiResponse } from 'next';
import { bearerToken, verifySupabaseUser } from '@/lib/auth-server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

async function requireAdmin(userId: string) {
  const supabase = createSupabaseServiceClient();
  const result = await supabase.from('profiles').select('role,email').eq('id', userId).single();
  if (result.error) throw new Error(result.error.message);

  const role = String(result.data?.role || '').toLowerCase();
  return role === 'admin' || role === 'owner';
}

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifySupabaseUser(bearerToken(req.headers.authorization));
  if (!user) return res.status(401).json({ error: 'Login diperlukan.' });

  const isAdmin = await requireAdmin(user.id);
  if (!isAdmin) return res.status(403).json({ error: 'Akses admin diperlukan.' });

  const [ipify, ifconfig] = await Promise.allSettled([
    fetchJson('https://api.ipify.org?format=json'),
    fetchJson('https://ifconfig.me/all.json')
  ]);

  const ipifyData = ipify.status === 'fulfilled' ? ipify.value : null;
  const ifconfigData = ifconfig.status === 'fulfilled' ? ifconfig.value : null;
  const ip = ipifyData?.ip || ifconfigData?.ip_addr || null;

  return res.status(200).json({
    ip,
    vercel_region: process.env.VERCEL_REGION || null,
    checked_at: new Date().toISOString(),
    sources: {
      ipify: ipifyData,
      ifconfig: ifconfigData
    },
    note: ip
      ? `Whitelist IP ${ip} di VIPayment/Digiflazz untuk request yang berasal dari server Vercel saat ini.`
      : 'Gagal membaca IP outbound Vercel.'
  });
}
