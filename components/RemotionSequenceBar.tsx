'use client';

import React from 'react';
import {
  REMOTION_CONFIG,
  REMOTION_SEQUENCES,
  evaluateRemotionFrameState,
} from '@/lib/remotion-engine';

interface RemotionSequenceBarProps {
  currentFrame: number;
  onSelectFrame: (frame: number) => void;
}

export default function RemotionSequenceBar({
  currentFrame,
  onSelectFrame,
}: RemotionSequenceBarProps) {
  const frameState = evaluateRemotionFrameState(currentFrame);
  const {
    chapterSequence,
    shotSequence,
    localChapterFrame,
    localShotFrame,
    shotEnterSpring,
    shotProgress,
  } = frameState;

  return (
    <div
      data-testid="remotion-sequence-inspector"
      className="mt-2.5 pt-2.5 border-t border-[#FFF4E0]/10 space-y-2"
    >
      {/* Top Row: Remotion Composition & useCurrentFrame() Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#FFF4E0]/85">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[#2EC4B6] font-bold">
            &lt;Composition id=&quot;{REMOTION_CONFIG.id}&quot; /&gt;
          </span>
          <span>·</span>
          <span>
            useCurrentFrame(): <strong className="text-[#FFB23E]">{frameState.frame}</strong> /{' '}
            {REMOTION_CONFIG.durationInFrames}
          </span>
          <span>·</span>
          <span>
            Active &lt;Sequence&gt;:{' '}
            <strong className="text-[#E83F8C]">{chapterSequence.name}</strong> (from={chapterSequence.from}, dur={chapterSequence.durationInFrames}f, local={localChapterFrame}f)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#FFF4E0]/75">
          <span>
            Shot #{shotSequence.shotIndex + 1} local={localShotFrame}f
          </span>
          <span>·</span>
          <span>
            spring(): <strong className="text-[#2EC4B6]">{shotEnterSpring.toFixed(2)}</strong>
          </span>
          <span>·</span>
          <span>
            interpolate(): <strong className="text-[#FFB23E]">{(shotProgress * 100).toFixed(0)}%</strong>
          </span>
        </div>
      </div>

      {/* Multi-Track Remotion <Sequence> Timeline Proportional Bar */}
      <div
        role="group"
        aria-label="Remotion Sequence Timeline Tracks"
        className="relative flex w-full h-7 rounded-lg overflow-hidden bg-[#120E2E] border border-[#FFF4E0]/15"
      >
        {REMOTION_SEQUENCES.map((seq) => {
          const widthPct = (seq.durationInFrames / REMOTION_CONFIG.durationInFrames) * 100;
          const isCurrent = seq.id === chapterSequence.id;

          return (
            <button
              key={seq.id}
              type="button"
              onClick={() => onSelectFrame(seq.from + 2)}
              title={`${seq.name} · Frames ${seq.from}–${seq.from + seq.durationInFrames} (${seq.threeScenery})`}
              style={{
                width: `${widthPct}%`,
                borderRight: '1px solid rgba(255,244,224,0.14)',
              }}
              className={`relative h-full flex items-center justify-center px-1 text-[10px] font-mono truncate transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-[#FFB23E] text-[#120E2E] font-bold'
                  : 'bg-[#1F184D] text-[#FFF4E0]/80 hover:bg-[#2B2268] hover:text-[#FFF4E0]'
              }`}
            >
              <span className="truncate">{seq.name.replace(/^\d+\.\s*/, '')}</span>
            </button>
          );
        })}

        {/* Playhead Marker */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-[#E83F8C]"
          style={{
            left: `${(frameState.frame / REMOTION_CONFIG.durationInFrames) * 100}%`,
          }}
        />
      </div>

      {/* Bottom Quick-Jump Sequence Buttons with Frame Bounds */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {REMOTION_SEQUENCES.map((seq) => {
          const isActive = seq.id === chapterSequence.id;
          return (
            <button
              key={seq.id}
              type="button"
              onClick={() => onSelectFrame(seq.from + 2)}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#2EC4B6] text-[#120E2E] font-bold'
                  : 'bg-[#221A4F] text-[#FFF4E0]/80 hover:bg-[#2D2366]'
              }`}
            >
              {seq.name} [f{seq.from}–f{seq.from + seq.durationInFrames}]
            </button>
          );
        })}
      </div>
    </div>
  );
}
