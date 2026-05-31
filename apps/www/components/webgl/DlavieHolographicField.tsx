'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { AdditiveBlending, ShaderMaterial, Vector2 } from 'three';
import { dlavieFieldFragmentShader } from './shaders/dlavieField.frag';
import { dlavieFieldVertexShader } from './shaders/dlavieField.vert';

function cssNumber(name: string, fallback = 0) {
  if (typeof window === 'undefined') return fallback;
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

export function DlavieHolographicField() {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uVelocity: { value: 0 },
    uDirection: { value: 1 },
    uZoom: { value: 0 },
    uSection: { value: 0 },
    uIntensity: { value: 0.55 },
    uMouse: { value: new Vector2(0.58, 0.5) },
    uResolution: { value: new Vector2(900, 900) },
  }), []);

  useFrame(({ clock, pointer, size }) => {
    if (!material.current) return;
    const velocity = cssNumber('--dlv-scroll-velocity');
    const zoom = cssNumber('--dlv-zoom-progress');
    material.current.uniforms.uTime.value = clock.getElapsedTime();
    material.current.uniforms.uScroll.value = cssNumber('--dlv-scroll-progress');
    material.current.uniforms.uVelocity.value = velocity;
    material.current.uniforms.uDirection.value = cssNumber('--dlv-scroll-direction', 1);
    material.current.uniforms.uZoom.value = zoom;
    material.current.uniforms.uSection.value = cssNumber('--dlv-active-section');
    material.current.uniforms.uIntensity.value = 0.42 + velocity * 0.36 + zoom * 0.24;
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
