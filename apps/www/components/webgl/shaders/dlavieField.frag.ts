import { noiseGLSL } from './noise.glsl';

export const dlavieFieldFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
uniform float uDirection;
uniform float uZoom;
uniform float uSection;
uniform float uIntensity;
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

${noiseGLSL}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 centered = (uv - 0.5) * aspect;
  vec2 mouse = (uMouse - 0.5) * aspect;

  float zoomBend = 1.0 + uZoom * 0.34;
  vec2 scrollDrift = vec2(uScroll * 0.55 * uDirection, -uScroll * 0.38);
  vec2 warp = centered * (2.2 + zoomBend) + scrollDrift + mouse * 0.16;
  float wave = fbm(warp + vec2(uTime * 0.05, -uTime * 0.035));
  float plasma = fbm(centered * (5.0 + uZoom * 2.4) - vec2(uTime * 0.03 + uScroll, uTime * 0.045));
  float pointer = 1.0 - smoothstep(0.0, 0.72, distance(centered, mouse));
  float tunnel = 1.0 - smoothstep(0.0, 1.18 + uZoom * 0.3, length(centered * (1.0 - uZoom * 0.16)));
  float scan = sin((uv.y + uScroll * 0.8) * 42.0 + uTime * 1.2) * 0.5 + 0.5;

  vec3 violet = vec3(0.45, 0.18, 1.0);
  vec3 cyan = vec3(0.04, 0.82, 0.96);
  vec3 pink = vec3(0.88, 0.38, 1.0);
  vec3 deep = vec3(0.02, 0.025, 0.08);
  vec3 color = mix(violet, cyan, smoothstep(0.12, 1.0, wave + pointer * 0.32 + uSection * 0.08));
  color = mix(color, pink, plasma * (0.22 + uVelocity * 0.18));
  color = mix(deep, color, 0.72 + tunnel * 0.28);
  color += scan * uVelocity * 0.045;

  float alpha = (tunnel * 0.18 + wave * 0.11 + pointer * 0.13 + uVelocity * 0.11 + uZoom * 0.12) * uIntensity;
  alpha *= smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.68, uv.y);

  gl_FragColor = vec4(color, alpha);
}
`;
