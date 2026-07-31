import type { CSSProperties } from 'react';

type DlavieMarkProps = {
  className?: string;
  title?: string;
};

type DlavieBrandProps = {
  className?: string;
  product?: string;
  compact?: boolean;
  tone?: 'ink' | 'light';
};

export function DlavieMark({ className, title = 'DLavie' }: DlavieMarkProps) {
  const style = {
    '--dlavie-mark-background': 'currentColor',
  } as CSSProperties;

  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      role="img"
      aria-label={title}
      style={style}
    >
      <rect
        className="dlavie-mark__base"
        x="8"
        y="8"
        width="112"
        height="112"
        rx="32"
      />
      <path
        className="dlavie-mark__letter"
        d="M38 35v58h19.5C75.4 93 88 80.9 88 64S75.4 35 57.5 35H38Zm17 14c10.4 0 17.5 5.8 17.5 15S65.4 79 55 79h-1V49h1Z"
      />
      <path
        className="dlavie-mark__accent"
        d="M77 39 91 64 77 89"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DlavieBrand({
  className,
  product,
  compact = false,
  tone = 'ink',
}: DlavieBrandProps) {
  const classes = ['dlavie-brand', compact ? 'dlavie-brand--compact' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} data-tone={tone}>
      <DlavieMark className="dlavie-brand__mark" title="DLavie" />
      <span className="dlavie-brand__copy">
        <strong>DLAVIE</strong>
        {product ? <small>{product}</small> : null}
      </span>
    </span>
  );
}
