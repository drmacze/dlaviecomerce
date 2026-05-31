import { noiseGLSL } from './noise.glsl';

export const dlavieFieldFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
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

  float wave = fbm(centered * 2.6 + vec2(uTime * 0.055, -uTime * 0.035));
  float plasma = fbm(centered * 5.2 - vec2(uTime * 0.032, uTime * 0.045));
  float pointer = 1.0 - smoothstep(0.0, 0.75, distance(centered, mouse));
  float core = 1.0 - smoothstep(0.05, 0.82, length(centered + vec2(0.16, -0.05)));

  vec3 violet = vec3(0.48, 0.19, 1.0);
  vec3 cyan = vec3(0.05, 0.83, 0.96);
  vec3 pink = vec3(0.93, 0.42, 1.0);
  vec3 color = mix(violet, cyan, smoothstep(0.2, 1.0, wave + pointer * 0.35));
  color = mix(color, pink, plasma * 0.24);

  float alpha = (core * 0.28 + wave * 0.11 + pointer * 0.16) * uIntensity;
  alpha *= smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.72, uv.y);

  gl_FragColor = vec4(color, alpha);
}
`;
