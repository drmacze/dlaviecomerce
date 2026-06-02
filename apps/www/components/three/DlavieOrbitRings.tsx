'use client';

import { Torus } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

export function DlavieOrbitRings() {
  const rings = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!rings.current) return;

    const elapsed = clock.getElapsedTime();
    rings.current.rotation.y = elapsed * 0.18;
    rings.current.rotation.z = Math.sin(elapsed * 0.22) * 0.08;
  });

  return (
    <group ref={rings}>
      <Torus args={[1.8, 0.01, 12, 128]} rotation={[Math.PI / 2.2, 0.1, 0.35]}>
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.68} />
      </Torus>
      <Torus args={[2.18, 0.008, 12, 128]} rotation={[1.04, 0.46, -0.22]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.46} />
      </Torus>
      <Torus args={[2.48, 0.006, 12, 128]} rotation={[0.66, -0.58, 0.74]}>
        <meshBasicMaterial color="#f0abfc" transparent opacity={0.28} />
      </Torus>
    </group>
  );
}
