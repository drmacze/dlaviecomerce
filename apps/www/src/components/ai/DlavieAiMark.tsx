type DlavieAiMarkProps = {
  className?: string;
  title?: string;
};

export function DlavieAiMark({ className = '', title }: DlavieAiMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 260 112"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dlosSheen" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.54" />
          <stop offset="0.48" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.58" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.56" />
        </linearGradient>
        <linearGradient id="dlosLine" x1="44" y1="84" x2="216" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.54" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="dlos-topbar-glyph">
        <path d="M62 28h42c31 0 55 17 55 34s-24 34-55 34H62V28Z" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
        <path d="M101 38V86H145" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
      </g>

      <g className="dlos-center-wordmark">
        <text className="dlos-final" x="130" y="67" textAnchor="middle" fill="url(#dlosSheen)" fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" fontSize="48" fontWeight="880" letterSpacing="8">
          DLOS
        </text>

        <g className="dlos-sequence" aria-hidden="true">
          <text className="dlos-dl" x="84" y="67" textAnchor="middle" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" fontSize="46" fontWeight="880" letterSpacing="4">
            DL
          </text>
          <circle className="dlos-ring" cx="86" cy="52" r="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" pathLength="100" />
          <rect className="dlos-box" x="54" y="29" width="64" height="46" rx="10" stroke="currentColor" strokeWidth="3.2" />
          <text className="dlos-os" x="166" y="67" textAnchor="middle" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" fontSize="46" fontWeight="880" letterSpacing="4">
            OS
          </text>
        </g>

        <path className="dlos-underline" d="M44 84H216" stroke="url(#dlosLine)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
