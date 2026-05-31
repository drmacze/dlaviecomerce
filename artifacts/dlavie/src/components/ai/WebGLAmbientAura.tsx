import { useEffect, useRef } from "react";

const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main(){
  vUv = position * .5 + .5;
  gl_Position = vec4(position,0.0,1.0);
}`;

const fragment = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uPointer;
void main(){
  vec2 uv = vUv;
  vec2 p = uv - .5;
  float a = atan(p.y,p.x) + uTime * .08;
  float r = length(p);
  float mesh = sin((uv.x + cos(a)*.18) * 8.0 + uTime) + cos((uv.y + sin(a)*.16) * 9.0 - uTime*.7);
  float touch = .26 / max(distance(uv, uPointer), .08);
  vec3 indigo = vec3(.19,.14,.72);
  vec3 violet = vec3(.55,.18,.9);
  vec3 gold = vec3(.95,.68,.18);
  vec3 color = mix(indigo, violet, smoothstep(-1.2,1.2,mesh));
  color = mix(color, gold, smoothstep(.33,.02,r) * .28 + touch * .05);
  float alpha = smoothstep(.82,.05,r) * .72;
  gl_FragColor = vec4(color, alpha);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export function WebGLAmbientAura() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: true, alpha: true });
    if (!canvas || !gl) return;
    const program = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, vertex);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
    if (!program || !vs || !fs) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const time = gl.getUniformLocation(program, "uTime");
    const pointer = gl.getUniformLocation(program, "uPointer");
    const pointerValue = { x: 0.72, y: 0.28 };
    const onPointer = (event: PointerEvent) => {
      pointerValue.x = event.clientX / window.innerWidth;
      pointerValue.y = 1 - event.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let frame = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);
    const start = performance.now();
    const draw = () => {
      gl.uniform1f(time, (performance.now() - start) / 1000);
      gl.uniform2f(pointer, pointerValue.x, pointerValue.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return <canvas ref={ref} className="dlv-ai-webgl" aria-hidden="true" />;
}
