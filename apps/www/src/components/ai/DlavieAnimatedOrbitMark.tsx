type DlavieAnimatedOrbitMarkProps = {
  className?: string;
  title?: string;
};

export function DlavieAnimatedOrbitMark({ className = '', title = 'DLavie AI' }: DlavieAnimatedOrbitMarkProps) {
  return (
    <svg
      className={`dlavie-animated-orbit-mark ${className}`}
      viewBox="0 0 180 180"
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="dlavieOrbitCore" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
          <stop offset="42%" stopColor="#AEBEFF" stopOpacity="0.16" />
          <stop offset="78%" stopColor="#0A0A0A" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dlavieOrbitStroke" x1="34" y1="26" x2="146" y2="154">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#EDF1FF" />
          <stop offset="100%" stopColor="#7E96FF" />
        </linearGradient>
        <linearGradient id="dlavieScanBeam" x1="32" y1="90" x2="148" y2="90">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#8FA3FF" stopOpacity="0" />
        </linearGradient>
        <filter id="dlavieOrbitGlow" x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="90" cy="90" r="78" fill="url(#dlavieOrbitCore)">
        <animate attributeName="r" values="72;80;72" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.72;1;0.72" dur="3.2s" repeatCount="indefinite" />
      </circle>

      <g opacity="0.8">
        <path d="M14 92h152" stroke="url(#dlavieScanBeam)" strokeWidth="13" strokeLinecap="round" opacity="0.42">
          <animateTransform attributeName="transform" type="rotate" from="0 90 90" to="360 90 90" dur="4.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.18;0.64;0.18" dur="2.2s" repeatCount="indefinite" />
        </path>
        <path d="M25 45h130" stroke="url(#dlavieScanBeam)" strokeWidth="10" strokeLinecap="round" opacity="0.26">
          <animateTransform attributeName="transform" type="rotate" from="180 90 90" to="-180 90 90" dur="6.2s" repeatCount="indefinite" />
        </path>
      </g>

      <g filter="url(#dlavieOrbitGlow)">
        <circle cx="90" cy="90" r="62" stroke="rgba(255,255,255,0.26)" strokeWidth="2">
          <animate attributeName="r" values="58;64;58" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.2;0.52;0.2" dur="2.8s" repeatCount="indefinite" />
        </circle>

        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 90 90" to="360 90 90" dur="2.7s" repeatCount="indefinite" />
          <ellipse cx="90" cy="90" rx="60" ry="28" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.92" />
          <circle cx="150" cy="90" r="6.5" fill="#FFFFFF">
            <animate attributeName="r" values="4.8;7.8;4.8" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="90" r="4.8" fill="#DCE5FF" opacity="0.72">
            <animate attributeName="r" values="3.5;6.2;3.5" dur="1.2s" begin="0.45s" repeatCount="indefinite" />
          </circle>
        </g>

        <g>
          <animateTransform attributeName="transform" type="rotate" from="360 90 90" to="0 90 90" dur="5.2s" repeatCount="indefinite" />
          <ellipse cx="90" cy="90" rx="48" ry="70" stroke="#8095FF" strokeWidth="1.5" strokeDasharray="16 18" opacity="0.58" />
        </g>

        <path
          d="M62 45h26c27 0 48 19 48 45s-21 45-48 45H62V45Z"
          stroke="url(#dlavieOrbitStroke)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate attributeName="stroke-width" values="7;9;7" dur="2.2s" repeatCount="indefinite" />
        </path>
        <path
          d="M81 62v56h12c19 0 34-12.4 34-28S112 62 93 62H81Z"
          fill="#FFFFFF"
          fillOpacity="0.18"
        >
          <animate attributeName="fill-opacity" values="0.12;0.34;0.12" dur="2.1s" repeatCount="indefinite" />
        </path>
        <path
          d="M80 50V130H124"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.82"
        >
          <animate attributeName="opacity" values="0.62;1;0.62" dur="1.8s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}
