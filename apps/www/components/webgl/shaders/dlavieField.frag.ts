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

  float zoomBend = 1.0 + uZoom * 0.28;
  vec2 scrollDrift = vec2(uScroll * 0.38 * uDirection, -uScroll * 0.28);
  vec2 warp = centered * (1.65 + zoomBend) + scrollDrift + mouse * 0.12;
  float cloudA = fbm(warp + vec2(uTime * 0.028, -uTime * 0.022));
  float cloudB = fbm(centered * (2.6 + uZoom * 1.2) - vec2(uTime * 0.018 + uScroll * 0.38, uTime * 0.025));
  float cloudC = fbm(centered * 1.08 + vec2(-uTime * 0.018, uScroll * 0.22));
  float pointer = 1.0 - smoothstep(0.0, 0.72, distance(centered, mouse));
  float whiteBloom = 1.0 - smoothstep(0.0, 0.82 + uZoom * 0.2, length(centered - vec2(0.10, -0.04)));
  float bluePool = 1.0 - smoothstep(0.0, 0.95, length(centered - vec2(-0.38, 0.30)));
  float violetPool = 1.0 - smoothstep(0.0, 0.92, length(centered - vec2(0.44, 0.22)));
  float deepPool = 1.0 - smoothstep(0.12, 1.08, length(centered - vec2(-0.46, -0.48)));
  float scan = sin((uv.y + uScroll * 0.8) * 36.0 + uTime * 0.8) * 0.5 + 0.5;

  vec3 whiteMist = vec3(0.96, 0.98, 1.0);
  vec3 skyBlue = vec3(0.42, 0.57, 1.0);
  vec3 lavender = vec3(0.73, 0.68, 1.0);
  vec3 softViolet = vec3(0.46, 0.39, 1.0);
  vec3 midnight = vec3(0.015, 0.04, 0.16);

  float vapor = smoothstep(0.18, 0.95, cloudA * 0.58 + cloudB * 0.34 + cloudC * 0.3);
  vec3 color = mix(whiteMist, skyBlue, bluePool * 0.5 + vapor * 0.32);
  color = mix(color, lavender, violetPool * 0.68 + cloudB * 0.16);
  color = mix(color, softViolet, smoothstep(0.48, 1.0, violetPool + uScroll * 0.26) * 0.22);
  color = mix(color, midnight, deepPool * (0.18 + uScroll * 0.36));
  color += whiteBloom * vec3(0.12, 0.14, 0.18);
  color += pointer * vec3(0.04, 0.05, 0.08) * (0.18 + uVelocity * 0.22);
  color += scan * uVelocity * 0.025;

  float alpha = (0.74 + vapor * 0.18 + pointer * 0.05 + uVelocity * 0.04) * uIntensity;
  alpha *= smoothstep(0.0, 0.10, uv.y) * smoothstep(1.0, 0.74, uv.y);

  gl_FragColor = vec4(color, alpha);
}
`;
