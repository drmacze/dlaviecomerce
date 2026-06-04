export type DlavieAccountSession =
  | {
      authenticated: true;
      userId: string;
      email: string;
      fullName: string;
      initials: string;
      productInterest: string;
    }
  | {
      authenticated: false;
      userId: null;
      email: string;
      fullName: string;
      initials: string;
      productInterest: string;
    };

type UserMetadata = Record<string, unknown> | undefined;

const FALLBACK_SESSION: DlavieAccountSession = {
  authenticated: false,
  userId: null,
  email: 'Masuk untuk sinkronisasi akun',
  fullName: 'DLavie member',
  initials: 'DL',
  productInterest: 'DLavie AI',
};

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getFullName(metadata: UserMetadata, email: string) {
  const explicitName =
    asString(metadata?.full_name) ||
    asString(metadata?.fullName) ||
    asString(metadata?.name) ||
    asString(metadata?.display_name);

  if (explicitName) return explicitName;
  if (email.includes('@')) return email.split('@')[0]?.replace(/[._-]+/g, ' ') || 'DLavie member';
  return 'DLavie member';
}

export function getInitials(name: string, email = '') {
  const source = name !== 'DLavie member' ? name : email;
  const parts = source
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  const initials = parts.map((part) => part.at(0)?.toUpperCase()).join('');
  return initials || 'DL';
}

export function createUnauthenticatedAccountSession(): DlavieAccountSession {
  return FALLBACK_SESSION;
}

export function createAccountSessionView(user: {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
}): DlavieAccountSession {
  const email = asString(user.email) || 'Email tidak tersedia';
  const fullName = getFullName(user.user_metadata, email);
  const productInterest =
    asString(user.user_metadata?.product_interest) ||
    asString(user.user_metadata?.productInterest) ||
    'DLavie AI';

  return {
    authenticated: true,
    userId: user.id,
    email,
    fullName,
    initials: getInitials(fullName, email),
    productInterest,
  };
}
