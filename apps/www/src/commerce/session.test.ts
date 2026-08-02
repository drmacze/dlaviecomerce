import {
  checkoutCredential,
  commerceSessionCookie,
  CommerceSessionConfigurationError,
  orderAccessCredential,
  publicCommerceSession,
  readCommerceSession,
  setCartCredential,
  setOrderCredential,
  type CommerceSession,
} from './session';

const secret = 'test-commerce-session-secret-with-more-than-thirty-two-characters';

function emptySession(): CommerceSession {
  return { version: 1, orders: [] };
}

function requestWithCookie(cookie: string): Request {
  return {
    headers: {
      get: (name: string) => (name.toLowerCase() === 'cookie' ? cookie : null),
    },
  } as unknown as Request;
}

function cookiePair(session: CommerceSession): string {
  return commerceSessionCookie(session).split(';', 1)[0] ?? '';
}

describe('encrypted commerce session', () => {
  beforeEach(() => {
    process.env.COMMERCE_SESSION_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.COMMERCE_SESSION_SECRET;
  });

  it('round-trips credentials while exposing only public metadata', () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const session = setOrderCredential(
      setCartCredential(emptySession(), {
        id: 'cart-id',
        token: 'c'.repeat(64),
        expiresAt,
      }),
      'DLV-ORDER-1',
      'o'.repeat(64),
    );

    const restored = readCommerceSession(requestWithCookie(cookiePair(session)));
    expect(restored.cart?.token).toBe('c'.repeat(64));
    expect(restored.orders[0]?.token).toBe('o'.repeat(64));
    expect(publicCommerceSession(restored)).toEqual({
      cart: { id: 'cart-id', expiresAt },
      orderNumbers: ['DLV-ORDER-1'],
    });
  });

  it('derives a deterministic checkout credential without exposing the cart token', () => {
    const session = setCartCredential(emptySession(), {
      id: 'cart-id',
      token: 'c'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    const credential = checkoutCredential(session);
    expect(credential).toHaveLength(64);
    expect(credential).toBe(checkoutCredential(session));
    expect(credential).not.toContain(session.cart?.token ?? '');
    expect(checkoutCredential(emptySession())).toBeNull();
  });

  it('derives separate stable credentials for checkout idempotency and order access', () => {
    const session = setCartCredential(emptySession(), {
      id: 'cart-id',
      token: 'c'.repeat(64),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    const checkout = checkoutCredential(session);
    const access = orderAccessCredential(session);
    expect(checkout).toHaveLength(64);
    expect(access).toHaveLength(64);
    expect(checkout).not.toBe(access);
    expect(checkout).toBe(checkoutCredential(session));
    expect(access).toBe(orderAccessCredential(session));
    expect(orderAccessCredential(emptySession())).toBeNull();
  });

  it('rejects a tampered authenticated cookie', () => {
    const original = cookiePair(setOrderCredential(emptySession(), 'DLV-ORDER-2', 'o'.repeat(64)));
    const lastCharacter = original.at(-1);
    const tampered = `${original.slice(0, -1)}${lastCharacter === 'a' ? 'b' : 'a'}`;

    expect(readCommerceSession(requestWithCookie(tampered))).toEqual(emptySession());
  });

  it('keeps only the six most recent order credentials', () => {
    let session = emptySession();
    for (let index = 0; index < 8; index += 1) {
      session = setOrderCredential(session, `DLV-ORDER-${index}`, `${index}`.repeat(64));
    }

    expect(session.orders).toHaveLength(6);
    expect(session.orders.map((order) => order.orderNumber)).toEqual([
      'DLV-ORDER-7',
      'DLV-ORDER-6',
      'DLV-ORDER-5',
      'DLV-ORDER-4',
      'DLV-ORDER-3',
      'DLV-ORDER-2',
    ]);
  });

  it('fails fast when the encryption secret is missing', () => {
    delete process.env.COMMERCE_SESSION_SECRET;
    expect(() => readCommerceSession(requestWithCookie(''))).toThrow(
      CommerceSessionConfigurationError,
    );
  });
});
