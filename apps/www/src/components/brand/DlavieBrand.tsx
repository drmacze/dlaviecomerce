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
  return (
    <svg
      className={className}
      viewBox="0 0 144 112"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="dlavie-mark__glyph"
        fillRule="evenodd"
        d="M8 12h40l32 27v34l-32 27H8V12Zm24 23v42h9l15-13V48L41 35h-9Z"
      />
      <path className="dlavie-mark__glyph" d="M92 12h24v65h20v23H92V12Z" />
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
