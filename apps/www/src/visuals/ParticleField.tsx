import type { CSSProperties } from 'react';

export function ParticleField() {
  return <div className="particle-field" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <span key={index} style={{ '--i': index } as CSSProperties} />)}</div>;
}
