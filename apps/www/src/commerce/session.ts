import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { CommerceConfigurationError } from './config';

const productionCookieName = '__Host-dlavie-commerce';
const developmentCookieName = 'dlavie-commerce-session';
const sessionVersion = 1 as const;
const maximumOrders = 5;
const maximumCookieLength = 3800;
const sessionMaxAgeSeconds = 30 * 24 * 60 * 60;

export type CommerceSessionState = {
  version: typeof sessionVersion;
  cart?: {
    id: string;
    token: string;
    expiresAt: string;
  };
  checkout?: {
    cartId: string;
    key: string;
    createdAt: string;
  };
  orders?: Record<
    string,
    {
      token: string;
      createdAt: string;
    }
  >;
};

function cookieName(): string {
  return process.env.NODE_ENV === 'production' ? productionCookieName : developmentCookieName;
}

function sessionKey(): Buffer {
  const secret = process.env.COMMERCE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new CommerceConfigurationError(
      'COMMERCE_SESSION_SECRET must contain at least 32 characters.',
    );
  }
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

function emptyState(): CommerceSessionState {
  return { version: sessionVersion };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validOpaqueToken(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9._~-]{32,128}$/.test(value);
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(new Date(value).getTime());
}

function parseState(value: unknown): CommerceSessionState {
  if (!isRecord(value) || value.version !== sessionVersion) return emptyState();

  const state: CommerceSessionState = { version: sessionVersion };
  if (isRecord(value.cart)) {
    const { id, token, expiresAt } = value.cart;
    if (
      typeof id === 'string' &&
      /^[0-9a-f-]{36}$/i.test(id) &&
      validOpaqueToken(token) &&
      validDate(expiresAt) &&
      new Date(expiresAt).getTime() > Date.now()
    ) {
      state.cart = { id, token, expiresAt };
    }
  }

  if (isRecord(value.checkout)) {
    const { cartId, key, createdAt } = value.checkout;
    if (
      typeof cartId === 'string' &&
      /^[0-9a-f-]{36}$/i.test(cartId) &&
      validOpaqueToken(key) &&
      validDate(createdAt) &&
      Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000
    ) {
      state.checkout = { cartId, key, createdAt };
    }
  }

  if (isRecord(value.orders)) {
    const orders = Object.entries(value.orders)
      .flatMap(([orderNumber, item]) => {
        if (
          !/^[A-Z0-9]{2,8}-\d{8}-[A-F0-9]{10}$/.test(orderNumber) ||
          !isRecord(item) ||
          !validOpaqueToken(item.token) ||
          !validDate(item.createdAt)
        ) {
          return [];
        }
        return [[orderNumber, { token: item.token, createdAt: item.createdAt }] as const];
      })
      .sort((left, right) => right[1].createdAt.localeCompare(left[1].createdAt))
      .slice(0, maximumOrders);
    if (orders.length > 0) state.orders = Object.fromEntries(orders);
  }

  return state;
}

export function sealCommerceSession(state: CommerceSessionState, key = sessionKey()): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(parseState(state)), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authenticationTag = cipher.getAuthTag();
  const value = [iv, authenticationTag, ciphertext]
    .map((part) => part.toString('base64url'))
    .join('.');

  if (value.length > maximumCookieLength) {
    throw new CommerceConfigurationError('Commerce session exceeds the secure cookie size limit.');
  }
  return value;
}

export function openCommerceSession(value: string, key = sessionKey()): CommerceSessionState {
  try {
    const parts = value.split('.');
    if (parts.length !== 3) return emptyState();
    const [encodedIv, encodedTag, encodedCiphertext] = parts;
    if (!encodedIv || !encodedTag || !encodedCiphertext) return emptyState();

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encodedIv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
    return parseState(JSON.parse(plaintext) as unknown);
  } catch {
    return emptyState();
  }
}

export async function readCommerceSession(): Promise<CommerceSessionState> {
  const store = await cookies();
  const value = store.get(cookieName())?.value;
  return value ? openCommerceSession(value) : emptyState();
}

export async function writeCommerceSession(state: CommerceSessionState): Promise<void> {
  const store = await cookies();
  const normalized = parseState(state);
  const hasState = Boolean(normalized.cart || normalized.checkout || normalized.orders);

  if (!hasState) {
    store.delete(cookieName());
    return;
  }

  store.set(cookieName(), sealCommerceSession(normalized), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: sessionMaxAgeSeconds,
    priority: 'high',
  });
}

export function addOrderAccess(
  state: CommerceSessionState,
  orderNumber: string,
  token: string,
): CommerceSessionState {
  const orders = {
    ...(state.orders ?? {}),
    [orderNumber]: { token, createdAt: new Date().toISOString() },
  };
  const limitedOrders = Object.fromEntries(
    Object.entries(orders)
      .sort((left, right) => right[1].createdAt.localeCompare(left[1].createdAt))
      .slice(0, maximumOrders),
  );
  return { ...state, orders: limitedOrders };
}

export function getOrCreateCheckoutKey(
  state: CommerceSessionState,
  cartId: string,
): { state: CommerceSessionState; key: string } {
  if (state.checkout?.cartId === cartId) return { state, key: state.checkout.key };
  const key = crypto.randomBytes(32).toString('base64url');
  return {
    key,
    state: {
      ...state,
      checkout: { cartId, key, createdAt: new Date().toISOString() },
    },
  };
}
