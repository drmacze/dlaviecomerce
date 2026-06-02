import { noiseGLSL } from "./noise.glsl";

export const dlavieFieldFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
uniform float uDirection;
uniform float uZoom;
uniform float uSection;
uniform float uScene;
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
  float time = uTime * 2.05;
  float phase = clamp(uScene, 0.0, 1.0);
  float pulse = smoothstep(0.02, 0.75, uVelocity);

  float zoomBend = 1.0 + uZoom * 0.62 + pulse * 0.12;
  vec2 scrollDrift = vec2(uScroll * (0.82 + phase * 0.44) * uDirection, -uScroll * (0.58 + pulse * 0.28));
  vec2 orbit = vec2(sin(time * 0.17 + phase * 2.4), cos(time * 0.14 - phase * 1.8)) * (0.16 + pulse * 0.09);
  vec2 crossWind = vec2(sin(time * 0.055 + centered.y * 2.6), cos(time * 0.063 + centered.x * 2.1)) * (0.07 + phase * 0.05);
  vec2 warp = centered * (1.32 + zoomBend) + scrollDrift + mouse * (0.18 + pulse * 0.1) + orbit + crossWind;

  float cloudA = fbm(warp + vec2(time * 0.092, -time * 0.068));
  float cloudB = fbm(centered * (2.18 + uZoom * 1.7 + phase * 0.55) - vec2(time * 0.064 + uScroll * 0.86, time * 0.062 - orbit.x));
  float cloudC = fbm(centered * (0.92 + phase * 0.18) + vec2(-time * 0.052 + orbit.y, uScroll * 0.52 + time * 0.04));
  float cloudD = fbm(centered * (4.1 + pulse * 1.2) + vec2(time * 0.052 + uScroll * 0.28, -time * 0.088));
  float cloudE = fbm((centered + mouse * 0.08) * 6.2 + vec2(-time * 0.035, time * 0.044 + uScroll));

  float pointer = 1.0 - smoothstep(0.0, 0.76, distance(centered, mouse));
  float whiteBloom = 1.0 - smoothstep(0.0, 0.8 + uZoom * 0.3, length(centered - vec2(0.10 + orbit.x * 0.42, -0.04 + orbit.y * 0.28)));
  float bluePool = 1.0 - smoothstep(0.0, 0.98, length(centered - vec2(-0.38 + orbit.x, 0.30 + orbit.y)));
  float violetPool = 1.0 - smoothstep(0.0, 0.95, length(centered - vec2(0.44 - orbit.y, 0.22 + orbit.x)));
  float deepPool = 1.0 - smoothstep(0.12, 1.18, length(centered - vec2(-0.46 + crossWind.x, -0.48 + crossWind.y)));
  float scan = sin((uv.y + uScroll * 1.35 + phase * 0.28) * 42.0 + time * 1.35) * 0.5 + 0.5;
  float wave = sin((uv.x * 2.0 + uv.y * 1.4 + time * 0.33 + uScroll * 1.7) * (4.0 + phase * 1.4)) * 0.5 + 0.5;

  vec3 whiteMist = vec3(0.96, 0.98, 1.0);
  vec3 skyBlue = vec3(0.40, 0.56, 1.0);
  vec3 lavender = vec3(0.74, 0.68, 1.0);
  vec3 softViolet = vec3(0.46, 0.38, 1.0);
  vec3 midnight = vec3(0.015, 0.04, 0.16);

  float vapor = smoothstep(0.12, 0.9, cloudA * 0.46 + cloudB * 0.32 + cloudC * 0.28 + cloudD * 0.14 + cloudE * 0.08);
  vec3 color = mix(whiteMist, skyBlue, bluePool * 0.62 + vapor * 0.42);
  color = mix(color, lavender, violetPool * (0.64 + phase * 0.18) + cloudB * 0.2);
  color = mix(color, softViolet, smoothstep(0.42, 1.0, violetPool + uScroll * 0.42 + wave * 0.16) * (0.24 + phase * 0.1));
  color = mix(color, midnight, deepPool * (0.12 + uScroll * 0.24));
  color += whiteBloom * vec3(0.16, 0.18, 0.23) * (0.8 + pulse * 0.36);
  color += pointer * vec3(0.06, 0.075, 0.105) * (0.28 + uVelocity * 0.48);
  color += scan * uVelocity * 0.052;
  color += wave * (0.018 + phase * 0.016);

  float videoScene = smoothstep(0.42, 0.56, uScroll) * (1.0 - smoothstep(0.64, 0.72, uScroll));
  float osScene = smoothstep(0.62, 0.72, uScroll) * (1.0 - smoothstep(0.78, 0.88, uScroll));
  float commerceScene = smoothstep(0.78, 0.88, uScroll);
  float rail = smoothstep(0.88, 1.0, sin((uv.y * 18.0 + uScroll * 18.0 + time) * 3.14159) * 0.5 + 0.5);
  float signal = smoothstep(0.72, 1.0, sin((atan(centered.y, centered.x) * 8.0 + length(centered) * 18.0 - time * 0.8)) * 0.5 + 0.5);
  vec3 portalTone = mix(vec3(0.018, 0.022, 0.05), vec3(0.18, 0.22, 0.42), cloudD + whiteBloom * 0.45);
  vec3 osTone = vec3(0.035, 0.045, 0.058) + vec3(0.02, 0.42, 0.55) * signal * 0.42 + vec3(0.34, 0.16, 0.72) * cloudE * 0.2;
  vec3 commerceTone = vec3(0.035, 0.006, 0.055) + vec3(0.52, 0.06, 0.82) * (cloudB * 0.38 + violetPool * 0.2) + vec3(0.0, 0.76, 0.92) * rail * 0.13;
  color = mix(color, portalTone, videoScene * 0.72);
  color = mix(color, osTone, osScene * 0.84);
  color = mix(color, commerceTone, commerceScene * 0.9);
  color = mix(color, vec3(0.92, 0.96, 1.0), smoothstep(0.7, 1.0, 1.0 - length(centered)) * 0.06 * clamp(1.0 - osScene - commerceScene * 0.7, 0.0, 1.0));

  float alpha = (0.82 + vapor * 0.24 + pointer * 0.08 + uVelocity * 0.09 + osScene * 0.12 + commerceScene * 0.16) * uIntensity;
  alpha *= smoothstep(0.0, 0.08, uv.y) * smoothstep(1.0, 0.76, uv.y);

  gl_FragColor = vec4(color, alpha);
}
`;
