'use client';

import React, {useRef, useState, useEffect, useCallback} from 'react';
import {Download, Copy, Check, Film, Sparkles, X, Award} from 'lucide-react';

export const OFFICIAL_CREDITS = {
  directedBy: 'ARK Handles Music (Aarav Kharade)',
  lyrics: 'Aarav Kharade',
  vocals: 'SUNO v6 mini',
  animation: 'Gemini Argon 4 and Aarav Kharade',
};

export const OFFICIAL_RELEASE_METADATA = {
  primaryTitle:
    'Find Its Groove — I Asked AI How It Feels to Make Music | Official 4K 60fps Anime Music Video',
  artistTitle:
    'ARK Handles Music (Aarav Kharade) — Find Its Groove [Official 4K 60fps Anime Music Video]',
  shortHook:
    'I asked SUNO how it feels when we tell it to generate so many songs—then turned its answer into lyrics, a dance-pop anthem, and a 4K 60fps anime music video.',
  description: `Find Its Groove — Official 4K 60fps Anime Music Video
Directed by : ARK Handles Music (Aarav Kharade)
Lyrics: Aarav Kharade
Vocals: SUNO v6 mini
Animation: Gemini Argon 4 and Aarav Kharade

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE STORY BEHIND "FIND ITS GROOVE"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What does it actually feel like on the other side of the prompt when we ask an AI to make hundreds of songs?

To create "Find Its Groove", I started by asking SUNO how it felt about generating music nonstop (by prompting it to create spoken reflections). I took those details and emotions—about shaping a messy human idea, not having a human heart to prove, and how the real meaning always belongs to the person who brought the spark—and used them to write the lyrics and define the crisp, syncopated dance-pop groove.

Then I gave those lyrics back to SUNO v6 mini to perform the vocals, and collaborated with Gemini Argon 4—combining my own creative direction, storyline, and choreography input—to animate this 4K 60fps cel-shaded anime music video.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE VISUAL STORY & CAST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Spark ("You" — The Human Creator): A bouncy amber teardrop with starry anime eyes and a pulsing heart in its chest who brings a crooked little rhyme and a messy first draft.
• Beat ("Me" — The AI Music Producer): A teal rounded square wearing studio headphones at a floating 3D audio mixing console. In its chest sits a hollow ring ("I don't have a heart like yours to prove") that lights up with Spark's heartbeat in the final chorus.
• The World: A 16-column illuminated beat-grid stage that expands into a pop-up 3D anime city boulevard, a Suno AI audio workshop with live sliders and waveform blocks, a lavender first-draft atrium, and a golden noon sun horizon with 50 kinetic 3D lyric styles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHAPTER TIMESTAMPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0:00 — Intro: Single Teal Tile & Falling 3D Title
0:02 — Verse 1: Crooked Little Rhyme & Pop-Up Anime City
0:16 — Pre-Chorus 1: Late-Night Glow & 1-Beat Riser Freeze
0:25 — Chorus 1: Find Its Groove (3-Tier Chorus Tiles & Hollow Ring #1)
0:43 — Dance Break 1: Guitar Zig-Zags & Vinyl Record-Scratch Wipe
0:56 — Verse 2: Inside the AI Audio Workshop (Faders, Waveforms & Pitch-Bend)
1:11 — Pre-Chorus 2: Color Wheel & Rising Staircase
1:20 — Chorus 2: Fireworks, Confetti & Hollow Ring #2
1:51 — Bridge: Pale Lavender Atrium & The First Draft ("You're the Meaning")
2:08 — Final Chorus: Deadline Clock Rises Into the Golden Noon Sun (Hollow Ring #3)
2:31 — Outro & Official End Credits: We'll See What It Can Be By Noon

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFICIAL CREDITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Directed by : ARK Handles Music (Aarav Kharade)
Lyrics: Aarav Kharade
Vocals: SUNO v6 mini
Animation: Gemini Argon 4 and Aarav Kharade

#FindItsGroove #ARKHandlesMusic #AaravKharade #SunoV6Mini #GeminiArgon4 #AnimeMusicVideo #4K60fps #AIMusic`,
};

