'use client';

import { Canvas } from '@react-three/fiber';

export function DlavieGalaxy() {
  return (
    <div className="dlv-galaxy" aria-hidden="true">
      <Canvas>
        <ambientLight />
        <mesh>
          <boxGeometry />
          <meshBasicMaterial color="#8b5cf6" />
        </mesh>
      </Canvas>
    </div>
  );
}
