export type DlavieCardStatus = 'active' | 'expired' | 'grace' | 'suspended' | 'archived';

export type DlavieCardTier = 'standard' | 'vip' | 'permanent';

export type DlavieCardValidity = {
  createdAt: Date | null;
  expiresAt: Date | null;
  daysRemaining: number;
  status: DlavieCardStatus;
  statusLabel: string;
  accessLabel: string;
};

export const STARTER_CARD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const STATUS_LABELS: Record<DlavieCardStatus, string> = {
  active: 'Card active',
  expired: 'Card expired — renewal required',
  grace: 'Grace period active',
  suspended: 'Access suspended',
  archived: 'Card archived',
};

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function calculateDlavieCardValidity(createdAtValue?: string | null, now = new Date()): DlavieCardValidity {
  const createdAt = parseDate(createdAtValue);
  const expiresAt = createdAt ? addDays(createdAt, STARTER_CARD_DAYS) : null;
  const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / MS_PER_DAY) : STARTER_CARD_DAYS;
  const status: DlavieCardStatus = daysRemaining > 0 ? 'active' : 'expired';

  return {
    createdAt,
    expiresAt,
    daysRemaining,
    status,
    statusLabel: STATUS_LABELS[status],
    accessLabel: `${STARTER_CARD_DAYS} days starter access`,
  };
}

export function getDlavieCardStatusLabel(status: DlavieCardStatus) {
  return STATUS_LABELS[status];
}
