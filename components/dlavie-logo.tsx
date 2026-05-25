type DlavieLogoProps = {
  variant?: 'full' | 'mark';
  className?: string;
  alt?: string;
};

function DlavieMarkSvg({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="DLAVIE mark">
      <defs>
        <linearGradient id="dlavieMarkGradient" x1="12" y1="28" x2="108" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#45D5FF" />
          <stop offset="0.42" stopColor="#5227FF" />
          <stop offset="0.72" stopColor="#E728FF" />
          <stop offset="1" stopColor="#DFFF4F" />
        </linearGradient>
        <filter id="dlavieGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.27 0 0 0 0 0.84 0 0 0 0 1 0 0 0 .32 0" />
          <feBlend in="SourceGraphic" />
        </filter>
      </defs>
      <path filter="url(#dlavieGlow)" d="M60 6C70.5 31 89 49.5 114 60C89 70.5 70.5 89 60 114C49.5 89 31 70.5 6 60C31 49.5 49.5 31 60 6Z" fill="url(#dlavieMarkGradient)" />
      <path d="M55 28C39.5 31.5 27.8 44.6 26 60C27.8 75.4 39.5 88.5 55 92C68.8 86.8 78.5 74.4 79.7 60C78.5 45.6 68.8 33.2 55 28Z" fill="rgba(255,255,255,.95)" />
      <path d="M68 28C80.4 35.2 88.4 46.4 90 60C88.4 73.6 80.4 84.8 68 92C76.2 81.5 80.1 70.8 80.1 60C80.1 49.2 76.2 38.5 68 28Z" fill="rgba(5,8,23,.18)" />
    </svg>
  );
}

export function DlavieLogo({ variant = 'full', className = '', alt = 'DLAVIE' }: DlavieLogoProps) {
  if (variant === 'mark') return <DlavieMarkSvg className={className || 'h-10 w-10'} />;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label={alt} role="img">
      <DlavieMarkSvg className="h-full min-h-8 w-auto shrink-0" />
      <span className="font-black leading-none tracking-[-0.04em] text-[#07164f]" style={{ fontSize: '1.85em' }}>Dlavie</span>
    </span>
  );
}

export function DlavieMarkWatermark({ className = '' }: { className?: string }) {
  return <DlavieMarkSvg className={`pointer-events-none select-none ${className}`} />;
}
