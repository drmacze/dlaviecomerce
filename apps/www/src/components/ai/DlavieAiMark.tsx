type DlavieAiMarkProps = {
  className?: string;
  title?: string;
};

export function DlavieAiMark({ className = '', title }: DlavieAiMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 96"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dlosWordmarkSheen" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.54" />
          <stop offset="0.44" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.56" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.58" />
          <animateTransform attributeName="gradientTransform" type="translate" values="-180 0;180 0;-180 0" dur="5.8s" repeatCount="indefinite" />
        </linearGradient>
        <linearGradient id="dlosUnderline" x1="30" y1="76" x2="190" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.72" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <filter id="dlosSoftGlow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="8" y="8" width="204" height="80" rx="30" fill="currentColor" opacity="0.035">
        <animate attributeName="opacity" values="0.025;0.055;0.025" dur="4.8s" repeatCount="indefinite" />
      </rect>
      <rect x="8.75" y="8.75" width="202.5" height="78.5" rx="29.25" stroke="currentColor" strokeOpacity="0.13" strokeWidth="1.5" />

      <g filter="url(#dlosSoftGlow)">
        <text
          x="110"
          y="60"
          textAnchor="middle"
          fill="url(#dlosWordmarkSheen)"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
          fontSize="41"
          fontWeight="850"
          letterSpacing="7"
        >
          DLOS
          <animate attributeName="opacity" values="0.82;1;0.82" dur="3.6s" repeatCount="indefinite" />
        </text>
      </g>

      <path d="M42 75H178" stroke="url(#dlosUnderline)" strokeWidth="2" strokeLinecap="round">
        <animate attributeName="stroke-opacity" values="0.12;0.78;0.12" dur="3.8s" repeatCount="indefinite" />
      </path>

      <circle cx="188" cy="31" r="2.3" fill="currentColor" opacity="0.56">
        <animate attributeName="opacity" values="0.22;0.82;0.22" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="r" values="1.8;2.8;1.8" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
