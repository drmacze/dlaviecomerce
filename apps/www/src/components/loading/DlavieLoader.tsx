'use client';

import { useEffect, useState } from 'react';
import { MetallicPaint } from '../effects/MetallicPaint';

type DlavieLoaderProps = {
  isLeaving: boolean;
  onExited: () => void;
};

const DLAVIE_MARK_SRC = '/brand/dlavie-mark.svg';

function supportsMetallicPaint() {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
    return Boolean(gl && !gl.isContextLost());
  } catch {
    return false;
  }
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function DlavieLoader({ isLeaving, onExited }: DlavieLoaderProps) {
  const [paintMode, setPaintMode] = useState<'checking' | 'metallic' | 'fallback'>('checking');

  useEffect(() => {
    setPaintMode(supportsMetallicPaint() && !prefersReducedMotion() ? 'metallic' : 'fallback');
  }, []);

  return (
    <div
      className="dlavie-loader"
      data-state={isLeaving ? 'leaving' : 'visible'}
      role="status"
      aria-live="polite"
      aria-label="DLavie is loading"
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === 'opacity' && isLeaving) {
          onExited();
        }
      }}
    >
      <div className="dlavie-loader__backdrop" aria-hidden="true" />
      <div className="dlavie-loader__content">
        <div className="dlavie-loader__mark" aria-hidden="true">
          {paintMode === 'metallic' ? (
            <MetallicPaint
              imageSrc={DLAVIE_MARK_SRC}
              seed={42}
              scale={4}
              patternSharpness={1}
              noiseScale={0.5}
              speed={0.3}
              liquid={0.75}
              mouseAnimation={false}
              brightness={2}
              contrast={0.5}
              refraction={0.01}
              blur={0.015}
              chromaticSpread={2}
              fresnel={1}
              angle={0}
              waveAmplitude={1}
              distortion={1}
              contour={0.2}
              lightColor="#ffffff"
              darkColor="#000000"
              tintColor="#feb3ff"
            />
          ) : paintMode === 'fallback' ? (
            <img className="dlavie-loader__static-mark" src={DLAVIE_MARK_SRC} alt="" />
          ) : null}
        </div>
        <p className="dlavie-loader__wordmark">DLAVIE</p>
      </div>
    </div>
  );
}
