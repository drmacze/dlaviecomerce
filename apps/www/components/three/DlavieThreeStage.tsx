'use client';

import { Environment, Float } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { DlavieCubicCore } from './DlavieCubicCore';
import { DlavieOrbitRings } from './DlavieOrbitRings';
import { DlavieParticles } from './DlavieParticles';

export function DlavieThreeStage() {
  return (
    <div className="dlv-three-stage" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.2, 6.6], fov: 42 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#050510']} />
          <fog attach="fog" args={['#050510', 7, 12]} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 3.5, 4]} intensity={1.8} color="#b28cff" />
          <pointLight position={[-3.2, 1.8, 2.4]} intensity={16} color="#22d3ee" distance={7} />
          <pointLight position={[2.8, -2.1, 2.2]} intensity={12} color="#a855f7" distance={6} />
          <DlavieParticles />
          <Float speed={1.25} rotationIntensity={0.18} floatIntensity={0.55} floatingRange={[-0.16, 0.18]}>
            <group position={[0.18, 0.05, 0]}>
              <DlavieOrbitRings />
              <DlavieCubicCore />
            </group>
          </Float>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
