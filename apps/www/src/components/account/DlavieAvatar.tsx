import type { DlavieCardTier } from '../../lib/account/cardValidity';

type DlavieAvatarProps = {
  seedSource: string;
  name: string;
  tier?: DlavieCardTier;
};

const PALETTES = [
  ['#ff7e67', '#b96cff', '#1b0b17', '#fff0e7'],
  ['#ff9a7b', '#6d4dff', '#120b1f', '#f8e5ff'],
  ['#ef6f9a', '#8f6cff', '#10070d', '#ffe9df'],
  ['#ffb36d', '#c05cff', '#16090f', '#fff6ed'],
];

function hashSeed(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(seed: number, offset: number, modulo: number) {
  return Math.abs((seed >>> offset) % modulo);
}

export function DlavieAvatar({ seedSource, name, tier = 'standard' }: DlavieAvatarProps) {
  const seed = hashSeed(seedSource || name || 'dlavie');
  const palette = PALETTES[pick(seed, 0, PALETTES.length)];
  const [coral, violet, ink, light] = palette;
  const rotation = pick(seed, 6, 46) - 23;
  const ringDash = 18 + pick(seed, 12, 28);
  const orbit = 34 + pick(seed, 18, 18);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'DL';

  return (
    <figure className="dlavie-avatar" data-tier={tier} aria-label={`${name} generated DLavie avatar`}>
      <svg viewBox="0 0 180 180" role="img" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`avatar-core-${seed}`} cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor={light} stopOpacity="0.95" />
            <stop offset="34%" stopColor={coral} stopOpacity="0.82" />
            <stop offset="70%" stopColor={violet} stopOpacity="0.62" />
            <stop offset="100%" stopColor={ink} stopOpacity="1" />
          </radialGradient>
          <linearGradient id={`avatar-line-${seed}`} x1="18" y1="18" x2="162" y2="162">
            <stop offset="0%" stopColor={coral} />
            <stop offset="100%" stopColor={violet} />
          </linearGradient>
          <filter id={`avatar-glow-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="10" y="10" width="160" height="160" rx="34" fill={`url(#avatar-core-${seed})`} />
        <circle cx="90" cy="90" r="58" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray={`${ringDash} 10`} transform={`rotate(${rotation} 90 90)`} />
        <path d={`M42 ${112 - pick(seed, 4, 20)} L90 38 L138 ${104 + pick(seed, 9, 20)} L90 142 Z`} fill="rgba(8,3,7,0.38)" stroke={`url(#avatar-line-${seed})`} strokeWidth="2" />
        <circle cx={56 + pick(seed, 5, 18)} cy={54 + pick(seed, 10, 16)} r="10" fill={coral} opacity="0.62" filter={`url(#avatar-glow-${seed})`} />
        <circle cx={118 + pick(seed, 11, 16)} cy={52 + pick(seed, 16, 22)} r="7" fill={violet} opacity="0.72" />
        <rect x={56 + pick(seed, 3, 15)} y={116 + pick(seed, 13, 10)} width="48" height="12" rx="6" fill="rgba(255,244,237,0.13)" transform={`rotate(${rotation / 2} 90 122)`} />
        <path d={`M${52 + orbit / 4} 96 C74 ${64 - pick(seed, 2, 10)}, 110 ${62 + pick(seed, 8, 14)}, ${132 - orbit / 5} 98`} fill="none" stroke="rgba(255,244,237,0.42)" strokeWidth="2" strokeLinecap="round" />
        <text x="90" y="100" textAnchor="middle" fill="rgba(255,247,241,0.92)" fontFamily="var(--font-display)" fontSize="34" fontWeight="700" letterSpacing="-1">
          {initials}
        </text>
      </svg>
    </figure>
  );
}
