'use client';

import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Points as ThreePoints } from 'three';

export function DlavieParticles() {
  const points = useRef<ThreePoints>(null);
  const positions = useMemo(() => {
    const particles = new Float32Array(190 * 3);

    for (let index = 0; index < particles.length; index += 3) {
      particles[index] = (Math.random() - 0.5) * 7.2;
      particles[index + 1] = (Math.random() - 0.5) * 4.6;
      particles[index + 2] = (Math.random() - 0.5) * 4.8;
    }

    return particles;
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.getElapsedTime() * 0.025 + pointer.x * 0.035;
    points.current.rotation.x = pointer.y * 0.02;
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#c4b5fd" size={0.018} sizeAttenuation depthWrite={false} opacity={0.55} />
    </Points>
  );
}
