import type { CSSProperties } from 'react';

type ParticleFieldProps = {
  variant?: 'default' | 'hero';
};

export function ParticleField({ variant = 'default' }: ParticleFieldProps) {
  const count = variant === 'hero' ? 62 : 34;
  return <div className={`particle-field particle-field-${variant}`} aria-hidden="true">{Array.from({ length: count }, (_, index) => <span key={index} style={{ '--i': index } as CSSProperties} />)}</div>;
}
