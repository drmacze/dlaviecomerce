'use client';

import { Environment, Float } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { DlavieHolographicField } from '../webgl/DlavieHolographicField';
import { DlavieCubicCore } from './DlavieCubicCore';
import { DlavieOrbitRings } from './DlavieOrbitRings';
import { DlavieParticles } from './DlavieParticles';

export function DlavieThreeStage() {
  return (
    <div className="dlv-three-stage" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.24, 6.35], fov: 40 }} dpr={[1, 1.55]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <Suspense fallback={null}>
          <color attach="background" args={['#050510']} />
          <fog attach="fog" args={['#050510', 7, 12]} />
          <ambientLight intensity={0.72} />
          <directionalLight position={[4, 3.5, 4]} intensity={2.05} color="#c4b5fd" />
          <pointLight position={[-3.2, 1.8, 2.4]} intensity={18} color="#22d3ee" distance={7} />
          <pointLight position={[2.8, -2.1, 2.2]} intensity={13} color="#a855f7" distance={6} />
          <DlavieHolographicField />
          <DlavieParticles />
          <Float speed={1.25} rotationIntensity={0.2} floatIntensity={0.58} floatingRange={[-0.16, 0.2]}>
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
