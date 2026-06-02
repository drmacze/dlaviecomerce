import { useEffect, useMemo, useState } from 'react';
import MetallicPaint from '@/components/MetallicPaint';
import './DlavieMetallicLoader.css';

const DLAVIE_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="DLAVIE mark"><defs><linearGradient id="dlavieLoaderMarkGradient" x1="12" y1="28" x2="108" y2="92" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#45D5FF"/><stop offset="0.42" stop-color="#5227FF"/><stop offset="0.72" stop-color="#E728FF"/><stop offset="1" stop-color="#DFFF4F"/></linearGradient><filter id="dlavieLoaderGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4" result="blur"/><feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.27 0 0 0 0 0.84 0 0 0 0 1 0 0 0 .32 0"/><feBlend in="SourceGraphic"/></filter></defs><path filter="url(#dlavieLoaderGlow)" d="M60 6C70.5 31 89 49.5 114 60C89 70.5 70.5 89 60 114C49.5 89 31 70.5 6 60C31 49.5 49.5 31 60 6Z" fill="url(#dlavieLoaderMarkGradient)"/><path d="M55 28C39.5 31.5 27.8 44.6 26 60C27.8 75.4 39.5 88.5 55 92C68.8 86.8 78.5 74.4 79.7 60C78.5 45.6 68.8 33.2 55 28Z" fill="rgba(255,255,255,.95)"/><path d="M68 28C80.4 35.2 88.4 46.4 90 60C88.4 73.6 80.4 84.8 68 92C76.2 81.5 80.1 70.8 80.1 60C80.1 49.2 76.2 38.5 68 28Z" fill="rgba(5,8,23,.18)"/></svg>`;

function supportsMetallicPaint() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const canvas = document.createElement('canvas');
  return Boolean(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
}

function DlavieLoaderFallbackSvg() {
  return (
    <svg className="dlavie-metallic-loader__fallback" viewBox="0 0 120 120" role="img" aria-label="DLAVIE loading mark">
      <defs>
        <linearGradient id="dlavieFallbackMarkGradient" x1="12" y1="28" x2="108" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#45D5FF" />
          <stop offset="0.42" stopColor="#5227FF" />
          <stop offset="0.72" stopColor="#E728FF" />
          <stop offset="1" stopColor="#DFFF4F" />
        </linearGradient>
        <filter id="dlavieFallbackGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.27 0 0 0 0 0.84 0 0 0 0 1 0 0 0 .32 0" />
          <feBlend in="SourceGraphic" />
        </filter>
      </defs>
      <path filter="url(#dlavieFallbackGlow)" d="M60 6C70.5 31 89 49.5 114 60C89 70.5 70.5 89 60 114C49.5 89 31 70.5 6 60C31 49.5 49.5 31 60 6Z" fill="url(#dlavieFallbackMarkGradient)" />
      <path d="M55 28C39.5 31.5 27.8 44.6 26 60C27.8 75.4 39.5 88.5 55 92C68.8 86.8 78.5 74.4 79.7 60C78.5 45.6 68.8 33.2 55 28Z" fill="rgba(255,255,255,.95)" />
      <path d="M68 28C80.4 35.2 88.4 46.4 90 60C88.4 73.6 80.4 84.8 68 92C76.2 81.5 80.1 70.8 80.1 60C80.1 49.2 76.2 38.5 68 28Z" fill="rgba(5,8,23,.18)" />
    </svg>
  );
}

export function DlavieMetallicLoader() {
  const [canUseMetallicPaint, setCanUseMetallicPaint] = useState(false);
  const imageSrc = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(DLAVIE_MARK_SVG)}`,
    [],
  );

  useEffect(() => {
    setCanUseMetallicPaint(supportsMetallicPaint());
  }, []);

  return (
    <div className="dlavie-metallic-loader" aria-hidden="true">
      {canUseMetallicPaint ? (
        <div className="dlavie-metallic-loader__paint">
          <MetallicPaint
            imageSrc={imageSrc}
            seed={27}
            scale={5.25}
            refraction={0.018}
            blur={0.012}
            liquid={0.68}
            speed={0.22}
            brightness={1.9}
            contrast={0.62}
            angle={-24}
            fresnel={1.25}
            lightColor="#ffffff"
            darkColor="#050505"
            patternSharpness={1.1}
            waveAmplitude={0.72}
            noiseScale={0.42}
            chromaticSpread={1.8}
            distortion={0.62}
            contour={0.24}
            tintColor="#dfff4f"
          />
        </div>
      ) : (
        <DlavieLoaderFallbackSvg />
      )}
    </div>
  );
}
