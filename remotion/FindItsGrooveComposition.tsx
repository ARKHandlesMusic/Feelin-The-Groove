'use client';

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  REMOTION_SEQUENCES,
  frameToSeconds,
} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import OmniframeStageCanvas from '@/components/OmniframeStageCanvas';
import VectorOverlay2D from '@/components/VectorOverlay2D';
import {
  AnimeFilters,
  AnimeLightingOverlay,
  AnimeGradePreset,
  getAnimeCanvasFilterStyle,
} from '@/components/AnimeStylePipeline';
import {CameraPresetMode, ShotSpec, getShotAtTime} from '@/lib/timeline';

export interface FindItsGrooveCompositionProps {
  currentTimeRef: React.MutableRefObject<number>;
  audioEnergyRef: React.MutableRefObject<{bass: number; mid: number; high: number}>;
  cameraMode: CameraPresetMode;
  animePreset: AnimeGradePreset;
  lyricStyleOverride: number | 'auto';
  hideLightingOverlay?: boolean;
  currentShot?: ShotSpec;
}

/**
 * Authoritative Remotion + Three.js (<ThreeCanvas />) Composition for
 * "Find Its Groove" (3840x2160 @ 60 FPS, 10,290 frames).
 */
export const FindItsGrooveComposition: React.FC<FindItsGrooveCompositionProps> = ({
  currentTimeRef,
  audioEnergyRef,
  cameraMode,
  animePreset,
  lyricStyleOverride,
  hideLightingOverlay = false,
  currentShot: propShot,
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const timeSeconds = frameToSeconds(frame, fps);
  const activeShot = propShot ?? getShotAtTime(timeSeconds);

  return (
    <AbsoluteFill data-remotion-composition="FindItsGroove4K60">
      {/* Layer 1: SVG Cel-Shading & Posterization Filter Definition (#anime-cel) */}
      <AnimeFilters />

      {/* Layer 2: @remotion/three <ThreeCanvas> 4K 60FPS 3D Stage */}
      <ThreeCanvas width={width} height={height}>
        <OmniframeStageCanvas
          currentTimeRef={currentTimeRef}
          audioEnergyRef={audioEnergyRef}
          cameraMode={cameraMode}
          lyricStyleOverride={lyricStyleOverride}
          animeFilterStyle={getAnimeCanvasFilterStyle(animePreset)}
        />
      </ThreeCanvas>

      {/* Layer 3: Remotion Chapter <Sequence> Orchestration & 2D Cel Vector Storytelling */}
      {REMOTION_SEQUENCES.map((seq) => (
        <Sequence
          key={seq.id}
          from={seq.from}
          durationInFrames={seq.durationInFrames}
          name={`${seq.name} (${seq.threeScenery})`}
          layout="none"
        >
          {!hideLightingOverlay && (
            <AnimeLightingOverlay
              currentTime={timeSeconds}
              currentShot={activeShot}
              animePreset={animePreset}
            />
          )}
          <VectorOverlay2D currentTime={timeSeconds} currentShot={activeShot} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default FindItsGrooveComposition;
