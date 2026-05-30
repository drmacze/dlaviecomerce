import { Float, MeshDistortMaterial } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';

function HologramOrb({ position, color, speed = 0.2 }: { position: [number, number, number]; color: string; speed?: number }) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const time = state.clock.elapsedTime * speed;
    group.current.rotation.x = Math.sin(time) * 0.22;
    group.current.rotation.y = Math.cos(time * 0.82) * 0.28;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.45} floatIntensity={0.55} position={position}>
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[1.35, 5]} />
          <MeshDistortMaterial color={color} roughness={0.32} metalness={0.18} distort={0.36} speed={1.65} transparent opacity={0.32} />
        </mesh>
      </group>
    </Float>
  );
}

export function DlavieHolographicScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden opacity-70 md:block" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7.2], fov: 42 }} dpr={[1, 1.35]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <ambientLight intensity={1.12} />
        <pointLight position={[4, 4, 4]} intensity={1.4} color="#dfff4f" />
        <pointLight position={[-4, -2, 4]} intensity={1.05} color="#45d5ff" />
        <HologramOrb position={[-3.7, 1.9, -1.8]} color="#45d5ff" speed={0.24} />
        <HologramOrb position={[3.8, 1.35, -2.2]} color="#dfff4f" speed={0.18} />
        <HologramOrb position={[2.3, -2.4, -2.8]} color="#e728ff" speed={0.16} />
      </Canvas>
    </div>
  );
}
