import {CHAPTERS, SHOTS, SONG_METADATA, SectionId, ShotSpec} from './timeline';

export interface VideoConfig {
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export const REMOTION_CONFIG: VideoConfig = {
  id: 'FindItsGroove4K60',
  width: 3840,
  height: 2160,
  fps: 60,
  durationInFrames: Math.round(SONG_METADATA.duration * 60), // 10,290 frames
};

export interface RemotionSequenceSpec {
  id: string;
  section: SectionId;
  name: string;
  from: number;
  durationInFrames: number;
  startTime: number;
  endTime: number;
  color: string;
  threeScenery: string;
}

export interface RemotionShotSequenceSpec {
  id: string;
  shotIndex: number;
  name: string;
  section: SectionId;
  from: number;
  durationInFrames: number;
  shot: ShotSpec;
  lyricStyleId: number;
}

/**
 * Converts a frame index n at fps F to exact seconds: t = n / F
 */
export function frameToSeconds(frame: number, fps: number = REMOTION_CONFIG.fps): number {
  const safeFps = fps > 0 ? fps : 60;
  return Math.max(0, frame) / safeFps;
}

/**
 * Converts seconds to deterministic frame index at fps F
 */
export function secondsToFrame(seconds: number, fps: number = REMOTION_CONFIG.fps): number {
  const safeFps = fps > 0 ? fps : 60;
  return Math.max(0, Math.min(REMOTION_CONFIG.durationInFrames - 1, Math.round(seconds * safeFps)));
}

export interface InterpolateOptions {
  extrapolateLeft?: 'clamp' | 'extend' | 'identity';
  extrapolateRight?: 'clamp' | 'extend' | 'identity';
  easing?: (t: number) => number;
}

export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t * t * (3 - 2 * t),
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => t * (2 - t),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/**
 * Remotion-compatible deterministic interpolate(input, inputRange, outputRange, options)
 */
export function interpolate(
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  options?: InterpolateOptions
): number {
  if (inputRange.length < 2 || inputRange.length !== outputRange.length) {
    throw new Error('inputRange and outputRange must have the same length >= 2');
  }

  const extrapolateLeft = options?.extrapolateLeft ?? 'extend';
  const extrapolateRight = options?.extrapolateRight ?? 'extend';
  const easing = options?.easing ?? Easing.linear;

  if (input <= inputRange[0]) {
    if (extrapolateLeft === 'clamp') return outputRange[0];
    if (extrapolateLeft === 'identity') return input;
  }

  const lastIdx = inputRange.length - 1;
  if (input >= inputRange[lastIdx]) {
    if (extrapolateRight === 'clamp') return outputRange[lastIdx];
    if (extrapolateRight === 'identity') return input;
  }

  // Find segment
  let seg = 0;
  for (let i = 0; i < lastIdx; i++) {
    if (input >= inputRange[i] && input <= inputRange[i + 1]) {
      seg = i;
      break;
    }
    if (input > inputRange[i + 1]) {
      seg = i;
    }
  }

  const inMin = inputRange[seg];
  const inMax = inputRange[seg + 1];
  const outMin = outputRange[seg];
  const outMax = outputRange[seg + 1];

  const span = inMax - inMin;
  if (Math.abs(span) < 1e-9) return outMax;

  let rawT = (input - inMin) / span;
  if (extrapolateLeft === 'clamp') rawT = Math.max(0, rawT);
  if (extrapolateRight === 'clamp') rawT = Math.min(1, rawT);

  const easedT = rawT >= 0 && rawT <= 1 ? easing(rawT) : rawT;
  return outMin + easedT * (outMax - outMin);
}

export interface SpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
}

export interface SpringProps {
  frame: number;
  fps: number;
  from?: number;
  to?: number;
  durationInFrames?: number;
  delay?: number;
  config?: SpringConfig;
}

/**
 * Remotion-compatible analytical damped harmonic oscillator spring() evaluation.
 * Pure function of (frame, fps) — 100% deterministic at any arbitrary frame.
 */
export function spring({
  frame,
  fps,
  from = 0,
  to = 1,
  durationInFrames,
  delay = 0,
  config,
}: SpringProps): number {
  const localFrame = frame - delay;
  if (localFrame <= 0) return from;

  if (durationInFrames && durationInFrames > 0 && localFrame >= durationInFrames) {
    return to;
  }

  const c = config?.damping ?? 10;
  const m = config?.mass ?? 1;
  const k = config?.stiffness ?? 100;
  const overshootClamping = config?.overshootClamping ?? false;

  const t = localFrame / Math.max(1, fps);
  const omega0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));

  let progress = 1;
  if (zeta < 1) {
    // Underdamped
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega0 * t);
    progress =
      1 -
      envelope *
        (Math.cos(omegaD * t) + ((zeta * omega0) / omegaD) * Math.sin(omegaD * t));
  } else if (Math.abs(zeta - 1) < 1e-5) {
    // Critically damped
    progress = 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
  } else {
    // Overdamped
    const s1 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
    const s2 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
    progress = 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
  }

  if (overshootClamping) {
    progress = Math.max(0, Math.min(1, progress));
  }

  return from + progress * (to - from);
}

