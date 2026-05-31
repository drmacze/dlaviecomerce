'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ShaderMaterial, Vector2 } from 'three';
import { dlavieFieldFragmentShader } from './shaders/dlavieField.frag';
import { dlavieFieldVertexShader } from './shaders/dlavieField.vert';
import { WebGLFallback } from './WebGLFallback';

function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

function ShaderPlane({ reduced }: { reduced: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const { size, pointer } = useThree();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: reduced ? 0.18 : 0.72 },
    uMouse: { value: new Vector2(0.5, 0.5) },
    uResolution: { value: new Vector2(1, 1) },
  }), [reduced]);

  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = reduced ? 0.0 : clock.getElapsedTime();
    material.current.uniforms.uMouse.value.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5);
    material.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={dlavieFieldVertexShader} fragmentShader={dlavieFieldFragmentShader} transparent depthWrite={false} depthTest={false} />
    </mesh>
  );
}

export function DlavieShaderBackdrop({ className = '' }: { className?: string }) {
  const [available, setAvailable] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    setAvailable(isWebGLAvailable());
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (!available) return <WebGLFallback />;

  return (
    <div className={`dlv-shader-backdrop ${className}`} aria-hidden="true">
      <Canvas dpr={[1, 1.35]} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 1] }}>
        <ShaderPlane reduced={reduced} />
      </Canvas>
    </div>
  );
}
