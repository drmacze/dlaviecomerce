"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShaderMaterial, Vector2 } from "three";
import { dlavieFieldFragmentShader } from "./shaders/dlavieField.frag";
import { dlavieFieldVertexShader } from "./shaders/dlavieField.vert";
import { WebGLFallback } from "./WebGLFallback";

function isWebGLAvailable() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

function cssNumber(name: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(name),
  );
  return Number.isFinite(value) ? value : fallback;
}

function ShaderPlane({ reduced }: { reduced: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const { size, pointer } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uDirection: { value: 1 },
      uZoom: { value: 0 },
      uSection: { value: 0 },
      uScene: { value: 0 },
      uIntensity: { value: reduced ? 0.2 : 0.72 },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uResolution: { value: new Vector2(1, 1) },
    }),
    [reduced],
  );

  useFrame(({ clock }) => {
    if (!material.current) return;
    const velocity = cssNumber("--dlv-scroll-velocity");
    const scroll = cssNumber("--dlv-scroll-progress");
    const zoom = cssNumber("--dlv-zoom-progress");
    material.current.uniforms.uTime.value = reduced
      ? 0.0
      : clock.getElapsedTime();
    material.current.uniforms.uScroll.value = scroll;
    material.current.uniforms.uVelocity.value = reduced ? 0 : velocity;
    material.current.uniforms.uDirection.value = cssNumber(
      "--dlv-scroll-direction",
      1,
    );
    material.current.uniforms.uZoom.value = reduced ? 0 : zoom;
    const section = cssNumber("--dlv-active-section");
    material.current.uniforms.uSection.value = section;
    material.current.uniforms.uScene.value = section / 5;
    material.current.uniforms.uIntensity.value = reduced
      ? 0.22
      : 0.66 + velocity * 0.3 + zoom * 0.18;
    material.current.uniforms.uMouse.value.set(
      pointer.x * 0.5 + 0.5,
      pointer.y * 0.5 + 0.5,
    );
    material.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={dlavieFieldVertexShader}
        fragmentShader={dlavieFieldFragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function DlavieShaderBackdrop({
  className = "",
}: {
  className?: string;
}) {
  const [available, setAvailable] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    setAvailable(isWebGLAvailable());
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!available) return <WebGLFallback />;

  return (
    <div className={`dlv-shader-backdrop ${className}`} aria-hidden="true">
      <Canvas
        dpr={[1, 1.35]}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 1] }}
      >
        <ShaderPlane reduced={reduced} />
      </Canvas>
    </div>
  );
}
