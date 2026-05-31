'use client';

import { Edges, MeshDistortMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { AdditiveBlending, BackSide } from 'three';

export function DlavieCubicCore() {
  const cube = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (cube.current) {
      cube.current.rotation.x = elapsed * 0.22 + 0.48;
      cube.current.rotation.y = elapsed * 0.32 + 0.72;
      cube.current.rotation.z = Math.sin(elapsed * 0.38) * 0.08;
    }

    if (glow.current) {
      const pulse = 1.1 + Math.sin(elapsed * 1.4) * 0.045;
      glow.current.scale.setScalar(pulse);
      glow.current.rotation.copy(cube.current?.rotation ?? glow.current.rotation);
    }
  });

  return (
    <group>
      <mesh ref={glow} scale={1.18}>
        <boxGeometry args={[1.76, 1.76, 1.76, 10, 10, 10]} />
        <meshBasicMaterial
          color="#6d5dfc"
          transparent
          opacity={0.13}
          blending={AdditiveBlending}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={cube} castShadow receiveShadow>
        <boxGeometry args={[1.58, 1.58, 1.58, 16, 16, 16]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#25115f"
          emissiveIntensity={0.65}
          roughness={0.16}
          metalness={0.12}
          transmission={0.42}
          thickness={0.9}
          transparent
          opacity={0.82}
          clearcoat={1}
          clearcoatRoughness={0.1}
          distort={0.09}
          speed={0.85}
        />
        <Edges color="#67e8f9" threshold={14} scale={1.012} />
      </mesh>
    </group>
  );
}
