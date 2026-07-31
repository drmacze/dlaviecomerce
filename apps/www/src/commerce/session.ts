import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto';

const sessionVersion = 1 as const;
const algorithm = 'aes-256-gcm';
const associatedData = Buffer.from('dlavie-commerce-session-v1', 'utf8');
const cookieMaxAgeSeconds = 60 * 60 * 24 * 90;
const maximumStoredOrders = 6;
const maximumEncodedSessionLength = 3_500;

export class CommerceSessionConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommerceSessionConfigurationError';
  }
}

type CartCredential = {
  id: string;
  token: string;
  expiresAt: string;
};

type OrderCredential = {
  orderNumber: string;
  token: string;
  storedAt: string;
};

export type CommerceSession = {
  version: typeof sessionVersion;
  cart?: CartCredential;
  orders: OrderCredential[];
};

export type PublicCommerceSession = {
  cart: { id: string; expiresAt: string } | null;
  orderNumbers: string[];
};

function emptySession(): CommerceSession {
  return { version: sessionVersion, orders: [] };
}

function cookieName(): string {
  return process.env.NODE_ENV === 'production'
    ? '__Host-dlavie-commerce-session'
    : 'dlavie-commerce-session';
}

function encryptionKey(): Buffer {
  const secret = process.env.COMMERCE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new CommerceSessionConfigurationError(
      'COMMERCE_SESSION_SECRET must contain at least 32 characters.',
    );
  }
  return createHash('sha256').update(secret, 'utf8').digest();
}

function validSecret(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 32 && value.length <= 512;
}

function validIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 128;
}

function validIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function normalizeSession(value: unknown): CommerceSession {
  if (!value || typeof value !== 'object') return emptySession();
  const candidate = value as Partial<CommerceSession>;
  if (candidate.version !== sessionVersion || !Array.isArray(candidate.orders)) {
    return emptySession();
  }

  const orders = candidate.orders
    .filter((order): order is OrderCredential => {
      if (!order || typeof order !== 'object') return false;
      return (
        validIdentifier(order.orderNumber) &&
        validSecret(order.token) &&
        validIsoDate(order.storedAt)
      );
    })
    .sort((left, right) => Date.parse(right.storedAt) - Date.parse(left.storedAt))
    .slice(0, maximumStoredOrders);

  const session: CommerceSession = { version: sessionVersion, orders };
  const cart = candidate.cart;
  if (
    cart &&
    validIdentifier(cart.id) &&
    validSecret(cart.token) &&
    validIsoDate(cart.expiresAt) &&
    Date.parse(cart.expiresAt) > Date.now()
  ) {
    session.cart = { id: cart.id, token: cart.token, expiresAt: cart.expiresAt };
  }
  return session;
}

function parseCookieHeader(header: string | null): string | null {
  if (!header) return null;
  const expectedName = cookieName();
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    if (name !== expectedName) continue;
    return part.slice(separator + 1).trim();
  }
  return null;
}

function decryptSession(encoded: string): CommerceSession {
  try {
    const [ivValue, tagValue, ciphertextValue, extra] = encoded.split('.');
    if (!ivValue || !tagValue || !ciphertextValue || extra) return emptySession();

    const iv = Buffer.from(ivValue, 'base64url');
    const tag = Buffer.from(tagValue, 'base64url');
    const ciphertext = Buffer.from(ciphertextValue, 'base64url');
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) return emptySession();

    const decipher = createDecipheriv(algorithm, encryptionKey(), iv);
    decipher.setAAD(associatedData);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
      'utf8',
    );
    return normalizeSession(JSON.parse(plaintext) as unknown);
  } catch {
    return emptySession();
  }
}

function encryptSession(session: CommerceSession): string {
  const normalized = normalizeSession(session);
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, encryptionKey(), iv);
  cipher.setAAD(associatedData);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(normalized), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const encoded = [iv, tag, ciphertext].map((value) => value.toString('base64url')).join('.');

  if (encoded.length > maximumEncodedSessionLength) {
    throw new CommerceSessionConfigurationError(
      'Encrypted commerce session exceeds cookie limits.',
    );
  }
  return encoded;
}

export function readCommerceSession(request: Request): CommerceSession {
  encryptionKey();
  const encoded = parseCookieHeader(request.headers.get('cookie'));
  return encoded ? decryptSession(encoded) : emptySession();
}

export function publicCommerceSession(session: CommerceSession): PublicCommerceSession {
  return {
    cart: session.cart ? { id: session.cart.id, expiresAt: session.cart.expiresAt } : null,
    orderNumbers: session.orders.map((order) => order.orderNumber),
  };
}

export function setCartCredential(session: CommerceSession, cart: CartCredential): CommerceSession {
  return normalizeSession({ ...session, cart });
}

export function clearCartCredential(session: CommerceSession): CommerceSession {
  return normalizeSession({ version: session.version, orders: session.orders });
}

export function checkoutCredential(session: CommerceSession): string | null {
  if (!session.cart) return null;
  return createHmac('sha256', encryptionKey())
    .update(`checkout:${session.cart.id}:${session.cart.token}`, 'utf8')
    .digest('hex');
}

export function setOrderCredential(
  session: CommerceSession,
  orderNumber: string,
  token: string,
): CommerceSession {
  const nextOrder: OrderCredential = {
    orderNumber,
    token,
    storedAt: new Date().toISOString(),
  };
  return normalizeSession({
    ...session,
    orders: [nextOrder, ...session.orders.filter((order) => order.orderNumber !== orderNumber)],
  });
}

export function orderCredential(session: CommerceSession, orderNumber: string): string | null {
  return session.orders.find((order) => order.orderNumber === orderNumber)?.token ?? null;
}

export function commerceSessionCookie(session: CommerceSession): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${cookieName()}=${encryptSession(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${cookieMaxAgeSeconds}${secure}`;
}
