'use client';

import { Edges, MeshDistortMaterial } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';
import { AdditiveBlending, BackSide } from 'three';

export function DlavieCubicCore() {
  const cube = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);
  const rim = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const pointerX = pointer.x * 0.18;
    const pointerY = pointer.y * 0.14;

    if (cube.current) {
      cube.current.rotation.x = elapsed * 0.22 + 0.48 + pointerY;
      cube.current.rotation.y = elapsed * 0.32 + 0.72 + pointerX;
      cube.current.rotation.z = Math.sin(elapsed * 0.38) * 0.08;
      cube.current.position.x = pointer.x * 0.08;
      cube.current.position.y = pointer.y * 0.06;
    }

    if (glow.current) {
      const pulse = 1.12 + Math.sin(elapsed * 1.4) * 0.055 + Math.abs(pointer.x) * 0.025;
      glow.current.scale.setScalar(pulse);
      glow.current.rotation.copy(cube.current?.rotation ?? glow.current.rotation);
    }

    if (rim.current) {
      rim.current.rotation.x = -elapsed * 0.18;
      rim.current.rotation.y = elapsed * 0.24;
      rim.current.scale.setScalar(1.34 + Math.sin(elapsed * 1.1) * 0.03);
    }
  });

  return (
    <group>
      <mesh ref={glow} scale={1.2}>
        <boxGeometry args={[1.78, 1.78, 1.78, 12, 12, 12]} />
        <meshBasicMaterial color="#6d5dfc" transparent opacity={0.16} blending={AdditiveBlending} side={BackSide} depthWrite={false} />
      </mesh>

      <mesh ref={rim} scale={1.34}>
        <boxGeometry args={[1.76, 1.76, 1.76, 4, 4, 4]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.055} blending={AdditiveBlending} wireframe depthWrite={false} />
      </mesh>

      <mesh ref={cube} castShadow receiveShadow>
        <boxGeometry args={[1.58, 1.58, 1.58, 20, 20, 20]} />
        <MeshDistortMaterial
          color="#8b5cf6"
          emissive="#2b126e"
          emissiveIntensity={0.82}
          roughness={0.13}
          metalness={0.18}
          transmission={0.48}
          thickness={0.95}
          transparent
          opacity={0.86}
          clearcoat={1}
          clearcoatRoughness={0.08}
          distort={0.12}
          speed={1.08}
        />
        <Edges color="#67e8f9" threshold={12} scale={1.014} />
      </mesh>
    </group>
  );
}
