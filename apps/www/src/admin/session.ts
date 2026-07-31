import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { createClient, type Session } from '@supabase/supabase-js';

const version = 1 as const;
const algorithm = 'aes-256-gcm';
const associatedData = Buffer.from('dlavie-admin-session-v1', 'utf8');
const maximumEncodedLength = 3_500;
const cookieMaxAgeSeconds = 60 * 60 * 24 * 7;

export class AdminSessionConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminSessionConfigurationError';
  }
}

export type AdminSession = {
  version: typeof version;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  email: string;
};

function cookieName(): string {
  return process.env.NODE_ENV === 'production'
    ? '__Host-dlavie-admin-session'
    : 'dlavie-admin-session';
}

function key(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new AdminSessionConfigurationError(
      'ADMIN_SESSION_SECRET must contain at least 32 characters.',
    );
  }
  return createHash('sha256').update(secret, 'utf8').digest();
}

function serverSupabase() {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new AdminSessionConfigurationError(
      'SUPABASE_URL and SUPABASE_ANON_KEY are required for admin sign-in.',
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function validString(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === 'string' && value.length >= minimum && value.length <= maximum;
}

function normalize(value: unknown): AdminSession | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<AdminSession>;
  if (
    candidate.version !== version ||
    !validString(candidate.accessToken, 32, 8_192) ||
    !validString(candidate.refreshToken, 16, 2_048) ||
    typeof candidate.expiresAt !== 'number' ||
    !Number.isSafeInteger(candidate.expiresAt) ||
    candidate.expiresAt <= 0 ||
    !validString(candidate.userId, 1, 128) ||
    !validString(candidate.email, 3, 254)
  ) {
    return null;
  }
  return {
    version,
    accessToken: candidate.accessToken,
    refreshToken: candidate.refreshToken,
    expiresAt: candidate.expiresAt,
    userId: candidate.userId,
    email: candidate.email,
  };
}

function encrypt(session: AdminSession): string {
  const normalized = normalize(session);
  if (!normalized) throw new AdminSessionConfigurationError('Admin session is invalid.');
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, key(), iv);
  cipher.setAAD(associatedData);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(normalized), 'utf8'),
    cipher.final(),
  ]);
  const encoded = [iv, cipher.getAuthTag(), ciphertext]
    .map((value) => value.toString('base64url'))
    .join('.');
  if (encoded.length > maximumEncodedLength) {
    throw new AdminSessionConfigurationError('Encrypted admin session exceeds cookie limits.');
  }
  return encoded;
}

function decodeCanonicalBase64Url(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const decoded = Buffer.from(value, 'base64url');
  return decoded.toString('base64url') === value ? decoded : null;
}

function decrypt(encoded: string): AdminSession | null {
  try {
    const [ivValue, tagValue, ciphertextValue, extra] = encoded.split('.');
    if (!ivValue || !tagValue || !ciphertextValue || extra) return null;
    const iv = decodeCanonicalBase64Url(ivValue);
    const tag = decodeCanonicalBase64Url(tagValue);
    const ciphertext = decodeCanonicalBase64Url(ciphertextValue);
    if (!iv || !tag || !ciphertext) return null;
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) return null;
    const decipher = createDecipheriv(algorithm, key(), iv);
    decipher.setAAD(associatedData);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
      'utf8',
    );
    return normalize(JSON.parse(plaintext) as unknown);
  } catch {
    return null;
  }
}

function cookieValue(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    if (part.slice(0, separator).trim() === cookieName()) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
}

function fromSupabaseSession(session: Session): AdminSession | null {
  const expiresAt = session.expires_at;
  const email = session.user.email;
  if (!expiresAt || !email) return null;
  return normalize({
    version,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt,
    userId: session.user.id,
    email,
  });
}

export function readAdminSession(request: Request): AdminSession | null {
  key();
  const value = cookieValue(request.headers.get('cookie'));
  return value ? decrypt(value) : null;
}

export function adminSessionCookie(session: AdminSession): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${cookieName()}=${encrypt(session)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${cookieMaxAgeSeconds}${secure}`;
}

export function clearAdminSessionCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${cookieName()}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function signInAdmin(email: string, password: string): Promise<AdminSession> {
  const { data, error } = await serverSupabase().auth.signInWithPassword({ email, password });
  const session = data.session ? fromSupabaseSession(data.session) : null;
  if (error || !session) throw new Error('Email or password is invalid.');
  return session;
}

export async function refreshAdminSession(session: AdminSession): Promise<AdminSession> {
  if (session.expiresAt > Math.floor(Date.now() / 1_000) + 90) return session;
  const { data, error } = await serverSupabase().auth.refreshSession({
    refresh_token: session.refreshToken,
  });
  const refreshed = data.session ? fromSupabaseSession(data.session) : null;
  if (error || !refreshed) throw new Error('Admin session has expired.');
  return refreshed;
}

export async function revokeAdminSession(session: AdminSession): Promise<void> {
  const client = serverSupabase();
  await client.auth.setSession({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  await client.auth.signOut({ scope: 'local' });
}
