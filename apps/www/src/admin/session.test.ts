import {
  adminSessionCookie,
  AdminSessionConfigurationError,
  clearAdminSessionCookie,
  readAdminSession,
  type AdminSession,
} from './session';

const secret = 'test-admin-session-secret-with-more-than-thirty-two-characters';
const session: AdminSession = {
  version: 1,
  accessToken: 'a'.repeat(128),
  refreshToken: 'r'.repeat(64),
  expiresAt: 2_000_000_000,
  userId: 'operator-id',
  email: 'operator@example.com',
};

function requestWithCookie(cookie: string): Request {
  return {
    headers: {
      get: (name: string) => (name.toLowerCase() === 'cookie' ? cookie : null),
    },
  } as unknown as Request;
}

describe('admin operator session', () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it('round-trips encrypted credentials without placing them in plaintext cookie data', () => {
    const serialized = adminSessionCookie(session);
    expect(serialized).toContain('HttpOnly');
    expect(serialized).toContain('SameSite=Strict');
    expect(serialized).not.toContain(session.accessToken);
    expect(serialized).not.toContain(session.refreshToken);

    const pair = serialized.split(';', 1)[0] ?? '';
    expect(readAdminSession(requestWithCookie(pair))).toEqual(session);
  });

  it('rejects a tampered cookie', () => {
    const pair = adminSessionCookie(session).split(';', 1)[0] ?? '';
    const last = pair.at(-1);
    const tampered = `${pair.slice(0, -1)}${last === 'a' ? 'b' : 'a'}`;
    expect(readAdminSession(requestWithCookie(tampered))).toBeNull();
  });

  it('emits a secure clearing cookie contract', () => {
    expect(clearAdminSessionCookie()).toContain('Max-Age=0');
    expect(clearAdminSessionCookie()).toContain('HttpOnly');
    expect(clearAdminSessionCookie()).toContain('SameSite=Strict');
  });

  it('fails fast without a configured encryption secret', () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(() => readAdminSession(requestWithCookie(''))).toThrow(
      AdminSessionConfigurationError,
    );
  });
});
