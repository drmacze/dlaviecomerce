'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SOURCE_B64 = 'YXR0cmlidXRlIHZlYzIgcDsgdm9pZCBtYWluKCl7IGdsX1Bvc2l0aW9uID0gdmVjNChwLDAuMCwxLjApOyB9';
const FRAGMENT_SOURCE_B64 = 'cHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7CnVuaWZvcm0gdmVjMiByOwp1bmlmb3JtIGZsb2F0IHQ7CmZsb2F0IGgodmVjMiBwKXtyZXR1cm4gZnJhY3Qoc2luKGRvdChwLHZlYzIoMTI3LjEsMzExLjcpKSkqNDM3NTguNTQ1Myk7fQpmbG9hdCBuKHZlYzIgcCl7dmVjMiBpPWZsb29yKHApLGY9ZnJhY3QocCk7Zj1mKmYqKDMuMC0yLjAqZik7cmV0dXJuIG1peChtaXgoaChpKSxoKGkrdmVjMigxLjAsMC4wKSksZi54KSxtaXgoaChpK3ZlYzIoMC4wLDEuMCkpLGgoaSt2ZWMyKDEuMCwxLjApKSxmLngpLGYueSk7fQpmbG9hdCBmYm0odmVjMiBwKXtmbG9hdCB2PTAuMCxhPS41O2ZvcihpbnQgaT0wO2k8NDtpKyspe3YrPWEqbihwKTtwKj0yLjA7YSo9LjU7fXJldHVybiB2O30KZmxvYXQgd2F2ZSh2ZWMyIHV2LGZsb2F0IG8sZmxvYXQgdyl7ZmxvYXQgYz11di54Ki44Mi11di55K28rc2luKHV2LngqNi4wK3QqLjQ1KSouMDM1K3NpbigodXYueCt1di55KSo0LjAtdCouMykqLjAyO3JldHVybiBleHAoLShjKmMpL3cpO30Kdm9pZCBtYWluKCl7CiB2ZWMyIHE9Z2xfRnJhZ0Nvb3JkLnh5L3IueHk7IHZlYzIgYz1xLS41OyBjLngqPXIueC9yLnk7CiBmbG9hdCB2PXNtb290aHN0ZXAoLjkyLC4xNCxsZW5ndGgoYykpOwogZmxvYXQgZj1mYm0oYyozLjArdmVjMih0Ki4wMzUsLXQqLjAyNSkpOwogZmxvYXQgYj0od2F2ZShxLC4yNSwuMDExKSoxLjIrd2F2ZShxLC0uMjIsLjAxOCkqLjc1K3dhdmUocSwuNzQsLjAyOCkqLjQ4KSooMC44K2YqLjQ1KSp2OwogdmVjMyBibGFjaz12ZWMzKC4wMDMsLjAwNCwuMDA3KSwgY3lhbj12ZWMzKC4zMiwuODYsMS4wKSwgcGVhY2g9dmVjMygxLjAsLjc4LC41NiksIHdoaXRlPXZlYzMoMS4wLC45OCwuOTIpOwogdmVjMyBjb2w9bWl4KGJsYWNrLGN5YW4sc21vb3Roc3RlcCguMDYsLjQyLGIpKi41NSk7IGNvbD1taXgoY29sLHBlYWNoLHNtb290aHN0ZXAoLjIyLC43LGIpKi41NSk7IGNvbD1taXgoY29sLHdoaXRlLHNtb290aHN0ZXAoLjU4LDEuMCxiKSk7CiBmbG9hdCBzPTcuMDsgdmVjMiBjZWxsPWZsb29yKGdsX0ZyYWdDb29yZC54eS9zKTsgdmVjMiBsb2NhbD1mcmFjdChnbF9GcmFnQ29vcmQueHkvcyktLjU7IGZsb2F0IGRvdD1zbW9vdGhzdGVwKC40MywuMTgsbGVuZ3RoKGxvY2FsKSk7CiBmbG9hdCBsaXQ9c21vb3Roc3RlcCguMTIraChjZWxsKSouMSwuMzQraChjZWxsKSouMSxiKTsgZmxvYXQgZmxpY2s9LjkrLjEqc2luKHQqMi4wK2goY2VsbCkqNi4yOCk7CiBnbF9GcmFnQ29sb3I9dmVjNChtaXgoYmxhY2ssY29sLGRvdCpsaXQqZmxpY2spLDEuMCk7Cn0=';

function decodeShader(value: string) {
  return window.atob(value);
}

export function AccountFluidMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
      canvas.dataset.fallback = 'true';
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, decodeShader(VERTEX_SOURCE_B64));
    const fragment = compile(gl.FRAGMENT_SHADER, decodeShader(FRAGMENT_SOURCE_B64));
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    const position = gl.getAttribLocation(program, 'p');
    const resolution = gl.getUniformLocation(program, 'r');
    const time = gl.getUniformLocation(program, 't');
    if (!buffer || !resolution || !time) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    let frame = 0;
    const started = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(window.innerWidth * dpr));
      const height = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
    };

    const render = (now: number) => {
      resize();
      gl.uniform1f(time, reduceMotion ? 0 : (now - started) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduceMotion) frame = window.requestAnimationFrame(render);
    };

    render(started);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="account-fluid-matrix" aria-hidden="true" />;
}
