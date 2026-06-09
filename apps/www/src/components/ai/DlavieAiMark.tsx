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
          <stop offset="0" stopColor="currentColor" stopOpacity="0.56" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.56" />
          <animateTransform attributeName="gradientTransform" type="translate" values="-140 0;140 0;-140 0" dur="6.6s" repeatCount="indefinite" />
        </linearGradient>
        <linearGradient id="dlosLine" x1="42" y1="82" x2="218" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.58" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="dlos-topbar-glyph">
        <path d="M62 28h42c31 0 55 17 55 34s-24 34-55 34H62V28Z" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
        <path d="M101 38V86H145" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
      </g>

      <g className="dlos-center-wordmark">
        <text
          x="130"
          y="66"
          textAnchor="middle"
          fill="url(#dlosSheen)"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif"
          fontSize="48"
          fontWeight="880"
          letterSpacing="8"
        >
          DLOS
          <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="1;1;0;0;1;1" keyTimes="0;0.24;0.34;0.68;0.84;1" />
        </text>

        <g>
          <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.25;0.36;0.70;0.84;1" />
          <animateTransform attributeName="transform" type="rotate" dur="6.8s" repeatCount="indefinite" values="0 130 56;0 130 56;360 130 56;360 130 56" keyTimes="0;0.48;0.66;1" />

          <text x="82" y="66" textAnchor="middle" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" fontSize="46" fontWeight="880" letterSpacing="4">
            DL
            <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="0;0;1;0;0" keyTimes="0;0.25;0.33;0.45;1" />
          </text>

          <circle cx="86" cy="52" r="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="0;0;0.86;0.32;0" keyTimes="0;0.32;0.44;0.62;1" />
            <animate attributeName="r" dur="6.8s" repeatCount="indefinite" values="18;18;28;22;18" keyTimes="0;0.32;0.44;0.62;1" />
            <animate attributeName="stroke-dasharray" dur="6.8s" repeatCount="indefinite" values="1 150;90 150;118 150;1 150" keyTimes="0;0.38;0.56;1" />
          </circle>

          <rect x="54" y="29" width="64" height="46" rx="10" stroke="currentColor" strokeWidth="3.4" opacity="0">
            <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="0;0;0.8;0.8;0" keyTimes="0;0.42;0.52;0.66;1" />
            <animate attributeName="rx" dur="6.8s" repeatCount="indefinite" values="26;26;10;6;26" keyTimes="0;0.42;0.52;0.66;1" />
          </rect>

          <text x="162" y="66" textAnchor="middle" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" fontSize="46" fontWeight="880" letterSpacing="4">
            OS
            <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="0;0;0;1;1;0;0" keyTimes="0;0.34;0.46;0.56;0.70;0.82;1" />
          </text>
        </g>

        <path d="M44 82H216" stroke="url(#dlosLine)" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="opacity" dur="6.8s" repeatCount="indefinite" values="0.28;0.68;0.24;0.16;0.28" keyTimes="0;0.22;0.46;0.68;1" />
        </path>
      </g>
    </svg>
  );
}
