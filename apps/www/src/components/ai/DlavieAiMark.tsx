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
          <stop offset="0" stopColor="currentColor" stopOpacity="0.42" />
          <stop offset="0.38" stopColor="currentColor" stopOpacity="0.78" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.62" stopColor="currentColor" stopOpacity="0.78" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.46" />
          <animateTransform attributeName="gradientTransform" type="translate" values="-120 0;120 0;-120 0" dur="7.2s" repeatCount="indefinite" />
        </linearGradient>
        <linearGradient id="dlosLine" x1="44" y1="84" x2="216" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.54" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <filter id="dlosTextBlur" x="-25%" y="-80%" width="150%" height="260%">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
      </defs>

      <g className="dlos-topbar-glyph">
        <circle className="dlos-topbar-ring" cx="130" cy="56" r="38" stroke="currentColor" strokeWidth="5" pathLength="100" />
        <path className="dlos-topbar-d" d="M110 32h16c22 0 39 10.6 39 24s-17 24-39 24h-16V32Z" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" />
        <path className="dlos-topbar-l" d="M130 40V74H154" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.86" />
        <circle className="dlos-topbar-node" cx="166" cy="38" r="4" fill="currentColor" />
      </g>

      <g className="dlos-center-wordmark">
        <text className="dlos-blur-text" x="130" y="67" textAnchor="middle" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" fontSize="48" fontWeight="880" letterSpacing="8" filter="url(#dlosTextBlur)">
          DLOS
        </text>
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
