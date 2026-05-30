import { useState } from 'react';

export function AudioSensor() {
  const [on, setOn] = useState(false);

  function toggle() {
    setOn(!on);
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = on ? 260 : 520;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  return <button onClick={toggle} className="rounded-xl border-2 border-slate-900 bg-white px-4 py-2 font-black shadow-brutal-sm">Audio {on ? 'ON' : 'OFF'}</button>;
}