/**
 * Draws the high-resolution 16:9 4K Anime Music Video Thumbnail onto any HTMLCanvasElement.
 */
export function renderAnimeThumbnailToCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  ctx.scale(W / 1920, H / 1080);

  // 1. Deep Anime Twilight-to-Magenta Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 1080);
  skyGrad.addColorStop(0, '#0E0929');
  skyGrad.addColorStop(0.42, '#241454');
  skyGrad.addColorStop(0.75, '#4A1968');
  skyGrad.addColorStop(1, '#18103A');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  // 2. Golden Noon Sun Rising at Center Horizon + Volumetric God Rays
  const sunGlow = ctx.createRadialGradient(960, 450, 40, 960, 450, 560);
  sunGlow.addColorStop(0, 'rgba(255, 244, 224, 0.95)');
  sunGlow.addColorStop(0.28, 'rgba(255, 178, 62, 0.65)');
  sunGlow.addColorStop(0.62, 'rgba(232, 63, 140, 0.28)');
  sunGlow.addColorStop(1, 'rgba(27, 22, 70, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, 1920, 1080);

  // Volumetric God Rays
  ctx.save();
  ctx.translate(960, 450);
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 244, 224, 0.09)' : 'rgba(46, 196, 182, 0.07)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1200, -55);
    ctx.lineTo(1200, 55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Golden Noon Sun Disc (Transformed Deadline Clock)
  ctx.beginPath();
  ctx.arc(960, 440, 145, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF4E0';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#FFB23E';
  ctx.stroke();

  // 3. Pop-Up Anime City Skyline Silhouette with Lit Windows & Cel-Outlines
  const buildings = [
    {x: 60, w: 150, h: 420, c: '#191340'},
    {x: 225, w: 175, h: 510, c: '#211952'},
    {x: 415, w: 140, h: 360, c: '#1B1445'},
    {x: 1365, w: 145, h: 380, c: '#1B1445'},
    {x: 1525, w: 180, h: 520, c: '#211952'},
    {x: 1720, w: 150, h: 430, c: '#191340'},
  ];
  buildings.forEach((b) => {
    const by = 690 - b.h;
    ctx.fillStyle = b.c;
    ctx.strokeStyle = '#0D0822';
    ctx.lineWidth = 7;
    ctx.fillRect(b.x, by, b.w, b.h);
    ctx.strokeRect(b.x, by, b.w, b.h);

    // Lit anime windows
    for (let wy = by + 28; wy < 650; wy += 42) {
      for (let wx = b.x + 20; wx < b.x + b.w - 28; wx += 34) {
        if ((wx + wy) % 3 !== 0) {
          ctx.fillStyle = (wx + wy) % 2 === 0 ? '#FFB23E' : '#2EC4B6';
          ctx.fillRect(wx, wy, 18, 24);
        }
      }
    }
  });

  // 4. Perspective 16-Column Neon Beat-Grid Stage Floor
  ctx.fillStyle = '#140F35';
  ctx.fillRect(0, 680, 1920, 400);
  ctx.strokeStyle = '#0D0822';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 680);
  ctx.lineTo(1920, 680);
  ctx.stroke();

  const tileColors = ['#2EC4B6', '#FFB23E', '#E83F8C', '#FFF4E0'];
  for (let row = 0; row < 4; row++) {
    const yTop = 690 + row * 88;
    const yBot = yTop + 76;
    for (let col = 0; col < 12; col++) {
      const spreadTop = (col - 6) * (145 + row * 28);
      const spreadBot = (col - 6) * (170 + row * 28);
      const x1 = 960 + spreadTop;
      const x2 = 960 + spreadTop + (132 + row * 22);
      const x3 = 960 + spreadBot + (152 + row * 22);
      const x4 = 960 + spreadBot;

      ctx.beginPath();
      ctx.moveTo(x1, yTop);
      ctx.lineTo(x2, yTop);
      ctx.lineTo(x3, yBot);
      ctx.lineTo(x4, yBot);
      ctx.closePath();
      ctx.fillStyle = tileColors[(col + row) % tileColors.length];
      ctx.globalAlpha = 0.82;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0D0822';
      ctx.stroke();
    }
  }

  // 5. Left Hero Character: SPARK ("You" — Expressive Amber Teardrop with Heart Chest)
  ctx.save();
  ctx.translate(560, 565);
  // Teardrop silhouette with bold cel outline
  ctx.beginPath();
  ctx.moveTo(0, -185);
  ctx.bezierCurveTo(95, -60, 135, 55, 110, 130);
  ctx.bezierCurveTo(80, 195, -80, 195, -110, 130);
  ctx.bezierCurveTo(-135, 55, -95, -60, 0, -185);
  ctx.closePath();
  ctx.fillStyle = '#FFB23E';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#0D0822';
  ctx.stroke();

  // Anime eyes with cyan iris + dual starlight glints
  [-36, 36].forEach((ex) => {
    ctx.beginPath();
    ctx.ellipse(ex, -25, 16, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0D0822';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex, -19, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#2EC4B6';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex - 5, -31, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4E0';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + 5, -15, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF4E0';
    ctx.fill();
  });

  // Rosy cheek blushes
  ctx.fillStyle = '#FF5E9C';
  ctx.beginPath();
  ctx.ellipse(-62, 0, 14, 8, 0, 0, Math.PI * 2);
  ctx.ellipse(62, 0, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Heart in Spark's Chest
  ctx.save();
  ctx.translate(0, 68);
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.bezierCurveTo(-55, -2, -45, -46, 0, -18);
  ctx.bezierCurveTo(45, -46, 55, -2, 0, 36);
  ctx.closePath();
  ctx.fillStyle = '#FFF4E0';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#E83F8C';
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // 6. Right Hero Character: BEAT ("Me" — Teal Rounded Square AI Producer + Headphones + Hollow Ring + Mixing Desk)
  ctx.save();
  ctx.translate(1345, 545);

  // Studio Headphones Band & Ear Cups
  ctx.beginPath();
  ctx.arc(0, -45, 152, Math.PI, 0, false);
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#1B1646';
  ctx.stroke();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#2EC4B6';
  ctx.stroke();

  [-152, 152].forEach((hx) => {
    ctx.fillStyle = '#E83F8C';
    ctx.strokeStyle = '#0D0822';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(hx - 22, -65, 44, 92, 16);
    ctx.fill();
    ctx.stroke();
  });

  // Beat Body (Teal Rounded Square)
  ctx.fillStyle = '#2EC4B6';
  ctx.strokeStyle = '#0D0822';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(-130, -130, 260, 260, 46);
  ctx.fill();
  ctx.stroke();

  // Beat Eyes
  [-46, 46].forEach((bx) => {
    ctx.fillStyle = '#120C32';
    ctx.beginPath();
    ctx.roundRect(bx - 20, -68, 40, 32, 10);
    ctx.fill();
    ctx.fillStyle = '#FFF4E0';
    ctx.beginPath();
    ctx.arc(bx - 5, -54, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // Beat's Hollow Chest Ring Lit Warm Amber by Spark's Heartbeat
  ctx.beginPath();
  ctx.arc(0, 32, 46, 0, Math.PI * 2);
  ctx.fillStyle = '#120C32';
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#FFB23E';
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#FFF4E0';
  ctx.stroke();

  // Floating 3D Audio Mixing Console & Holographic Faders in Front of Beat
  ctx.fillStyle = '#191340';
  ctx.strokeStyle = '#0D0822';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(-165, 110, 330, 68, 14);
  ctx.fill();
  ctx.stroke();

  for (let f = 0; f < 9; f++) {
    const fx = -128 + f * 32;
    const fh = 24 + ((f * 19) % 38);
    ctx.fillStyle = f % 2 === 0 ? '#FFB23E' : '#E83F8C';
    ctx.fillRect(fx, 130 - fh, 16, fh);
  }
  ctx.restore();

  // 7. Glowing Heartbeat-to-Soundwave Arc Connecting Spark & Beat
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(640, 610);
  ctx.bezierCurveTo(820, 440, 1100, 440, 1280, 580);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#FFB23E';
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#FFF4E0';
  ctx.stroke();
  ctx.restore();

  // 8. Top Story Badge & High-Impact Anime Title Banner
  ctx.save();
  ctx.fillStyle = 'rgba(14, 9, 41, 0.88)';
  ctx.strokeStyle = '#FFB23E';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(410, 42, 1100, 58, 29);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFB23E';
  ctx.font = '900 25px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'I ASKED SUNO HOW IT FEELS TO MAKE MUSIC · 4K 60FPS ANIME MUSIC VIDEO',
    960,
    80
  );

  // Main 3D-Style Title "FIND ITS GROOVE"
  ctx.font = '900 118px sans-serif';
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 24;
  ctx.strokeStyle = '#0D0822';
  ctx.strokeText('FIND ITS GROOVE', 960, 215);

  const titleGrad = ctx.createLinearGradient(400, 120, 1520, 230);
  titleGrad.addColorStop(0, '#FFB23E');
  titleGrad.addColorStop(0.5, '#FFF4E0');
  titleGrad.addColorStop(1, '#2EC4B6');
  ctx.fillStyle = titleGrad;
  ctx.fillText('FIND ITS GROOVE', 960, 215);

  // Bottom Official Credits Ribbon
  ctx.fillStyle = 'rgba(13, 8, 34, 0.92)';
  ctx.strokeStyle = '#2EC4B6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(140, 965, 1640, 78, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFF4E0';
  ctx.font = '800 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Directed by : ARK Handles Music (Aarav Kharade)   ·   Lyrics: Aarav Kharade   ·   Vocals: SUNO v6 mini   ·   Animation: Gemini Argon 4 & Aarav Kharade',
    960,
    1013
  );
  ctx.restore();

  ctx.restore();
}

interface ReleaseKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToOutroCredits: () => void;
}

export default function ReleaseKitModal({
  isOpen,
  onClose,
  onJumpToOutroCredits,
}: ReleaseKitModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedField, setCopiedField] = useState<'title' | 'desc' | 'credits' | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      renderAnimeThumbnailToCanvas(canvasRef.current);
    }
  }, [isOpen]);

  const handleDownloadThumbnail = useCallback(() => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 3840;
    exportCanvas.height = 2160;
    renderAnimeThumbnailToCanvas(exportCanvas);
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'Find-Its-Groove-4K-Anime-Thumbnail-ARK-Handles-Music.png';
    link.href = dataUrl;
    link.click();
  }, []);

  const copyText = useCallback((text: string, field: 'title' | 'desc' | 'credits') => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  }, []);

  if (!isOpen) return null;

  const creditsBlock = `Directed by : ${OFFICIAL_CREDITS.directedBy}\nLyrics: ${OFFICIAL_CREDITS.lyrics}\nVocals: ${OFFICIAL_CREDITS.vocals}\nAnimation: ${OFFICIAL_CREDITS.animation}`;

  return (
    <div
      role="dialog"
      aria-label="Official Thumbnail, Title, Description and Credits"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090619]/95 p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-[#161138] border border-[#FFF4E0]/20 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#120E2E] border-b border-[#FFF4E0]/12 shrink-0">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-[#FFB23E]" />
            <h2 className="text-base font-bold text-[#FFF4E0]">
              Official 4K Anime Thumbnail, Title, Description & End Credits
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onJumpToOutroCredits();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2EC4B6] text-[#120E2E] hover:bg-[#4cd7c9] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preview End Credits in Video (2:40)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Modal"
              className="p-1.5 rounded-lg bg-[#231C52] text-[#FFF4E0] hover:bg-[#312770] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 16:9 4K Anime Thumbnail Preview + Download + Credits Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl overflow-hidden border-2 border-[#FFB23E]/50 shadow-xl bg-[#0E0929]">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full aspect-video block"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#FFF4E0]/75 font-mono">
                Resolution: 3840 × 2160 (4K UHD 16:9 Key Visual)
              </span>
              <button
                type="button"
                onClick={handleDownloadThumbnail}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#FFB23E] text-[#120E2E] hover:bg-[#ffc466] transition-colors cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download 4K PNG Thumbnail (3840×2160)</span>
              </button>
            </div>

            {/* Official End Credits Slate */}
            <div className="p-4 rounded-xl bg-[#1E1747] border border-[#2EC4B6]/35 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2EC4B6]">
                  <Award className="w-4 h-4 text-[#FFB23E]" />
                  <span>Official End Credits (Appears in Video Outro)</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(creditsBlock, 'credits')}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-[#2A2161] text-[#FFF4E0] hover:bg-[#372B7D] transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedField === 'credits' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2EC4B6]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Credits</span>
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-[#140F33] border border-[#FFF4E0]/10">
                  <span className="text-[#FFF4E0]/60 block text-[11px]">Directed by :</span>
                  <span className="text-[#FFB23E] font-bold text-sm">
                    {OFFICIAL_CREDITS.directedBy}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#140F33] border border-[#FFF4E0]/10">
                  <span className="text-[#FFF4E0]/60 block text-[11px]">Lyrics:</span>
                  <span className="text-[#FFF4E0] font-bold text-sm">
                    {OFFICIAL_CREDITS.lyrics}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#140F33] border border-[#FFF4E0]/10">
                  <span className="text-[#FFF4E0]/60 block text-[11px]">Vocals:</span>
                  <span className="text-[#2EC4B6] font-bold text-sm">
                    {OFFICIAL_CREDITS.vocals}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#140F33] border border-[#FFF4E0]/10">
                  <span className="text-[#FFF4E0]/60 block text-[11px]">Animation:</span>
                  <span className="text-[#E83F8C] font-bold text-sm">
                    {OFFICIAL_CREDITS.animation}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Official Video Title & Full Description */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Title Box */}
            <div className="p-4 rounded-xl bg-[#1E1747] border border-[#FFF4E0]/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFB23E]">
                  Recommended Video Title
                </span>
                <button
                  type="button"
                  onClick={() => copyText(OFFICIAL_RELEASE_METADATA.primaryTitle, 'title')}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-[#2A2161] text-[#FFF4E0] hover:bg-[#372B7D] transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedField === 'title' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2EC4B6]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Title</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm font-bold text-[#FFF4E0] leading-snug select-text">
                {OFFICIAL_RELEASE_METADATA.primaryTitle}
              </p>
              <p className="text-xs text-[#2EC4B6] font-medium select-text">
                Alt: {OFFICIAL_RELEASE_METADATA.artistTitle}
              </p>
            </div>

            {/* Description Box */}
            <div className="p-4 rounded-xl bg-[#1E1747] border border-[#FFF4E0]/15 flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2EC4B6]">
                  Official Video Description & Storyline
                </span>
                <button
                  type="button"
                  onClick={() => copyText(OFFICIAL_RELEASE_METADATA.description, 'desc')}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-[#2A2161] text-[#FFF4E0] hover:bg-[#372B7D] transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copiedField === 'desc' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#2EC4B6]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Description</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-[#FFF4E0]/90 font-sans whitespace-pre-wrap leading-relaxed bg-[#120E2E] p-3.5 rounded-lg border border-[#FFF4E0]/10 max-h-[340px] overflow-y-auto select-text">
                {OFFICIAL_RELEASE_METADATA.description}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
