'use client';

import { Points, PointMaterial } from '@react-three/drei';
import { useMemo } from 'react';

export function DlavieParticles() {
  const positions = useMemo(() => {
    const particles = new Float32Array(210 * 3);

    for (let index = 0; index < particles.length; index += 3) {
      particles[index] = (Math.random() - 0.5) * 7.2;
      particles[index + 1] = (Math.random() - 0.5) * 4.6;
      particles[index + 2] = (Math.random() - 0.5) * 4.8;
    }

    return particles;
  }, []);

  return (
    <Points positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#c4b5fd" size={0.018} sizeAttenuation depthWrite={false} opacity={0.55} />
    </Points>
  );
}
