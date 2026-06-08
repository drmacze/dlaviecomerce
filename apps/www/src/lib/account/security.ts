const RATE_LIMIT_WINDOW_MS = 60_000;
const LOGIN_LIMIT = 8;
const REGISTER_LIMIT = 5;

type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function isStrongEnoughPassword(password: string) {
  if (password.length < 12 || password.length > 1024) return false;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  return [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length >= 3;
}

export function checkRateLimit(key: string, limit: number) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count > limit) {
    return { limited: true, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  return { limited: false, retryAfter: 0 };
}

export function checkLoginRateLimit(request: Request, email: string) {
  return checkRateLimit(`login:${getClientIp(request)}:${email.toLowerCase()}`, LOGIN_LIMIT);
}

export function checkRegisterRateLimit(request: Request, email: string) {
  return checkRateLimit(`register:${getClientIp(request)}:${email.toLowerCase()}`, REGISTER_LIMIT);
}

export function safeRedirectPath(value: string | null | undefined, fallback = '/ai') {
  if (!value) return fallback;

  try {
    if (!value.startsWith('/') || value.startsWith('//')) return fallback;
    if (value.includes('\\')) return fallback;
    return value;
  } catch {
    return fallback;
  }
}
