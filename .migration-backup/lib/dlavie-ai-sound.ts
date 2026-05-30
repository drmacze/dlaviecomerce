export type DlavieAiSound = 'click' | 'enter' | 'toggle' | 'success' | 'soft';

let audioCtx: AudioContext | null = null;

const toneMap: Record<DlavieAiSound, [number, number, number, number]> = {
  click: [520, 820, 0.045, 0.028],
  enter: [330, 990, 0.12, 0.045],
  toggle: [420, 640, 0.07, 0.035],
  success: [620, 1240, 0.1, 0.04],
  soft: [260, 520, 0.05, 0.02],
};

export function playDlavieAiSound(name: DlavieAiSound = 'click') {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    audioCtx = audioCtx || new AudioCtor();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => undefined);

    const [baseFreq, accentFreq, duration, volume] = toneMap[name];
    const now = audioCtx.currentTime;
    const gain = audioCtx.createGain();
    const primary = audioCtx.createOscillator();
    const accent = audioCtx.createOscillator();

    primary.type = 'sine';
    accent.type = 'triangle';
    primary.frequency.setValueAtTime(baseFreq, now);
    accent.frequency.setValueAtTime(accentFreq, now + 0.012);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    primary.connect(gain);
    accent.connect(gain);
    gain.connect(audioCtx.destination);

    primary.start(now);
    accent.start(now + 0.01);
    primary.stop(now + duration);
    accent.stop(now + duration + 0.015);
  } catch {
    // Sound is progressive enhancement only.
  }
}