const SCENERY_BY_SECTION: Record<SectionId, string> = {
  intro: 'Empty Beat-Grid Stage (Single Tile Ignition)',
  verse1: 'Pop-Up 3D City Boulevard & Footpaths',
  prechorus1: 'Metronome & Connect-The-Dots Path',
  chorus1: '3-Tier Chorus Tiles & Lyric Billboards',
  break1: '12-Bar Step-Sequencer & Ribbon Arch',
  verse2: 'Suno AI Audio Workshop & Sliders',
  prechorus2: 'Color Wheel Stage & Rising Sun Ring',
  chorus2: 'Full Stage Chorus & Vinyl Wipe',
  break2: 'Mirror Dance & 4-Row Tile Wave',
  bridge: 'Pale Lavender First-Draft Atrium',
  finalchorus: 'Golden Noon Sun & 360° Turntable Stage',
  outro: 'Cream Horizon & Official End Credits Slate',
};

/**
 * All 12 Chapter <Sequence> definitions across the 10,290-frame composition
 */
export const REMOTION_SEQUENCES: RemotionSequenceSpec[] = CHAPTERS.map((chap, idx) => {
  const nextChap = CHAPTERS[idx + 1];
  const endTime = nextChap ? nextChap.startTime : SONG_METADATA.duration;
  const from = Math.round(chap.startTime * REMOTION_CONFIG.fps);
  const endFrame = nextChap
    ? Math.round(nextChap.startTime * REMOTION_CONFIG.fps)
    : REMOTION_CONFIG.durationInFrames;

  return {
    id: `seq_${String(idx + 1).padStart(2, '0')}_${chap.id}`,
    section: chap.id,
    name: `${String(idx + 1).padStart(2, '0')}. ${chap.label}`,
    from,
    durationInFrames: Math.max(1, endFrame - from),
    startTime: chap.startTime,
    endTime,
    color: chap.color,
    threeScenery: SCENERY_BY_SECTION[chap.id],
  };
});

/**
 * All 46 Shot <Sequence> definitions across the 10,290-frame composition
 */
export const SHOT_SEQUENCES: RemotionShotSequenceSpec[] = SHOTS.map((shot, idx) => {
  const nextShot = SHOTS[idx + 1];
  const from = Math.round(shot.startTime * REMOTION_CONFIG.fps);
  const endFrame = nextShot
    ? Math.round(nextShot.startTime * REMOTION_CONFIG.fps)
    : REMOTION_CONFIG.durationInFrames;

  return {
    id: `shot_seq_${String(idx + 1).padStart(2, '0')}`,
    shotIndex: idx,
    name: shot.title,
    section: shot.section,
    from,
    durationInFrames: Math.max(1, endFrame - from),
    shot,
    lyricStyleId: (idx % 50) + 1,
  };
});

/**
 * Returns the active Chapter <Sequence> at a given frame
 */
export function getSequenceAtFrame(frame: number): RemotionSequenceSpec {
  const clamped = Math.max(0, Math.min(REMOTION_CONFIG.durationInFrames - 1, Math.floor(frame)));
  for (let i = REMOTION_SEQUENCES.length - 1; i >= 0; i--) {
    const seq = REMOTION_SEQUENCES[i];
    if (clamped >= seq.from) {
      return seq;
    }
  }
  return REMOTION_SEQUENCES[0];
}

/**
 * Returns the active Shot <Sequence> at a given frame
 */
export function getShotSequenceAtFrame(frame: number): RemotionShotSequenceSpec {
  const clamped = Math.max(0, Math.min(REMOTION_CONFIG.durationInFrames - 1, Math.floor(frame)));
  for (let i = SHOT_SEQUENCES.length - 1; i >= 0; i--) {
    const seq = SHOT_SEQUENCES[i];
    if (clamped >= seq.from) {
      return seq;
    }
  }
  return SHOT_SEQUENCES[0];
}

/**
 * Evaluates the complete deterministic Remotion + Three.js frame state for frame n
 */
export function evaluateRemotionFrameState(frame: number) {
  const clampedFrame = Math.max(
    0,
    Math.min(REMOTION_CONFIG.durationInFrames - 1, Math.floor(frame))
  );
  const timeSeconds = frameToSeconds(clampedFrame, REMOTION_CONFIG.fps);
  const chapterSequence = getSequenceAtFrame(clampedFrame);
  const shotSequence = getShotSequenceAtFrame(clampedFrame);

  const localChapterFrame = clampedFrame - chapterSequence.from;
  const localShotFrame = clampedFrame - shotSequence.from;

  const shotEnterSpring = spring({
    frame: localShotFrame,
    fps: REMOTION_CONFIG.fps,
    from: 0,
    to: 1,
    config: {damping: 14, stiffness: 120, mass: 0.9},
  });

  const shotProgress = interpolate(
    localShotFrame,
    [0, Math.max(1, shotSequence.durationInFrames - 1)],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  return {
    frame: clampedFrame,
    fps: REMOTION_CONFIG.fps,
    timeSeconds,
    chapterSequence,
    shotSequence,
    localChapterFrame,
    localShotFrame,
    shotEnterSpring,
    shotProgress,
  };
}
