import type { DlavieSupabaseUser } from './session';

export type AccountSessionView = {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  initials: string;
  productInterest: string;
};

export const anonymousAccountSession: AccountSessionView = {
  authenticated: false,
  userId: null,
  email: null,
  fullName: null,
  initials: '?',
  productInterest: 'DLavie AI',
};

function text(metadata: Record<string, unknown> | undefined, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function createAccountSessionView(user?: DlavieSupabaseUser | null): AccountSessionView {
  if (!user?.id) return anonymousAccountSession;
  const fullName = text(user.user_metadata, ['full_name', 'name', 'user_name', 'preferred_username']);
  const email = user.email?.trim() || null;
  const label = fullName || email?.split('@')[0] || 'DLavie';
  const initials = label
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'D';

  return {
    authenticated: true,
    userId: user.id,
    email,
    fullName: fullName || email || 'Pengguna DLavie',
    initials,
    productInterest: text(user.user_metadata, ['product_interest']) || 'DLavie AI',
  };
}

export function getAccountProviders(user?: DlavieSupabaseUser | null): string[] {
  const providers = new Set<string>();
  for (const identity of user?.identities ?? []) {
    if (typeof identity.provider === 'string' && identity.provider.trim()) providers.add(identity.provider.toLowerCase());
  }
  const appProvider = user?.app_metadata?.provider;
  if (typeof appProvider === 'string' && appProvider.trim()) providers.add(appProvider.toLowerCase());
  return [...providers];
}
