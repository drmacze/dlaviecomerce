'use client';

import { useEffect, useRef, useState } from 'react';

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_motion;
varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float curtain(vec2 uv, float x, float width, float speed, float phase) {
  float wave = sin((uv.y * 5.2) + (u_time * speed) + phase) * 0.035;
  float center = x + wave + sin(u_time * 0.13 + phase) * 0.04;
  return smoothstep(width, 0.0, abs(uv.x - center));
}

void main() {
  vec2 uv = v_uv;
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float t = u_time * u_motion;
  float mesh = noise(uv * 3.2 + vec2(t * 0.035, -t * 0.025));
  mesh += noise(uv * 8.0 + vec2(-t * 0.05, t * 0.04)) * 0.45;

  float c1 = curtain(uv, 0.22, 0.28, 0.26, 0.0);
  float c2 = curtain(uv, 0.52, 0.22, -0.18, 2.1);
  float c3 = curtain(uv, 0.78, 0.20, 0.22, 4.0);
  float light = c1 * 0.85 + c2 * 0.75 + c3 * 0.55;

  float vignette = smoothstep(1.05, 0.12, length(centered));
  float horizon = smoothstep(0.12, 0.92, uv.y) * smoothstep(1.04, 0.18, uv.y);
  float halo = pow(max(0.0, 1.0 - length(centered * vec2(0.8, 1.25))), 3.0);

  vec2 pixel = floor(uv * vec2(120.0, 76.0));
  float led = step(0.76, hash(pixel)) * 0.06;
  float scan = sin((uv.y * 900.0) + t * 0.8) * 0.012;

  vec3 graphite = vec3(0.005, 0.008, 0.016);
  vec3 indigo = vec3(0.035, 0.055, 0.19);
  vec3 cobalt = vec3(0.02, 0.16, 0.78);
  vec3 cyan = vec3(0.07, 0.78, 1.0);
  vec3 violet = vec3(0.34, 0.22, 0.82);
  vec3 peach = vec3(1.0, 0.73, 0.56);

  vec3 color = graphite;
  color = mix(color, indigo, horizon * 0.65 + mesh * 0.18);
  color += cobalt * light * (0.34 + mesh * 0.2);
  color += cyan * pow(light, 2.2) * 0.24;
  color += violet * c2 * 0.12;
  color += peach * pow(curtain(uv, 0.64, 0.11, 0.14, 1.4), 3.0) * 0.08;
  color += cyan * halo * 0.08;
  color += vec3(0.25, 0.75, 1.0) * led * vignette;
  color += scan;
  color *= vignette;

  gl_FragColor = vec4(color, 0.96);
}
`;

type WebGlResources = {
  program: WebGLProgram;
  buffer: WebGLBuffer;
  positionLocation: number;
  resolutionLocation: WebGLUniformLocation;
  timeLocation: WebGLUniformLocation;
  motionLocation: WebGLUniformLocation;
};

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createResources(gl: WebGLRenderingContext): WebGlResources | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    return null;
  }

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const motionLocation = gl.getUniformLocation(program, 'u_motion');
  if (!resolutionLocation || !timeLocation || !motionLocation) {
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    return null;
  }

  return {
    program,
    buffer,
    positionLocation: gl.getAttribLocation(program, 'a_position'),
    resolutionLocation,
    timeLocation,
    motionLocation,
  };
}

export function AiShaderBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
      stencil: false,
    });

    if (!gl) {
      setFallback(true);
      return undefined;
    }

    const resources = createResources(gl);
    if (!resources || resources.positionLocation < 0) {
      setFallback(true);
      return undefined;
    }

    gl.useProgram(resources.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(resources.positionLocation);
    gl.vertexAttribPointer(resources.positionLocation, 2, gl.FLOAT, false, 0, 0);

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let width = 1;
    let height = 1;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = Math.max(1, Math.floor(window.innerWidth * dpr));
      height = Math.max(1, Math.floor(window.innerHeight * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const render = (now: number) => {
      gl.useProgram(resources.program);
      gl.uniform2f(resources.resolutionLocation, width, height);
      gl.uniform1f(resources.timeLocation, now * 0.001);
      gl.uniform1f(resources.motionLocation, reducedMotionQuery.matches ? 0.12 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (running && !reducedMotionQuery.matches) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    resize();
    render(0);
    if (!reducedMotionQuery.matches) animationFrame = window.requestAnimationFrame(render);
    window.addEventListener('resize', resize, { passive: true });

    const onMotionChange = () => {
      window.cancelAnimationFrame(animationFrame);
      render(performance.now());
      if (!reducedMotionQuery.matches) animationFrame = window.requestAnimationFrame(render);
    };
    reducedMotionQuery.addEventListener('change', onMotionChange);

    return () => {
      running = false;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      reducedMotionQuery.removeEventListener('change', onMotionChange);
      gl.deleteBuffer(resources.buffer);
      gl.deleteProgram(resources.program);
    };
  }, []);

  return (
    <div className="ai-shader-backdrop" aria-hidden="true" data-fallback={fallback ? 'true' : 'false'}>
      <canvas ref={canvasRef} />
      <span className="ai-shader-backdrop__glow ai-shader-backdrop__glow--one" />
      <span className="ai-shader-backdrop__glow ai-shader-backdrop__glow--two" />
    </div>
  );
}
