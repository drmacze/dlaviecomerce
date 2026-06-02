'use client';

import type { CSSProperties } from 'react';

type Props = {
  text: string;
  spinDuration?: number;
  className?: string;
};

export function CircularText({ text, spinDuration = 20, className = '' }: Props) {
  const letters = Array.from(text);
  return (
    <div className={`circular-text ${className}`} style={{ '--spin-duration': `${spinDuration}s` } as CSSProperties} aria-hidden="true">
      {letters.map((letter, index) => {
        const angle = (360 / letters.length) * index;
        return <span key={`${letter}-${index}`} style={{ transform: `rotate(${angle}deg) translateY(-50%)` }}>{letter}</span>;
      })}
    </div>
  );
}
