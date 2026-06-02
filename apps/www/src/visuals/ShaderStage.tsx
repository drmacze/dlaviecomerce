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
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * ratio);
      canvas.height = Math.floor(canvas.clientHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = () => {
      frame += 0.008;
      const { clientWidth: width, clientHeight: height } = canvas;
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < 8; i += 1) {
        const x = width * (0.18 + i * 0.11 + Math.sin(frame + i) * 0.03);
        const y = height * (0.18 + Math.cos(frame * 1.4 + i) * 0.26 + i * 0.055);
        const gradient = context.createRadialGradient(x, y, 0, x, y, width * 0.24);
        gradient.addColorStop(0, i % 2 ? 'rgba(117, 255, 225, 0.24)' : 'rgba(130, 96, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(3, 4, 9, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, width * 0.25, 0, Math.PI * 2);
        context.fill();
      }
      raf = window.requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="shader-stage" aria-hidden="true" />;
}
