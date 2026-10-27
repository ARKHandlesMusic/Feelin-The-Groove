'use client';

import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Camera,
  Sliders,
  Sparkles,
  SkipForward,
  Type,
  Film,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  RemotionCompositionProvider,
  REMOTION_CONFIG,
  frameToSeconds,
  secondsToFrame,
  getSequenceAtFrame,
} from 'remotion';
import RemotionRoot from '@/remotion/Root';
import RemotionSequenceBar from '@/components/RemotionSequenceBar';
import ReleaseKitModal from '@/components/ReleaseKitModal';
import Render4K60Engine from '@/components/Render4K60Engine';
import {AnimeGradePreset} from '@/components/AnimeStylePipeline';
import {
  CHAPTERS,
  SHOTS,
  SONG_METADATA,
  CameraPresetMode,
  ShotSpec,
  getShotAtTime,
  formatTimestamp,
} from '@/lib/timeline';
import {KINETIC_STYLES_50} from '@/lib/lyric-kinetic-50';

export default function FindItsGroovePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const [currentShot, setCurrentShot] = useState<ShotSpec>(SHOTS[0]);
  const [cameraMode, setCameraMode] = useState<CameraPresetMode>('director');
  const [animePreset, setAnimePreset] = useState<AnimeGradePreset>('cel90s');
  const [lyricStyleOverride, setLyricStyleOverride] = useState<number | 'auto'>('auto');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isReleaseKitOpen, setIsReleaseKitOpen] = useState(false);
  const [autoStartRender, setAutoStartRender] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'sequences' | 'chapters' | 'lyrics50' | 'camera' | 'director'
  >('sequences');

  // Gemini 4 Argon High-Thinking Director state
  const [directorQuery, setDirectorQuery] = useState('');
  const [directorNote, setDirectorNote] = useState<string>(
    'Select "Analyze Current Shot" to generate a choreography and motif breakdown using Gemini 4 Argon (ThinkingLevel.HIGH).'
  );
  const [directorLoading, setDirectorLoading] = useState(false);

  const currentTimeRef = useRef<number>(0);
  const audioEnergyRef = useRef<{bass: number; mid: number; high: number}>({
    bass: 0.45,
    mid: 0.4,
    high: 0.3,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Sync React HUD state deterministically from seconds t
  const syncHudAtTime = useCallback((t: number) => {
    const clamped = Math.max(0, Math.min(SONG_METADATA.duration, t));
    currentTimeRef.current = clamped;
    setDisplayTime(clamped);
    setCurrentShot(getShotAtTime(clamped));
  }, []);

  // Initialize Web Audio Analyser on first user play
  const ensureAudioAnalyser = useCallback(() => {
    const audioEl = audioRef.current;
    if (!audioEl || audioCtxRef.current) return;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaElementSource(audioEl);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      freqDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    } catch {
      // Fallback to deterministic beat energy if AudioContext is restricted
    }
  }, []);

  // Support ?autostart=1, ?t=, ?frame=, ?style=, ?modal=release, and ?render=1 query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const frameParam = params.get('frame');
    const tParam = params.get('t');

    if (frameParam) {
      const parsedFrame = parseInt(frameParam, 10);
      if (!Number.isNaN(parsedFrame)) {
        const sec = frameToSeconds(parsedFrame, REMOTION_CONFIG.fps);
        syncHudAtTime(sec);
        if (audioRef.current) {
          audioRef.current.currentTime = sec;
        }
      }
    } else if (tParam) {
      const parsed = parseFloat(tParam);
      if (!Number.isNaN(parsed)) {
        syncHudAtTime(parsed);
        if (audioRef.current) {
          audioRef.current.currentTime = parsed;
        }
      }
    }

    const styleParam = params.get('style');
    if (styleParam) {
      const parsedStyle = parseInt(styleParam, 10);
      if (!Number.isNaN(parsedStyle) && parsedStyle >= 1 && parsedStyle <= 50) {
        setLyricStyleOverride(parsedStyle);
      }
    }
    if (params.get('modal') === 'release') {
      setIsReleaseKitOpen(true);
    }
    if (params.get('render') === '1') {
      setAutoStartRender(true);
    }
    if (params.get('autostart') === '1') {
      setIsPlaying(true);
    }
  }, [syncHudAtTime]);

  // Master 60 FPS Remotion timeline clock loop (t = frame / 60)
  useEffect(() => {
    let timerId = 0;
    let lastTick = performance.now();

    const updateClock = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTick) / 1000);
      lastTick = now;

      if (isPlaying) {
        const audioEl = audioRef.current;
        let nextTime = currentTimeRef.current + dt;

        if (audioEl && !audioEl.paused && Number.isFinite(audioEl.currentTime)) {
          if (Math.abs(audioEl.currentTime - currentTimeRef.current) < 1.5) {
            nextTime = audioEl.currentTime;
          }
        }

        if (nextTime >= SONG_METADATA.duration) {
          nextTime = 0;
          if (audioEl) {
            audioEl.currentTime = 0;
          }
        }

        currentTimeRef.current = nextTime;

        if (analyserRef.current && freqDataRef.current && audioEl && !audioEl.paused) {
          analyserRef.current.getByteFrequencyData(freqDataRef.current);
          const data = freqDataRef.current;
          let bassSum = 0;
          let midSum = 0;
          for (let i = 0; i < 8; i++) bassSum += data[i];
          for (let i = 8; i < 28; i++) midSum += data[i];
          audioEnergyRef.current = {
            bass: bassSum / (8 * 255),
            mid: midSum / (20 * 255),
            high: 0.4,
          };
        } else {
          const beatPhase = ((nextTime * SONG_METADATA.bpm) / 60) % 1;
          audioEnergyRef.current = {
            bass: 0.35 + 0.55 * Math.pow(1 - beatPhase, 2),
            mid: 0.4 + 0.3 * Math.sin(nextTime * 8),
            high: 0.35,
          };
        }
      }

      timerId = window.setTimeout(updateClock, 16);
    };

    timerId = window.setTimeout(updateClock, 16);
    return () => window.clearTimeout(timerId);
  }, [isPlaying]);

  // Throttle React HUD state updates so DOM never bottlenecks WebGL 60fps
  useEffect(() => {
    const hudInterval = window.setInterval(() => {
      const t = currentTimeRef.current;
      setDisplayTime(t);
      const shot = getShotAtTime(t);
      setCurrentShot((prev) => (prev.id === shot.id ? prev : shot));
    }, 66);
    return () => window.clearInterval(hudInterval);
  }, []);

  const togglePlay = useCallback(() => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    const audioEl = audioRef.current;
    if (audioEl) {
      if (nextPlaying) {
        ensureAudioAnalyser();
        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
        audioEl.currentTime = currentTimeRef.current;
        audioEl.play().catch(() => {});
      } else {
        audioEl.pause();
      }
    }
  }, [isPlaying, ensureAudioAnalyser]);

  const seekTo = useCallback(
    (targetSec: number) => {
      const clamped = Math.max(0, Math.min(SONG_METADATA.duration - 0.02, targetSec));
      syncHudAtTime(clamped);
      if (audioRef.current) {
        audioRef.current.currentTime = clamped;
      }
    },
    [syncHudAtTime]
  );

  const seekToFrame = useCallback(
    (targetFrame: number) => {
      const clampedFrame = Math.max(
        0,
        Math.min(REMOTION_CONFIG.durationInFrames - 1, Math.round(targetFrame))
      );
      seekTo(frameToSeconds(clampedFrame, REMOTION_CONFIG.fps));
    },
    [seekTo]
  );

  const startPlaybackForRender = useCallback(
    (startSec: number) => {
      syncHudAtTime(startSec);
      setIsPlaying(true);
      const audioEl = audioRef.current;
      if (audioEl) {
        audioEl.currentTime = startSec;
        audioEl.play().catch(() => {});
      }
    },
    [syncHudAtTime]
  );

  const stopPlaybackForRender = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  }, [isMuted]);

  const askDirector = useCallback(
    async (customPrompt?: string) => {
      setDirectorLoading(true);
      try {
        const res = await fetch('/api/director', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            query: customPrompt ?? directorQuery,
            currentTime: currentTimeRef.current,
            shotId: currentShot.id,
          }),
        });
        const data = await res.json();
        if (data.analysis) {
          setDirectorNote(data.analysis);
        }
      } catch {
        setDirectorNote(
          `Blueprint Shot ${currentShot.title}: ${currentShot.narrativePurpose}`
        );
      } finally {
        setDirectorLoading(false);
      }
    },
    [directorQuery, currentShot]
  );

  // Keyboard shortcuts (Space: play/pause, H: collapse/expand dock, ArrowLeft/Right: scrub 4s, ,/.: step 1 frame)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        seekTo(currentTimeRef.current + 4);
      } else if (e.code === 'ArrowLeft') {
        seekTo(currentTimeRef.current - 4);
      } else if (e.key === '.') {
        seekToFrame(secondsToFrame(currentTimeRef.current) + 1);
      } else if (e.key === ',') {
        seekToFrame(secondsToFrame(currentTimeRef.current) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, seekTo, seekToFrame]);

  const shotIdx = Math.max(
    0,
    SHOTS.findIndex((s) => s.id === currentShot.id)
  );
  const autoStyleId = (shotIdx % 50) + 1;
  const activeStyleId =
    lyricStyleOverride === 'auto' ? autoStyleId : lyricStyleOverride;
  const activeStyleMeta =
    KINETIC_STYLES_50[activeStyleId - 1] || KINETIC_STYLES_50[0];

  const currentFrame60 = secondsToFrame(displayTime, REMOTION_CONFIG.fps);
  const totalFrames60 = REMOTION_CONFIG.durationInFrames;
  const activeRemotionSequence = getSequenceAtFrame(currentFrame60);

  return (
    <RemotionCompositionProvider frame={currentFrame60} config={REMOTION_CONFIG}>
      <main
        data-state={isPlaying ? 'playing' : 'paused'}
        data-remotion-engine="remotion-three-4k60"
        data-remotion-frame={currentFrame60}
        data-shot={currentShot.id}
        data-lyric-style={activeStyleMeta.id}
        data-anime-preset={animePreset}
        className="relative w-screen h-screen overflow-hidden bg-[#120E2E] select-none"
      >
        {/* Hidden HTML5 Audio Element linked to local asset */}
        <audio
          ref={audioRef}
          src={SONG_METADATA.audioUrl}
          preload="auto"
          onEnded={() => seekTo(0)}
        />

        {/* 1. Authoritative Remotion <Composition id="FindItsGroove4K60" /> + @remotion/three <ThreeCanvas /> */}
        <RemotionRoot
          currentTimeRef={currentTimeRef}
          audioEnergyRef={audioEnergyRef}
          cameraMode={cameraMode}
          animePreset={animePreset}
          lyricStyleOverride={lyricStyleOverride}
          hideLightingOverlay={isReleaseKitOpen}
          currentShot={currentShot}
        />

        {/* 2. Top Bar Contract (3-Zone Header: Brand & Remotion Engine — Sequence Nav — Primary Actions) */}
        <header className="relative z-20 flex items-center justify-between gap-6 px-6 py-3 bg-[#120E2E]/90 border-b border-[#FFF4E0]/10">
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="text-base font-bold tracking-tight text-[#FFF4E0] whitespace-nowrap"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              Find Its Groove · Aarav Kharade
            </div>
            <span className="hidden sm:inline-flex items-center text-xs font-mono text-[#2EC4B6]">
              Remotion 4K 60FPS · @remotion/three
            </span>
          </div>

          <nav
            aria-label="Storyline Sections"
            className="hidden lg:flex items-center gap-5 text-xs font-medium text-[#FFF4E0]/75"
          >
            <button
              type="button"
              onClick={() => seekTo(2.75)}
              className="hover:text-[#FFB23E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              01. Verse 1 (Crooked Rhyme)
            </button>
            <button
              type="button"
              onClick={() => seekTo(25.24)}
              className="hover:text-[#E83F8C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              02. Chorus 1 (Find Its Groove)
            </button>
            <button
              type="button"
              onClick={() => seekTo(56.87)}
              className="hover:text-[#2EC4B6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              03. Verse 2 (Workshop)
            </button>
            <button
              type="button"
              onClick={() => seekTo(111.69)}
              className="hover:text-[#FFF4E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              04. Bridge (First Draft)
            </button>
            <button
              type="button"
              onClick={() => seekTo(128.61)}
              className="hover:text-[#FFB23E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              05. Final Chorus (Noon Sun)
            </button>
            <button
              type="button"
              onClick={() => seekTo(160.0)}
              className="hover:text-[#2EC4B6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              06. End Credits (2:40)
            </button>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsReleaseKitOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-[#FFF4E0] bg-[#E83F8C] rounded-lg hover:bg-[#f2579f] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Thumbnail, Title & Credits</span>
            </button>

            <select
              aria-label="Select Anime Visual Look"
              value={animePreset}
              onChange={(e) => setAnimePreset(e.target.value as AnimeGradePreset)}
              className="hidden md:block px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#1E1747] border border-[#FFF4E0]/20 text-[#FFF4E0] cursor-pointer"
            >
              <option value="cel90s">Anime Look: 90s Cel + God Rays</option>
              <option value="shinkai_bloom">Anime Look: Shinkai Sky Bloom</option>
              <option value="cyber_trigger">Anime Look: Studio Trigger Neon</option>
              <option value="clean_studio">Anime Look: Clean Cel Studio</option>
            </select>

            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-1.5 text-xs font-semibold text-[#120E2E] bg-[#FFB23E] rounded-lg hover:bg-[#ffc163] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Video' : 'Play Video'}</span>
            </button>
          </div>
        </header>

        {/* 3. Unified Collapsible Bottom Control Dock (Top of Stage 100% Free of Lyric/Telemetry Boxes) */}
        <section
          aria-label="Music Video Timeline and Controls"
          className="fixed bottom-4 left-0 right-0 mx-auto z-30 w-[94vw] max-w-[940px] transition-transform duration-200"
          style={{
            transform: dockCollapsed ? 'translateY(calc(100% - 34px))' : 'translateY(0)',
          }}
        >
          {/* Collapse / Expand Toggle Handle */}
          <div className="flex justify-center mb-1">
            <button
              type="button"
              onClick={() => setDockCollapsed((prev) => !prev)}
              className="px-3.5 py-1 text-xs font-medium text-[#FFF4E0] bg-[#18133D] border border-[#FFF4E0]/15 rounded-t-lg hover:bg-[#221B54] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {dockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-[#FFB23E]" />
                  <span>Show Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-[#2EC4B6]" />
                  <span>Hide Controls</span>
                </>
              )}
            </button>
          </div>

          {/* Main Dock Body */}
          <div className="bg-[#161138] border border-[#FFF4E0]/15 rounded-2xl p-3.5 shadow-2xl">
            {/* Compact Dock Status Bar (Kept inside dock, never rendered into the 4K video!) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#FFF4E0]/10 text-xs">
              <p
                data-testid="active-lyric-line"
                className="font-bold text-[#FFF4E0] tracking-tight truncate"
                style={{fontFamily: 'var(--font-display), sans-serif'}}
              >
                {currentShot.lyric}
              </p>
              <span className="text-[11px] font-mono tabular-nums text-[#2EC4B6] shrink-0">
                Frame <strong className="text-[#FFF4E0]">{currentFrame60}</strong>/{totalFrames60} ·{' '}
                <span className="text-[#FFB23E]">{activeRemotionSequence.name}</span> ·{' '}
                <span className="text-[#E83F8C]">{activeStyleMeta.label}</span>
              </span>
            </div>

            {/* Row 1: Transport Controls + Frame Step + Timeline Scrubber + Mode Tabs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="p-2 rounded-lg bg-[#FFB23E] text-[#120E2E] hover:bg-[#ffc266] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => seekToFrame(currentFrame60 - 1)}
                  aria-label="Previous Frame (-1f)"
                  title="Step Back 1 Frame (60fps)"
                  className="px-2 py-1.5 rounded-lg bg-[#231C52] text-[#FFF4E0] hover:bg-[#2E2569] text-[11px] font-mono transition-colors cursor-pointer flex items-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>1f</span>
                </button>
                <button
                  type="button"
                  onClick={() => seekToFrame(currentFrame60 + 1)}
                  aria-label="Next Frame (+1f)"
                  title="Step Forward 1 Frame (60fps)"
                  className="px-2 py-1.5 rounded-lg bg-[#231C52] text-[#FFF4E0] hover:bg-[#2E2569] text-[11px] font-mono transition-colors cursor-pointer flex items-center"
                >
                  <span>1f</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => seekTo(0)}
                  aria-label="Restart Video"
                  className="p-2 rounded-lg bg-[#231C52] text-[#FFF4E0] hover:bg-[#2E2569] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = SHOTS.findIndex((s) => s.id === currentShot.id);
                    const nextShot = SHOTS[(idx + 1) % SHOTS.length];
                    seekTo(nextShot.startTime + 0.05);
                  }}
                  aria-label="Next Shot"
                  className="p-2 rounded-lg bg-[#231C52] text-[#FFF4E0] hover:bg-[#2E2569] transition-colors cursor-pointer"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  className="p-2 rounded-lg bg-[#231C52] text-[#FFF4E0] hover:bg-[#2E2569] transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-[#E83F8C]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#2EC4B6]" />
                  )}
                </button>
              </div>

              {/* Scrubber */}
              <div className="flex-1 min-w-[160px] flex items-center gap-2">
                <span className="text-xs font-mono tabular-nums text-[#FFB23E] shrink-0">
                  {formatTimestamp(displayTime)}
                </span>
                <input
                  type="range"
                  aria-label="Timeline Scrubber"
                  min={0}
                  max={SONG_METADATA.duration}
                  step={0.05}
                  value={displayTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full accent-[#FFB23E] h-1.5 bg-[#261F57] rounded-lg cursor-pointer"
                />
                <span className="text-xs font-mono tabular-nums text-[#FFF4E0]/60 shrink-0">
                  {formatTimestamp(SONG_METADATA.duration)}
                </span>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="flex items-center gap-1 p-1 bg-[#1E1747] rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('sequences')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'sequences'
                      ? 'bg-[#2EC4B6] text-[#120E2E] font-semibold'
                      : 'text-[#FFF4E0]/75 hover:text-[#FFF4E0]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Remotion Sequences</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chapters')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'chapters'
                      ? 'bg-[#2EC4B6] text-[#120E2E] font-semibold'
                      : 'text-[#FFF4E0]/75 hover:text-[#FFF4E0]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Story Chapters</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lyrics50')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'lyrics50'
                      ? 'bg-[#FFB23E] text-[#120E2E] font-semibold'
                      : 'text-[#FFF4E0]/75 hover:text-[#FFF4E0]'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>3D Lyrics (50 Styles)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('camera')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'camera'
                      ? 'bg-[#2EC4B6] text-[#120E2E] font-semibold'
                      : 'text-[#FFF4E0]/75 hover:text-[#FFF4E0]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera ({cameraMode})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('director')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'director'
                      ? 'bg-[#E83F8C] text-[#FFF4E0] font-semibold'
                      : 'text-[#FFF4E0]/75 hover:text-[#FFF4E0]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Shot Blueprint</span>
                </button>
              </div>
            </div>

            {/* Row 2: Active Tab Content */}
            {activeTab === 'sequences' && (
              <RemotionSequenceBar
                currentFrame={currentFrame60}
                onSelectFrame={(f) => seekToFrame(f)}
              />
            )}

            {activeTab === 'chapters' && (
              <div className="mt-2.5 pt-2.5 border-t border-[#FFF4E0]/10 flex items-center gap-1.5 overflow-x-auto pb-1">
                {CHAPTERS.map((chap) => {
                  const isActive = currentShot.section === chap.id;
                  return (
                    <button
                      key={chap.id}
                      type="button"
                      onClick={() => seekTo(chap.startTime + 0.05)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#FFB23E] text-[#120E2E] font-bold'
                          : 'bg-[#221A4F] text-[#FFF4E0]/80 hover:bg-[#2C2263] hover:text-[#FFF4E0]'
                      }`}
                    >
                      {chap.label} ({formatTimestamp(chap.startTime)})
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'lyrics50' && (
              <div className="mt-2.5 pt-2.5 border-t border-[#FFF4E0]/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#FFB23E] whitespace-nowrap">
                    50 Kinetic 3D Lyric Styles:
                  </span>
                  <select
                    aria-label="Select 3D Lyric Kinetic Style"
                    value={lyricStyleOverride}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLyricStyleOverride(val === 'auto' ? 'auto' : parseInt(val, 10));
                    }}
                    className="px-2.5 py-1 text-xs rounded-md bg-[#1E1747] border border-[#FFF4E0]/20 text-[#FFF4E0] cursor-pointer"
                  >
                    <option value="auto">
                      Auto-Cycle All 50 Styles (Active: {activeStyleMeta.label})
                    </option>
                    {KINETIC_STYLES_50.map((st) => (
                      <option key={st.id} value={st.id}>
                        [{st.category.trim().toUpperCase()}] {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    {id: 'auto' as const, label: 'Auto (50x)'},
                    {id: 1, label: '#01 Fall Bounce'},
                    {id: 11, label: '#11 Shoot In/Out'},
                    {id: 21, label: '#21 Roll Barrel'},
                    {id: 29, label: '#29 Pop Elastic'},
                    {id: 37, label: '#37 Fade Dissolve'},
                    {id: 43, label: '#43 Orbit Vortex'},
                    {id: 47, label: '#47 Arch Marquee'},
                  ].map((quick) => (
                    <button
                      key={String(quick.id)}
                      type="button"
                      onClick={() => setLyricStyleOverride(quick.id)}
                      className={`px-2 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        lyricStyleOverride === quick.id
                          ? 'bg-[#E83F8C] text-[#FFF4E0] font-bold'
                          : 'bg-[#221A4F] text-[#FFF4E0]/75 hover:bg-[#2C2263]'
                      }`}
                    >
                      {quick.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'camera' && (
              <div className="mt-2.5 pt-2.5 border-t border-[#FFF4E0]/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      {id: 'director', label: 'Director Cut (Auto Hard-Cuts & Moves)'},
                      {id: 'wide', label: 'Stage Wide (16-Col Beat Grid)'},
                      {id: 'isometric', label: 'Isometric 2.5D'},
                      {id: 'closeup', label: 'Cast Close-Up (Spark & Beat)'},
                      {id: 'orbit', label: 'Interactive Free Orbit'},
                    ] as {id: CameraPresetMode; label: string}[]
                  ).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCameraMode(preset.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        cameraMode === preset.id
                          ? 'bg-[#2EC4B6] text-[#120E2E] font-bold'
                          : 'bg-[#221A4F] text-[#FFF4E0]/80 hover:bg-[#2C2263]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#FFF4E0]/70">
                  <button
                    type="button"
                    onClick={() => seekTo(36.4)}
                    className="underline hover:text-[#FFB23E] cursor-pointer whitespace-nowrap"
                  >
                    Motif #1 (0:36)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => seekTo(91.6)}
                    className="underline hover:text-[#FFB23E] cursor-pointer whitespace-nowrap"
                  >
                    Motif #2 (1:31)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => seekTo(139.2)}
                    className="underline hover:text-[#FFB23E] cursor-pointer whitespace-nowrap"
                  >
                    Motif #3 (2:19)
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'director' && (
              <div className="mt-2.5 pt-2.5 border-t border-[#FFF4E0]/10 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#FFF4E0]/80">
                  <div>
                    <span className="font-semibold text-[#FFB23E]">Spark:</span>{' '}
                    {currentShot.sparkAction} ·{' '}
                    <span className="font-semibold text-[#2EC4B6]">Beat:</span>{' '}
                    {currentShot.beatAction} ·{' '}
                    <span className="font-semibold text-[#E83F8C]">Deadline:</span>{' '}
                    {currentShot.deadlineState}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label="Ask Director Question"
                      placeholder="Ask about choreography or symbolism..."
                      value={directorQuery}
                      onChange={(e) => setDirectorQuery(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-md bg-[#1E1747] border border-[#FFF4E0]/20 text-[#FFF4E0] placeholder-[#FFF4E0]/40 w-56"
                    />
                    <button
                      type="button"
                      onClick={() => askDirector()}
                      disabled={directorLoading}
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-[#E83F8C] text-[#FFF4E0] hover:bg-[#f2579f] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {directorLoading ? 'Thinking...' : 'Analyze Current Shot'}
                    </button>
                  </div>
                </div>
                <p
                  data-testid="director-analysis-text"
                  className="text-xs text-[#FFF4E0]/90 bg-[#1E1747] rounded-lg px-3 py-2 leading-relaxed"
                >
                  {directorNote}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 5. Live 4K UHD (3840x2160) @ 60 FPS Master Video Render Engine */}
        <Render4K60Engine
          currentTimeRef={currentTimeRef}
          isPlaying={isPlaying}
          onStartPlaybackForRender={startPlaybackForRender}
          onStopPlaybackForRender={stopPlaybackForRender}
          onStepFrame={seekToFrame}
          autoStartOnMount={autoStartRender}
        />

        {/* 6. Official 4K Anime Thumbnail, Title, Description & End Credits Modal */}
        <ReleaseKitModal
          isOpen={isReleaseKitOpen}
          onClose={() => setIsReleaseKitOpen(false)}
          onJumpToOutroCredits={() => seekTo(160.0)}
        />
      </main>
    </RemotionCompositionProvider>
  );
}
