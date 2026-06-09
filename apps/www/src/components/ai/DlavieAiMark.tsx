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
      <path
        d="M27 18h18c19.88 0 36 13.43 36 30S64.88 78 45 78H27V18Z"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <path
        d="M41 33v30h5.75C57.24 63 66 56.08 66 48s-8.76-15-19.25-15H41Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M20.5 60.5C10.3 52.7 8.26 42.45 14.95 34.48c8.77-10.44 31.9-12.39 51.66-4.36 7.84 3.19 13.65 7.7 16.87 12.55"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.42"
      />
      <path
        d="M75.4 34.33c9.32 7.53 11.15 17.3 4.65 25.05-8.77 10.45-31.9 12.4-51.66 4.36-7.13-2.9-12.6-6.9-15.94-11.25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.28"
      />
      <circle cx="76.5" cy="31.5" r="4.5" fill="currentColor" />
      <circle cx="19.5" cy="64.5" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
