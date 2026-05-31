'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, ShaderMaterial, Vector2 } from 'three';
import { dlavieFieldFragmentShader } from './shaders/dlavieField.frag';
import { dlavieFieldVertexShader } from './shaders/dlavieField.vert';

export function DlavieHolographicField() {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.55 },
    uMouse: { value: new Vector2(0.58, 0.5) },
    uResolution: { value: new Vector2(900, 900) },
  }), []);

  useFrame(({ clock, pointer, size }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.getElapsedTime();
    material.current.uniforms.uMouse.value.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5);
    material.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh position={[0, 0, -0.22]} scale={[5.3, 5.3, 1]} frustumCulled={false}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={dlavieFieldVertexShader} fragmentShader={dlavieFieldFragmentShader} transparent depthWrite={false} blending={AdditiveBlending} />
    </mesh>
  );
}
