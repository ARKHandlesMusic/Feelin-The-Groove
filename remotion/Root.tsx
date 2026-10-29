'use client';

import React from 'react';
import {Composition} from 'remotion';
import {REMOTION_CONFIG} from '@/lib/remotion-engine';
import {
  FindItsGrooveComposition,
  FindItsGrooveCompositionProps,
} from './FindItsGrooveComposition';

/**
 * Remotion Root registering the 4K 60fps Three.js Music Video Compositions
 */
export const RemotionRoot: React.FC<Partial<FindItsGrooveCompositionProps>> = (props = {}) => {
  const resolvedProps: FindItsGrooveCompositionProps = {
    cameraMode: props.cameraMode ?? 'director',
    animePreset: props.animePreset ?? 'cel90s',
    lyricStyleOverride: props.lyricStyleOverride ?? 'auto',
    hideLightingOverlay: props.hideLightingOverlay ?? false,
    currentShot: props.currentShot,
    currentTimeRef: props.currentTimeRef,
    audioEnergyRef: props.audioEnergyRef,
  };

  return (
    <>
      {/* 1. Master 4K 60FPS Composition (3840 × 2160, 10,290 frames / 171.5s) */}
      <Composition
        id={REMOTION_CONFIG.id}
        component={FindItsGrooveComposition}
        durationInFrames={REMOTION_CONFIG.durationInFrames}
        fps={REMOTION_CONFIG.fps}
        width={REMOTION_CONFIG.width}
        height={REMOTION_CONFIG.height}
        defaultProps={resolvedProps}
      />

      {/* 2. Full 1080p 60FPS Composition for High-Quality Fast Export */}
      <Composition
        id="FindItsGroove1080p60"
        component={FindItsGrooveComposition}
        durationInFrames={REMOTION_CONFIG.durationInFrames}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={resolvedProps}
      />

      {/* 3. Quick 5-Second Test Composition (300 frames) */}
      <Composition
        id="FindItsGrooveQuick"
        component={FindItsGrooveComposition}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={resolvedProps}
      />
    </>
  );
};

export default RemotionRoot;
