import type { DlavieAiPlan } from './dlavie-ai-plans';

export type DlavieAiPackId = 'starter' | 'smart' | 'core';

export type DlavieAiPack = {
  id: DlavieAiPackId;
  name: string;
  description: string;
  priceDBalance: number;
  credits: number;
  badge: string;
  valueLabel: string;
};

export const dlavieAiPacks: Record<DlavieAiPackId, DlavieAiPack> = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    description: 'Paket ringan untuk mencoba Dlavie AI Basic tanpa komitmen besar.',
    priceDBalance: 10000,
    credits: 10000,
    badge: '10K AI Token',
    valueLabel: '1 DB = 1 AI Token',
  },
  smart: {
    id: 'smart',
    name: 'Smart Pack',
    description: 'Paket seimbang untuk penggunaan rutin, brainstorming, dan produktivitas harian.',
    priceDBalance: 55000,
    credits: 55000,
    badge: '55K AI Token',
    valueLabel: '1 DB = 1 AI Token',
  },
  core: {
    id: 'core',
    name: 'Core Pack',
    description: 'Paket besar untuk Dlavie AI Core, coding, analisis, dan workflow serius.',
    priceDBalance: 120000,
    credits: 120000,
    badge: '120K AI Token',
    valueLabel: '1 DB = 1 AI Token',
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
