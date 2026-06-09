type DlavieAiMarkProps = {
  className?: string;
  title?: string;
};

export function DlavieAiMark({ className = '', title }: DlavieAiMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 96 96"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="dlavieMarkCore" cx="50%" cy="45%" r="62%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
          <stop offset="58%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dlavieMarkBeam" x1="12" y1="48" x2="84" y2="48">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="48%" stopColor="currentColor" stopOpacity="0.78" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="48" cy="48" r="39" fill="url(#dlavieMarkCore)">
        <animate attributeName="r" values="33;41;33" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0.9;0.45" dur="2.8s" repeatCount="indefinite" />
      </circle>

      <g opacity="0.62">
        <path d="M10 48H86" stroke="url(#dlavieMarkBeam)" strokeWidth="7" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="360 48 48" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.22;0.9;0.22" dur="1.6s" repeatCount="indefinite" />
        </path>
      </g>

      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="360 48 48" dur="2.4s" repeatCount="indefinite" />
        <ellipse cx="48" cy="48" rx="36" ry="16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" opacity="0.9" />
        <circle cx="84" cy="48" r="3.8" fill="currentColor">
          <animate attributeName="r" values="2.8;5;2.8" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="48" r="2.8" fill="currentColor" opacity="0.68">
          <animate attributeName="r" values="2;4.2;2" dur="1s" begin="0.38s" repeatCount="indefinite" />
        </circle>
      </g>

      <g>
        <animateTransform attributeName="transform" type="rotate" from="360 48 48" to="0 48 48" dur="4.8s" repeatCount="indefinite" />
        <ellipse cx="48" cy="48" rx="25" ry="39" stroke="currentColor" strokeWidth="1.3" strokeDasharray="7 8" opacity="0.42" />
      </g>

      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -2.4; 0 0" dur="2.2s" repeatCount="indefinite" />
        <path
          d="M27 18h18c19.88 0 36 13.43 36 30S64.88 78 45 78H27V18Z"
          stroke="currentColor"
          strokeWidth="5.8"
          strokeLinejoin="round"
        >
          <animate attributeName="stroke-width" values="5.2;7;5.2" dur="1.8s" repeatCount="indefinite" />
        </path>
        <path
          d="M41 33v30h5.75C57.24 63 66 56.08 66 48s-8.76-15-19.25-15H41Z"
          fill="currentColor"
          fillOpacity="0.18"
        >
          <animate attributeName="fill-opacity" values="0.12;0.36;0.12" dur="1.7s" repeatCount="indefinite" />
        </path>
        <path
          d="M40 22V74H68"
          stroke="currentColor"
          strokeWidth="4.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.72"
        >
          <animate attributeName="opacity" values="0.54;1;0.54" dur="1.5s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  );
}
