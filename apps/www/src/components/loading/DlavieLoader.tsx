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
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  gl?.getExtension('EXT_color_buffer_float');
  return Boolean(gl);
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function DlavieLoader({ isLeaving, onExited }: DlavieLoaderProps) {
  const [useMetallicPaint, setUseMetallicPaint] = useState(false);

  useEffect(() => {
    setUseMetallicPaint(supportsMetallicPaint() && !prefersReducedMotion());
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
          {useMetallicPaint ? (
            <MetallicPaint
              imageSrc={DLAVIE_MARK_SRC}
              seed={18}
              scale={5.8}
              refraction={0.025}
              blur={0.018}
              liquid={0.62}
              speed={0.22}
              brightness={1.85}
              contrast={0.72}
              angle={-12}
              fresnel={1.35}
              lightColor="#fff4ed"
              darkColor="#130611"
              patternSharpness={1.34}
              waveAmplitude={0.72}
              noiseScale={0.44}
              chromaticSpread={1.5}
              distortion={0.72}
              contour={0.28}
              tintColor="#ff9fb8"
            />
          ) : (
            <img className="dlavie-loader__static-mark" src={DLAVIE_MARK_SRC} alt="" />
          )}
        </div>
        <p className="dlavie-loader__wordmark">DLAVIE</p>
      </div>
    </div>
  );
}
