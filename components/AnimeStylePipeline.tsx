'use client';

import React from 'react';
import {ShotSpec, getBeatMetrics} from '@/lib/timeline';

/**
 * 1. The Hand-Drawn "Outline" & Cel-Shading Posterization SVG Filter
 * Implements discrete RGB step posterization (`#anime-cel`) so gradients
 * separate into crisp anime cel-shading bands.
 */
export const AnimeFilters: React.FC = () => {
  return (
    <svg
      aria-hidden="true"
      style={{position: 'absolute', width: 0, height: 0, pointerEvents: 'none'}}
    >
      <defs>
        {/* Cel-shading / Posterization filter from specification */}
        <filter id="anime-cel" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
            <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
            <feFuncB type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
};

export type AnimeGradePreset = 'cel90s' | 'shinkai_bloom' | 'cyber_trigger' | 'clean_studio';

interface AnimeLightingOverlayProps {
  currentTime: number;
  currentShot: ShotSpec;
  animePreset: AnimeGradePreset;
}

/**
 * 2 & 3. Dramatic Anime Lighting Effects (God Rays, Bloom Highlights, Speed Lines & Shot Transitions)
 * Combines screen-blended volumetric god rays, anime radial speed lines on chorus cuts,
 * and floating cel-animated light motes.
 */
export const AnimeLightingOverlay: React.FC<AnimeLightingOverlayProps> = ({
  currentTime,
  currentShot,
  animePreset,
}) => {
  if (animePreset === 'clean_studio') return null;

  const metrics = getBeatMetrics(currentTime);
  const shotElapsed = Math.max(0, currentTime - currentShot.startTime);
  const shotRemaining = Math.max(0, currentShot.endTime - currentTime);

  // Detect shot transition window (first 0.24s or last 0.16s of a shot) for cinematic anime transitions
  const isTransitionIn = shotElapsed < 0.24 && currentTime > 0.3;
  const isTransitionOut = shotRemaining < 0.16 && currentShot.section !== 'outro';
  const transitionIntensity = isTransitionIn
    ? 1 - shotElapsed / 0.24
    : isTransitionOut
      ? 1 - shotRemaining / 0.16
      : 0;

  const isHighEnergySection =
    currentShot.section === 'chorus1' ||
    currentShot.section === 'chorus2' ||
    currentShot.section === 'finalchorus' ||
    currentShot.section === 'break1' ||
    currentShot.section === 'break2';

  const godRayAngle = -24 + Math.sin(currentTime * 0.45) * 4;
  const bloomPulse = 0.26 + metrics.sparkBounce * 0.14;

  return (
    <div
      data-testid="anime-lighting-overlay"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {/* Layer A: Anime Volumetric God Rays & Diagonal Sunbeams (mix-blend-mode: screen) */}
      <div
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          opacity: animePreset === 'shinkai_bloom' ? 0.46 : 0.32,
          background: `
            repeating-linear-gradient(
              ${godRayAngle}deg,
              rgba(255, 244, 224, 0.0) 0%,
              rgba(255, 244, 224, 0.0) 8%,
              rgba(255, 178, 62, 0.14) 11%,
              rgba(255, 244, 224, 0.24) 13%,
              rgba(46, 196, 182, 0.10) 16%,
              rgba(255, 244, 224, 0.0) 22%
            )
          `,
        }}
      />

      {/* Layer B: Dramatic Anime Highlight Bloom & Warm 90s Cel Light Leak */}
      <div
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          opacity: bloomPulse,
          background: `
            radial-gradient(circle at 22% 18%, rgba(255, 178, 62, 0.42) 0%, rgba(255, 178, 62, 0.0) 48%),
            radial-gradient(circle at 78% 22%, rgba(46, 196, 182, 0.38) 0%, rgba(46, 196, 182, 0.0) 46%),
            radial-gradient(circle at 50% 62%, rgba(232, 63, 140, 0.24) 0%, rgba(232, 63, 140, 0.0) 55%)
          `,
        }}
      />

      {/* Layer C: Anime Speed-Lines & Action Impact Frame on Chorus Cuts & Transitions */}
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Subtle 90s Cel-Anime Film Vignette & Ink Frame */}
        <rect
          x="10"
          y="10"
          width="1900"
          height="1060"
          rx="18"
          fill="none"
          stroke="#FFF4E0"
          strokeOpacity="0.14"
          strokeWidth="2"
        />

        {/* Anime Radial Speed Lines during Choruses, Dance Breaks, or Shot Transitions */}
        {(isHighEnergySection || transitionIntensity > 0.15) && (
          <g
            opacity={
              isHighEnergySection
                ? 0.22 + metrics.snapProgress * 0.25 + transitionIntensity * 0.35
                : transitionIntensity * 0.45
            }
          >
            {Array.from({length: 36}).map((_, i) => {
              const angle = (i / 36) * Math.PI * 2 + (Math.floor(currentTime * 12) % 3) * 0.04;
              const innerR = 640 - (i % 4) * 55 - transitionIntensity * 140;
              const outerR = 1180;
              const x1 = 960 + Math.cos(angle) * innerR;
              const y1 = 540 + Math.sin(angle) * innerR;
              const x2 = 960 + Math.cos(angle) * outerR;
              const y2 = 540 + Math.sin(angle) * outerR;
              const strokeHex =
                i % 3 === 0 ? '#FFF4E0' : i % 3 === 1 ? '#FFB23E' : '#2EC4B6';
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeHex}
                  strokeWidth={i % 2 === 0 ? 3.5 : 1.8}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        )}

        {/* Cinematic Anime Whip-Slash / Diagonal Transition Wipe on Shot Boundaries */}
        {transitionIntensity > 0.05 && (
          <g opacity={transitionIntensity * 0.65}>
            <polygon
              points={`${-400 + transitionIntensity * 2200},0 ${-120 + transitionIntensity * 2200},0 ${-520 + transitionIntensity * 2200},1080 ${-800 + transitionIntensity * 2200},1080`}
              fill={currentShot.accentHex}
            />
            <polygon
              points={`${-80 + transitionIntensity * 2200},0 ${20 + transitionIntensity * 2200},0 ${-380 + transitionIntensity * 2200},1080 ${-480 + transitionIntensity * 2200},1080`}
              fill="#FFF4E0"
            />
          </g>
        )}

        {/* Floating Anime Sparkle / Sakura Light Motes */}
        {Array.from({length: 14}).map((_, idx) => {
          const mx = ((idx * 173 + currentTime * (28 + (idx % 4) * 9)) % 1840) + 40;
          const my =
            980 - ((idx * 137 + currentTime * (36 + (idx % 3) * 12)) % 900);
          const mScale = 0.55 + Math.sin(currentTime * 5 + idx) * 0.35;
          const mColor =
            idx % 3 === 0 ? '#FFF4E0' : idx % 3 === 1 ? '#FFB23E' : '#2EC4B6';
          return (
            <g
              key={idx}
              transform={`translate(${mx}, ${my}) scale(${Math.max(0.2, mScale)})`}
              opacity="0.65"
            >
              <path
                d="M 0 -10 Q 2 -2 10 0 Q 2 2 0 10 Q -2 2 -10 0 Q -2 -2 0 -10 Z"
                fill={mColor}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * Returns the GPU-accelerated CSS color-grading filter string for the WebGL canvas.
 * Note: The SVG discrete `<feComponentTransfer>` (`url(#anime-cel)`) is applied to the
 * `AnimeLightingOverlay` layer so the 60fps WebGL canvas stays 100% hardware-composited.
 */
export function getAnimeCanvasFilterStyle(preset: AnimeGradePreset): React.CSSProperties {
  switch (preset) {
    case 'cel90s':
      // Classic 90s Cel-Anime Color Grading from specification: saturate, contrast, brightness, warm sepia
      return {
        filter: 'saturate(1.52) contrast(1.24) brightness(1.08) sepia(0.09)',
      };
    case 'shinkai_bloom':
      // Vibrant Makoto Shinkai / Modern Anime: rich saturation, crisp contrast, luminous highlights
      return {
        filter: 'saturate(1.62) contrast(1.22) brightness(1.11) sepia(0.05)',
      };
    case 'cyber_trigger':
      // Studio Trigger / Pop-Art Cel: high contrast neon cel-shading
      return {
        filter: 'saturate(1.75) contrast(1.32) brightness(1.09)',
      };
    case 'clean_studio':
    default:
      return {};
  }
}
