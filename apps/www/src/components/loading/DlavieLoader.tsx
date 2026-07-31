'use client';

type DlavieLoaderProps = {
  isLeaving: boolean;
  onExited: () => void;
};

export function DlavieLoader({ isLeaving, onExited }: DlavieLoaderProps) {
  return (
    <div
      className="dlavie-loader dlavie-loader--quiet"
      data-state={isLeaving ? 'leaving' : 'visible'}
      role="status"
      aria-live="polite"
      aria-label="Memuat DLavie Commerce"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === 'opacity' && isLeaving) {
          onExited();
        }
      }}
    >
      <div className="dlavie-loader__quiet-content">
        <div className="dlavie-loader__quiet-wordmark" aria-hidden="true">
          <span>DLavie</span>
          <i />
        </div>
        <p>Commerce</p>
      </div>
    </div>
  );
}
