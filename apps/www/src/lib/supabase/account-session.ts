import type { DlavieSupabaseUser } from './session';

export type DlavieAccountUser = {
  id: string;
  email: string | null;
  fullName: string;
  productInterest: string;
  initials: string;
};

export type DlavieAccountSession =
  | {
      isAuthenticated: true;
      user: DlavieAccountUser;
    }
  | {
      isAuthenticated: false;
      user: null;
    };

export const unauthenticatedDlavieAccountSession: DlavieAccountSession = {
  isAuthenticated: false,
  user: null,
};

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function createInitials(fullName: string, email: string | null) {
  const source = fullName && fullName !== 'DLavie member' ? fullName : email ?? 'DLavie';
  const tokens = source
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const firstToken = tokens[0] ?? 'DL';
  const first = firstToken[0] ?? 'D';
  const second = tokens[1]?.[0] ?? firstToken[1] ?? 'L';

  return `${first}${second}`.toUpperCase();
}

export function buildDlavieAccountUser(user: DlavieSupabaseUser): DlavieAccountUser {
  const email = user.email ?? null;
  const fullName = readMetadataString(user.user_metadata, 'full_name') ?? 'DLavie member';
  const productInterest = readMetadataString(user.user_metadata, 'product_interest') ?? 'full ecosystem';

  return {
    id: user.id,
    email,
    fullName,
    productInterest,
    initials: createInitials(fullName, email),
  };
}
