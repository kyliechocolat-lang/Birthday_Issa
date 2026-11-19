import { getAudioContext } from './sfx';

// Cute & chilly lo-fi music-box loop (Fmaj7 -> G6 -> Em7 -> Am9 at ~84 BPM)
const STEP_SECONDS = 0.35; // 8th-note feel
const LOOKAHEAD_MS = 100;
const SCHEDULE_AHEAD_SEC = 0.25;

interface ChordStep {
  bass: number;
  pad: number[];
}

// 4-bar chord progression (each bar = 8 eighth-note steps -> 32 steps total)
const CHORDS: Record<number, ChordStep> = {
  0: { bass: 87.31, pad: [349.23, 440.0, 523.25, 659.25] }, // Fmaj7
  8: { bass: 98.0, pad: [392.0, 493.88, 587.33, 659.25] }, // G6
  16: { bass: 82.41, pad: [329.63, 392.0, 493.88, 587.33] }, // Em7
  24: { bass: 110.0, pad: [440.0, 523.25, 659.25, 783.99] }, // Am7
};

// Gentle music-box melody frequencies (0 = rest) across 32 eighth-note steps
const MELODY: number[] = [
  // Bar 1 (Fmaj7)
  659.25, 0, 523.25, 587.33, 659.25, 0, 880.0, 783.99,
  // Bar 2 (G6)
  659.25, 0, 587.33, 493.88, 587.33, 0, 659.25, 0,
  // Bar 3 (Em7)
  587.33, 0, 493.88, 523.25, 587.33, 0, 783.99, 659.25,
  // Bar 4 (Am7)
  523.25, 0, 659.25, 587.33, 523.25, 0, 440.0, 0,
];

let bgmEnabled = true;
let isRunning = false;
let schedulerId: number | null = null;
let stepIndex = 0;
let nextNoteTime = 0;

let masterGain: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;

function ensureBus(ctx: AudioContext): GainNode {
  if (masterGain && filterNode) return masterGain;

  filterNode = ctx.createBiquadFilter();
  filterNode.type = 'lowpass';
  filterNode.frequency.setValueAtTime(1750, ctx.currentTime);
  filterNode.Q.setValueAtTime(0.7, ctx.currentTime);

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(bgmEnabled ? 0.55 : 0, ctx.currentTime);

  // Subtle cozy echo delay for chilly music-box atmosphere
  const delay = ctx.createDelay(1.0);
  delay.delayTime.setValueAtTime(0.26, ctx.currentTime);
  const feedback = ctx.createGain();
  feedback.gain.setValueAtTime(0.22, ctx.currentTime);
  const wetGain = ctx.createGain();
  wetGain.gain.setValueAtTime(0.25, ctx.currentTime);

  filterNode.connect(masterGain);
  filterNode.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(masterGain);

  masterGain.connect(ctx.destination);
  return masterGain;
}

function playSoftNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  dur: number,
  peakGain: number,
  type: OscillatorType
) {
  if (!filterNode) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

  osc.connect(gain);
  gain.connect(filterNode);

  osc.start(startTime);
  osc.stop(startTime + dur + 0.03);
}

function scheduleStep(ctx: AudioContext, step: number, time: number) {
  // Chord pad + warm sub-bass on bar starts
  const chord = CHORDS[step];
  if (chord) {
    playSoftNote(ctx, chord.bass, time, STEP_SECONDS * 7.2, 0.055, 'triangle');
    chord.pad.forEach((f, idx) => {
      // Gentle arpeggiated strum feel
      playSoftNote(ctx, f, time + idx * 0.03, STEP_SECONDS * 6.8, 0.018, 'sine');
    });
  }

  // Soft lo-fi off-beat shaker/tick on steps 2, 6, 10, 14...
  if (step % 4 === 2) {
    playSoftNote(ctx, 1320, time, 0.04, 0.006, 'sine');
  }

  // Cute music-box melody note
  const melFreq = MELODY[step];
  if (melFreq > 0) {
    playSoftNote(ctx, melFreq, time, STEP_SECONDS * 1.9, 0.036, 'sine');
    playSoftNote(ctx, melFreq * 2, time, STEP_SECONDS * 0.9, 0.008, 'triangle');
  }
}

function tickScheduler() {
  if (!bgmEnabled || !isRunning) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  ensureBus(ctx);
  if (nextNoteTime < ctx.currentTime) {
    nextNoteTime = ctx.currentTime + 0.04;
  }
  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
    scheduleStep(ctx, stepIndex, nextNoteTime);
    nextNoteTime += STEP_SECONDS;
    stepIndex = (stepIndex + 1) % MELODY.length;
  }
}

export function startBgm(): void {
  if (!bgmEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const bus = ensureBus(ctx);
  bus.gain.cancelScheduledValues(ctx.currentTime);
  bus.gain.setTargetAtTime(0.55, ctx.currentTime, 0.08);

  if (isRunning) return;
  isRunning = true;
  nextNoteTime = ctx.currentTime + 0.06;
  schedulerId = window.setInterval(tickScheduler, LOOKAHEAD_MS);
}

export function stopBgm(): void {
  isRunning = false;
  if (schedulerId !== null) {
    window.clearInterval(schedulerId);
    schedulerId = null;
  }
  const ctx = getAudioContext();
  if (ctx && masterGain) {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
  }
}

export function setBgmEnabled(enabled: boolean): void {
  bgmEnabled = enabled;
  if (enabled) {
    startBgm();
  } else {
    stopBgm();
  }
}

export function isBgmEnabled(): boolean {
  return bgmEnabled;
}
