'use client';

import { DlavieMark } from '../brand/DlavieBrand';

type DlavieLoaderProps = {
  isLeaving: boolean;
  onExited: () => void;
};

export function DlavieLoader({ isLeaving, onExited }: DlavieLoaderProps) {
  return (
    <div
      className="dlavie-loader"
      data-state={isLeaving ? 'leaving' : 'visible'}
      role="status"
      aria-live="polite"
      aria-label="DLavie sedang memuat"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === 'opacity' && isLeaving) {
          onExited();
        }
      }}
    >
      <div className="dlavie-loader__backdrop" aria-hidden="true" />
      <div className="dlavie-loader__content">
        <div className="dlavie-loader__mark" aria-hidden="true">
          <DlavieMark className="dlavie-loader__brand-mark" />
          <span className="dlavie-loader__frame" />
        </div>
        <p className="dlavie-loader__wordmark">DLAVIE</p>
        <p className="dlavie-loader__eyebrow">Commerce · AI · Automation</p>
        <span className="dlavie-loader__progress" aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  );
}
