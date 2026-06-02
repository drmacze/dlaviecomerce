'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../motion/useReducedMotion';

export function ShaderStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    let frame = 0;
    let raf = 0;
    let resizeRaf = 0;
    let width = 0;
    let height = 0;
    let progress = 0;

    const resize = () => {
      window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(() => {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      });
    };

    const updateProgress = (event: Event) => {
      progress = (event as CustomEvent<number>).detail ?? progress;
    };

    const draw = () => {
      frame += 0.008;
      context.clearRect(0, 0, width, height);
      const warm = 0.18 + progress * 0.08;
      const violet = 0.14 + progress * 0.06;

      for (let i = 0; i < 7; i += 1) {
        const x = width * (0.12 + i * 0.13 + Math.sin(frame + i) * 0.035);
        const y = height * (0.16 + Math.cos(frame * 1.24 + i) * 0.24 + i * 0.055);
        const radius = Math.max(width, height) * (0.18 + (i % 3) * 0.035);
        const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, i % 2 ? `rgba(255, 128, 105, ${warm})` : `rgba(210, 128, 255, ${violet})`);
        gradient.addColorStop(0.45, i % 2 ? 'rgba(255, 88, 138, 0.07)' : 'rgba(116, 255, 226, 0.055)');
        gradient.addColorStop(1, 'rgba(3, 4, 9, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      const particleCount = width < 700 ? 42 : 86;
      for (let i = 0; i < particleCount; i += 1) {
        const seed = i * 97.13;
        const x = (Math.sin(seed) * 0.5 + 0.5) * width + Math.sin(frame * 0.7 + i) * 10;
        const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * height + Math.cos(frame + i) * 8;
        const alpha = 0.12 + ((i % 7) / 7) * 0.22;
        context.fillStyle = i % 5 === 0 ? `rgba(255, 146, 124, ${alpha})` : `rgba(255, 245, 235, ${alpha})`;
        context.beginPath();
        context.arc(x, y, i % 6 === 0 ? 1.35 : 0.85, 0, Math.PI * 2);
        context.fill();
      }
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('dlavie:section-progress', updateProgress);

    return () => {
      window.cancelAnimationFrame(raf);
      window.cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('dlavie:section-progress', updateProgress);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="shader-stage" aria-hidden="true" />;
}
