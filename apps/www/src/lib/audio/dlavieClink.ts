type BrowserWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

type UnlockEventName = 'pointerdown' | 'touchstart' | 'mousedown' | 'keydown';

const UNLOCK_EVENTS: UnlockEventName[] = ['pointerdown', 'touchstart', 'mousedown', 'keydown'];
const MASTER_GAIN = 0.11;
const PLAY_DEBOUNCE_MS = 250;

let audioContext: AudioContext | null = null;
let unlocked = false;
let listenersAttached = false;
let lastPlayedAt = 0;

function getAudioContext() {
  if (audioContext || typeof window === 'undefined') return audioContext;

  const AudioContextCtor = window.AudioContext ?? (window as BrowserWindow).webkitAudioContext;
  if (!AudioContextCtor) return null;

  try {
    audioContext = new AudioContextCtor();
  } catch {
    audioContext = null;
  }

  return audioContext;
}

function removeUnlockListeners() {
  if (typeof window === 'undefined' || !listenersAttached) return;

  UNLOCK_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, unlockAudio);
  });

  listenersAttached = false;
}

function markAudioUnlocked(context: AudioContext) {
  unlocked = context.state === 'running';
  if (unlocked) removeUnlockListeners();
}

function unlockAudio() {
  const context = getAudioContext();
  if (!context) {
    removeUnlockListeners();
    return;
  }

  if (context.state === 'running') {
    markAudioUnlocked(context);
    return;
  }

  context.resume().then(() => markAudioUnlocked(context)).catch(() => undefined);
}

async function unlockAudioFromGesture() {
  const context = getAudioContext();
  if (!context) return null;

  if (context.state !== 'running') {
    try {
      await context.resume();
    } catch {
      return null;
    }
  }

  markAudioUnlocked(context);
  return unlocked ? context : null;
}

function connectFilteredGain(
  context: AudioContext,
  destination: AudioNode,
  type: BiquadFilterType,
  frequency: number,
  q: number
) {
  const filter = context.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  filter.connect(destination);
  return filter;
}

function playNoiseTransient(context: AudioContext, destination: AudioNode, startAt: number) {
  const bufferSize = Math.max(1, Math.floor(context.sampleRate * 0.045));
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let index = 0; index < bufferSize; index += 1) {
    const envelope = 1 - index / bufferSize;
    samples[index] = (Math.random() * 2 - 1) * envelope;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.018, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.08);

  const attackFilter = connectFilteredGain(context, gain, 'bandpass', 5200, 7);
  source.connect(attackFilter);
  gain.connect(destination);
  source.onended = () => {
    source.disconnect();
    attackFilter.disconnect();
    gain.disconnect();
  };
  source.start(startAt);
  source.stop(startAt + 0.09);
}

export function setupDlavieClink() {
  if (typeof window === 'undefined') return () => undefined;

  if (!listenersAttached && !unlocked) {
    UNLOCK_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, unlockAudio, { once: true, passive: true });
    });
    listenersAttached = true;
  }

  return removeUnlockListeners;
}

export function isDlavieClinkReady() {
  return unlocked && audioContext?.state === 'running';
}

export function playDlavieClink() {
  const context = getAudioContext();
  if (!context || !isDlavieClinkReady()) return;

  const nowMs = performance.now();
  if (nowMs - lastPlayedAt < PLAY_DEBOUNCE_MS) return;
  lastPlayedAt = nowMs;

  try {
    const startAt = context.currentTime + 0.004;
    const duration = 0.52;
    const master = context.createGain();
    master.gain.setValueAtTime(MASTER_GAIN, startAt);
    master.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    const highpass = connectFilteredGain(context, context.destination, 'highpass', 620, 0.72);
    const presence = connectFilteredGain(context, highpass, 'bandpass', 2450, 0.95);
    master.connect(presence);

    const partials = [
      { frequency: 880, gain: 0.3, type: 'sine' as OscillatorType, decay: 0.48 },
      { frequency: 1320, gain: 0.22, type: 'triangle' as OscillatorType, decay: 0.42 },
      { frequency: 1760, gain: 0.18, type: 'sine' as OscillatorType, decay: 0.34 },
      { frequency: 2640, gain: 0.11, type: 'triangle' as OscillatorType, decay: 0.28 },
    ];

    partials.forEach((partial, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startOffset = index * 0.006;
      const partialStart = startAt + startOffset;

      oscillator.type = partial.type;
      oscillator.frequency.setValueAtTime(partial.frequency, partialStart);
      oscillator.detune.setValueAtTime(index % 2 === 0 ? 3 : -4, partialStart);

      gain.gain.setValueAtTime(0.0001, partialStart);
      gain.gain.exponentialRampToValueAtTime(partial.gain, partialStart + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, partialStart + partial.decay);

      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(partialStart);
      oscillator.stop(startAt + duration + 0.04);
    });

    playNoiseTransient(context, master, startAt);

    window.setTimeout(() => {
      master.disconnect();
      highpass.disconnect();
      presence.disconnect();
    }, (duration + 0.12) * 1000);
  } catch {
    // Browser audio failures are intentionally silent.
  }
}

export function playDlavieClinkFromGesture() {
  void unlockAudioFromGesture().then((context) => {
    if (!context) return;
    playDlavieClink();
  });
}
