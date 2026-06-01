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
  float time = uTime * 1.55;

  float zoomBend = 1.0 + uZoom * 0.38;
  vec2 scrollDrift = vec2(uScroll * 0.56 * uDirection, -uScroll * 0.42);
  vec2 orbit = vec2(sin(time * 0.12), cos(time * 0.10)) * 0.14;
  vec2 warp = centered * (1.48 + zoomBend) + scrollDrift + mouse * 0.16 + orbit;

  float cloudA = fbm(warp + vec2(time * 0.055, -time * 0.042));
  float cloudB = fbm(centered * (2.45 + uZoom * 1.35) - vec2(time * 0.038 + uScroll * 0.5, time * 0.044));
  float cloudC = fbm(centered * 1.05 + vec2(-time * 0.032, uScroll * 0.34 + time * 0.026));
  float cloudD = fbm(centered * 4.3 + vec2(time * 0.028, -time * 0.06));

  float pointer = 1.0 - smoothstep(0.0, 0.72, distance(centered, mouse));
  float whiteBloom = 1.0 - smoothstep(0.0, 0.86 + uZoom * 0.24, length(centered - vec2(0.10, -0.04)));
  float bluePool = 1.0 - smoothstep(0.0, 0.95, length(centered - vec2(-0.38 + orbit.x, 0.30 + orbit.y)));
  float violetPool = 1.0 - smoothstep(0.0, 0.92, length(centered - vec2(0.44 - orbit.y, 0.22 + orbit.x)));
  float deepPool = 1.0 - smoothstep(0.12, 1.08, length(centered - vec2(-0.46, -0.48)));
  float scan = sin((uv.y + uScroll * 0.9) * 42.0 + time * 1.1) * 0.5 + 0.5;
  float wave = sin((uv.x * 2.0 + uv.y * 1.4 + time * 0.18 + uScroll) * 4.2) * 0.5 + 0.5;

  vec3 whiteMist = vec3(0.96, 0.98, 1.0);
  vec3 skyBlue = vec3(0.40, 0.56, 1.0);
  vec3 lavender = vec3(0.74, 0.68, 1.0);
  vec3 softViolet = vec3(0.46, 0.38, 1.0);
  vec3 midnight = vec3(0.015, 0.04, 0.16);

  float vapor = smoothstep(0.16, 0.94, cloudA * 0.5 + cloudB * 0.32 + cloudC * 0.3 + cloudD * 0.12);
  vec3 color = mix(whiteMist, skyBlue, bluePool * 0.56 + vapor * 0.36);
  color = mix(color, lavender, violetPool * 0.7 + cloudB * 0.18);
  color = mix(color, softViolet, smoothstep(0.46, 1.0, violetPool + uScroll * 0.32 + wave * 0.12) * 0.26);
  color = mix(color, midnight, deepPool * (0.16 + uScroll * 0.38));
  color += whiteBloom * vec3(0.13, 0.15, 0.2);
  color += pointer * vec3(0.045, 0.06, 0.09) * (0.22 + uVelocity * 0.34);
  color += scan * uVelocity * 0.038;
  color += wave * 0.018;

  float alpha = (0.8 + vapor * 0.2 + pointer * 0.06 + uVelocity * 0.07) * uIntensity;
  alpha *= smoothstep(0.0, 0.08, uv.y) * smoothstep(1.0, 0.76, uv.y);

  gl_FragColor = vec4(color, alpha);
}
`;
