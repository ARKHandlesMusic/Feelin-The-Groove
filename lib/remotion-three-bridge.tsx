'use client';

import React, {createContext, useContext, useMemo} from 'react';
import {
  REMOTION_CONFIG,
  REMOTION_SEQUENCES,
  SHOT_SEQUENCES,
  VideoConfig,
  Easing,
  interpolate,
  spring,
  frameToSeconds,
  secondsToFrame,
  getSequenceAtFrame,
  getShotSequenceAtFrame,
  evaluateRemotionFrameState,
} from './remotion-engine';

interface RemotionFrameContextValue {
  globalFrame: number;
  sequenceOffset: number;
  config: VideoConfig;
}

const RemotionFrameContext = createContext<RemotionFrameContextValue>({
  globalFrame: 0,
  sequenceOffset: 0,
  config: REMOTION_CONFIG,
});

export interface RemotionCompositionProviderProps {
  frame: number;
  config?: VideoConfig;
  children: React.ReactNode;
}

export function RemotionCompositionProvider({
  frame,
  config = REMOTION_CONFIG,
  children,
}: RemotionCompositionProviderProps) {
  const clampedFrame = Math.max(0, Math.min(config.durationInFrames - 1, Math.floor(frame)));
  const value = useMemo<RemotionFrameContextValue>(
    () => ({
      globalFrame: clampedFrame,
      sequenceOffset: 0,
      config,
    }),
    [clampedFrame, config]
  );

  return (
    <RemotionFrameContext.Provider value={value}>
      {children}
    </RemotionFrameContext.Provider>
  );
}

/**
 * Remotion-compatible useCurrentFrame() hook.
 * Returns the relative frame inside the nearest enclosing <Sequence>, or global frame at root.
 */
export function useCurrentFrame(): number {
  const ctx = useContext(RemotionFrameContext);
  return Math.max(0, ctx.globalFrame - ctx.sequenceOffset);
}

/**
 * Returns the root composition frame regardless of nested <Sequence> offsets.
 */
export function useGlobalFrame(): number {
  const ctx = useContext(RemotionFrameContext);
  return ctx.globalFrame;
}

/**
 * Remotion-compatible useVideoConfig() hook.
 */
export function useVideoConfig(): VideoConfig {
  const ctx = useContext(RemotionFrameContext);
  return ctx.config;
}

export interface AbsoluteFillProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * Remotion-compatible <AbsoluteFill /> container.
 */
export function AbsoluteFill({style, className = '', children, ...rest}: AbsoluteFillProps) {
  return (
    <div
      className={`absolute inset-0 w-full h-full ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface SequenceProps {
  from: number;
  durationInFrames?: number;
  name?: string;
  layout?: 'absolute-fill' | 'none';
  children: React.ReactNode;
}

/**
 * Remotion-compatible <Sequence from={...} durationInFrames={...} name={...}>
 * Renders children only when globalFrame is within [from, from + durationInFrames)
 * and offsets useCurrentFrame() by `from` for all descendants.
 */
export function Sequence({
  from,
  durationInFrames = Infinity,
  name,
  layout = 'absolute-fill',
  children,
}: SequenceProps) {
  const parentCtx = useContext(RemotionFrameContext);
  const absoluteFrom = parentCtx.sequenceOffset + from;
  const localFrame = parentCtx.globalFrame - absoluteFrom;

  const childCtx = useMemo<RemotionFrameContextValue>(
    () => ({
      globalFrame: parentCtx.globalFrame,
      sequenceOffset: absoluteFrom,
      config: parentCtx.config,
    }),
    [parentCtx.globalFrame, absoluteFrom, parentCtx.config]
  );

  if (localFrame < 0 || localFrame >= durationInFrames) {
    return null;
  }

  return (
    <RemotionFrameContext.Provider value={childCtx}>
      {layout === 'none' ? (
        <>{children}</>
      ) : (
        <AbsoluteFill data-remotion-sequence={name ?? `from-${from}`}>
          {children}
        </AbsoluteFill>
      )}
    </RemotionFrameContext.Provider>
  );
}

export interface CompositionProps<TProps extends object> {
  id: string;
  component: React.ComponentType<TProps>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  defaultProps: TProps;
}

/**
 * Remotion-compatible <Composition /> declaration component.
 */
export function Composition<TProps extends object>({
  id,
  component: Comp,
  durationInFrames,
  fps,
  width,
  height,
  defaultProps,
}: CompositionProps<TProps>) {
  const frame = useGlobalFrame();
  const config = useMemo<VideoConfig>(
    () => ({id, durationInFrames, fps, width, height}),
    [id, durationInFrames, fps, width, height]
  );

  return (
    <RemotionCompositionProvider frame={frame} config={config}>
      <Comp {...defaultProps} />
    </RemotionCompositionProvider>
  );
}

export interface ThreeCanvasProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * @remotion/three compatible <ThreeCanvas /> wrapper that synchronizes Three.js WebGL stage
 * with Remotion's deterministic frame clock.
 */
export function ThreeCanvas({
  width = REMOTION_CONFIG.width,
  height = REMOTION_CONFIG.height,
  className = '',
  style,
  children,
}: ThreeCanvasProps) {
  const frame = useCurrentFrame();
  const config = useVideoConfig();

  return (
    <div
      data-remotion-three-canvas="true"
      data-remotion-frame={frame}
      data-remotion-resolution={`${width}x${height}@${config.fps}fps`}
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export {
  REMOTION_CONFIG,
  REMOTION_SEQUENCES,
  SHOT_SEQUENCES,
  Easing,
  interpolate,
  spring,
  frameToSeconds,
  secondsToFrame,
  getSequenceAtFrame,
  getShotSequenceAtFrame,
  evaluateRemotionFrameState,
};
export type {VideoConfig};
