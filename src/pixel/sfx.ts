let sfxEnabled = true;
let audioCtx: AudioContext | null = null;

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
}

export function isSfxEnabled(): boolean {
  return sfxEnabled;
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function playTone(
  freq: number,
  dur = 0.09,
  type: OscillatorType = 'square',
  vol = 0.05,
  delay = 0
): void {
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    g.gain.setValueAtTime(vol, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + dur);
  } catch {
    // Ignore audio context errors when autoplay is blocked
  }
}

export function sfxPop(): void {
  playTone(520, 0.06, 'triangle', 0.08);
  playTone(780, 0.08, 'triangle', 0.07, 0.05);
}

export function sfxSparkle(): void {
  [523, 659, 784, 1046].forEach((f, i) => playTone(f, 0.09, 'triangle', 0.06, i * 0.06));
}

export function sfxOops(): void {
  playTone(300, 0.1, 'sawtooth', 0.04);
  playTone(220, 0.14, 'sawtooth', 0.04, 0.08);
}
