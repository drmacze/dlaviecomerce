import type { DlavieAiPlan } from './dlavie-ai-plans';

export type DlavieAiPackId = 'starter' | 'smart' | 'core';

export type DlavieAiPack = {
  id: DlavieAiPackId;
  name: string;
  description: string;
  priceDBalance: number;
  credits: number;
  badge: string;
};

export const dlavieAiPacks: Record<DlavieAiPackId, DlavieAiPack> = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Cocok untuk mencoba Dlavie AI Basic dan chat ringan.',
    priceDBalance: 1000,
    credits: 10000,
    badge: '10K AI Token',
  },
  smart: {
    id: 'smart',
    name: 'Smart Pack',
    description: 'Paket seimbang untuk penggunaan rutin dan eksplorasi ide.',
    priceDBalance: 5000,
    credits: 55000,
    badge: '55K AI Token',
  },
  core: {
    id: 'core',
    name: 'Core Pack',
    description: 'Paket besar untuk Dlavie AI Core, coding, dan workflow serius.',
    priceDBalance: 10000,
    credits: 120000,
    badge: '120K AI Token',
  },
};

export function getDlavieAiPack(packId: unknown) {
  if (packId === 'starter' || packId === 'smart' || packId === 'core') return dlavieAiPacks[packId];
  return null;
}

export function estimateTextUnits(text: string) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

export function getPlanCostMultiplier(plan: DlavieAiPlan) {
  return plan === 'core' ? 2 : 1;
}

export function estimateAiCharge(input: { message: string; reply: string; plan: DlavieAiPlan }) {
  const inputUnits = estimateTextUnits(input.message);
  const outputUnits = estimateTextUnits(input.reply);
  const multiplier = getPlanCostMultiplier(input.plan);
  const charged = Math.ceil((inputUnits + outputUnits) * multiplier);

  return { inputUnits, outputUnits, multiplier, charged };
}
