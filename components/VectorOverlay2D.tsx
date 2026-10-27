'use client';

import React from 'react';
import {ShotSpec, getBeatMetrics} from '@/lib/timeline';

interface VectorOverlay2DProps {
  currentTime: number;
  currentShot: ShotSpec;
}

export default function VectorOverlay2D({
  currentTime,
  currentShot,
}: VectorOverlay2DProps) {
  const {beatPhase, offBeatPhase, sparkBounce} = getBeatMetrics(currentTime);
  const overlay = currentShot.specialOverlay;
  const shotProgress = Math.max(
    0,
    Math.min(
      1,
      (currentTime - currentShot.startTime) /
        Math.max(0.1, currentShot.endTime - currentShot.startTime)
    )
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-10"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 900"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* 1. INTRO FALLING TILES TITLE (0:00 - 0:02.75) */}
        {overlay === 'intro_title' && (
          <g>
            {'FIND ITS GROOVE'.split('').map((char, idx) => {
              if (char === ' ') return null;
              const dropProgress = Math.min(1, Math.max(0, (currentTime - idx * 0.08) / 1.1));
              const scatter = currentTime > 2.35 ? (currentTime - 2.35) * 420 : 0;
              const x = 230 + idx * 68 + (idx % 2 === 0 ? -scatter * 0.4 : scatter * 0.4);
              const y = -120 + dropProgress * 360 - scatter * (idx % 3 === 0 ? 1 : -0.8);
              const rot = currentTime > 2.35 ? (idx - 7) * 18 * (currentTime - 2.35) : 0;
              const tileColor =
                idx % 3 === 0 ? '#FFB23E' : idx % 3 === 1 ? '#2EC4B6' : '#E83F8C';
              return (
                <g
                  key={idx}
                  transform={`translate(${x}, ${y}) rotate(${rot})`}
                >
                  <rect
                    x="-28"
                    y="-34"
                    width="56"
                    height="68"
                    rx="12"
                    fill={tileColor}
                    stroke="#FFF4E0"
                    strokeWidth="2.5"
                  />
                  <text
                    x="0"
                    y="12"
                    textAnchor="middle"
                    fill="#1B1646"
                    fontSize="36"
                    fontWeight="800"
                    fontFamily="var(--font-display), sans-serif"
                  >
                    {char}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 2. FOURTH-WALL SCREEN EDGE RIPPLES & VIEWER SPOTLIGHT (0:30.7, 1:25.9, 2:13.6) */}
        {overlay === 'fourth_wall' && (
          <g>
            {[0, 1, 2, 3].map((ringIdx) => {
              const rProgress = (shotProgress * 2 + ringIdx * 0.25) % 1;
              const rx = 250 + rProgress * 580;
              const ry = 160 + rProgress * 360;
              return (
                <rect
                  key={ringIdx}
                  x={720 - rx}
                  y={420 - ry}
                  width={rx * 2}
                  height={ry * 2}
                  rx={60}
                  fill="none"
                  stroke={ringIdx % 2 === 0 ? '#FFB23E' : '#2EC4B6'}
                  strokeWidth={6 * (1 - rProgress)}
                  opacity={0.85 * (1 - rProgress)}
                />
              );
            })}
            <circle
              cx="720"
              cy="410"
              r={190 + sparkBounce * 25}
              fill="none"
              stroke="#FFF4E0"
              strokeWidth="4"
              strokeDasharray="16 12"
              opacity="0.75"
            />
            <text
              x="720"
              y="145"
              textAnchor="middle"
              fill="#FFF4E0"
              fontSize="28"
              fontWeight="800"
              letterSpacing="4"
            >
              YOU ARE PART OF THE SONG
            </text>
          </g>
        )}

        {/* 3. SPLIT SCREEN: HEARTBEAT vs FLAW (0:32.75 & 1:27.76) */}
        {(overlay === 'split_heart_flaw' || overlay === 'split_heart_flaw_v2') && (
          <g>
            {/* Left Panel: Heartbeat */}
            <rect
              x="90"
              y="165"
              width="590"
              height="425"
              rx="28"
              fill="#1B1646"
              fillOpacity="0.9"
              stroke="#FFB23E"
              strokeWidth="4"
            />
            <text
              x="385"
              y="215"
              textAnchor="middle"
              fill="#FFB23E"
              fontSize="22"
              fontWeight="700"
              letterSpacing="2"
            >
              SOME HEAR A HEARTBEAT
            </text>
            <g
              transform={`translate(385, 385) scale(${1 + sparkBounce * 0.22})`}
            >
              <path
                d="M 0 65 C -90 -10 -105 -85 -45 -100 C -15 -108 0 -75 0 -55 C 0 -75 15 -108 45 -100 C 105 -85 90 -10 0 65 Z"
                fill="#E83F8C"
                stroke="#FFF4E0"
                strokeWidth="5"
              />
              {overlay === 'split_heart_flaw_v2' && (
                <path
                  d="M -12 -65 L 8 -25 L -8 5 L 14 42"
                  fill="none"
                  stroke="#FFB23E"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Right Panel: Cracked Note with Magnifying Glass */}
            <rect
              x="760"
              y="165"
              width="590"
              height="425"
              rx="28"
              fill="#1B1646"
              fillOpacity="0.9"
              stroke="#2EC4B6"
              strokeWidth="4"
            />
            <text
              x="1055"
              y="215"
              textAnchor="middle"
              fill="#2EC4B6"
              fontSize="22"
              fontWeight="700"
              letterSpacing="2"
            >
              SOME HEAR A FLAW
            </text>
            <g transform="translate(1055, 395)">
              <ellipse
                cx="-20"
                cy="30"
                rx="48"
                ry="34"
                transform="rotate(-20 -20 30)"
                fill="#2EC4B6"
              />
              <rect x="14" y="-95" width="14" height="125" fill="#2EC4B6" />
              <path d="M 28 -95 Q 78 -75 68 -30 L 28 -55 Z" fill="#2EC4B6" />
              {/* Crack on Note */}
              <path
                d="M -32 8 L -14 26 L -28 42 L -8 55"
                fill="none"
                stroke="#1B1646"
                strokeWidth="5"
              />
              {/* In Chorus 2, tiny glowing heart inside the crack */}
              {overlay === 'split_heart_flaw_v2' && (
                <g transform={`translate(-18, 30) scale(${0.28 + sparkBounce * 0.08})`}>
                  <path
                    d="M 0 65 C -90 -10 -105 -85 -45 -100 C -15 -108 0 -75 0 -55 C 0 -75 15 -108 45 -100 C 105 -85 90 -10 0 65 Z"
                    fill="#FFB23E"
                    stroke="#FFF4E0"
                    strokeWidth="6"
                  />
                </g>
              )}
              {/* Hovering Magnifying Glass */}
              <g
                transform={`translate(${Math.sin(currentTime * 4) * 18}, ${Math.cos(currentTime * 3) * 12})`}
              >
                <circle
                  cx="-18"
                  cy="28"
                  r="58"
                  fill="#FFF4E0"
                  fillOpacity="0.14"
                  stroke="#FFF4E0"
                  strokeWidth="6"
                />
                <line
                  x1="24"
                  y1="70"
                  x2="75"
                  y2="120"
                  stroke="#FFB23E"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </g>
        )}

        {/* 4. SPLIT SCREEN: MORE (GLITTER) vs RAW (BARE OUTLINE) (0:34.55 & 1:29.59) */}
        {(overlay === 'split_more_raw' || overlay === 'split_more_raw_v2') && (
          <g>
            <rect
              x="140"
              y="165"
              width="1160"
              height="425"
              rx="28"
              fill="#1B1646"
              fillOpacity="0.88"
              stroke="#FFF4E0"
              strokeWidth="3"
            />
            {overlay === 'split_more_raw' && (
              <line
                x1="720"
                y1="165"
                x2="720"
                y2="590"
                stroke="#FFF4E0"
                strokeWidth="3"
                strokeDasharray="10 10"
              />
            )}
            {/* Left Note: Glittery "A LITTLE MORE" */}
            <g transform="translate(440, 395)">
              <text
                x="0"
                y="-175"
                textAnchor="middle"
                fill="#FFB23E"
                fontSize="22"
                fontWeight="700"
              >
                A LITTLE MORE (GLITTER)
              </text>
              <ellipse
                cx="-18"
                cy="30"
                rx="48"
                ry="34"
                transform="rotate(-20 -18 30)"
                fill="#FFB23E"
                stroke="#FFF4E0"
                strokeWidth="4"
              />
              <rect x="16" y="-95" width="14" height="125" fill="#FFB23E" />
              <path d="M 30 -95 Q 82 -75 70 -30 L 30 -55 Z" fill="#E83F8C" />
              {/* Sparkling glitter stars */}
              {[-65, -35, 0, 42, 72, -50, 55].map((gx, idx) => (
                <circle
                  key={idx}
                  cx={gx}
                  cy={-60 + ((idx * 37) % 130)}
                  r={5 + ((idx + Math.floor(beatPhase * 4)) % 5)}
                  fill={idx % 2 === 0 ? '#FFF4E0' : '#E83F8C'}
                />
              ))}
            </g>

            {/* Right Note: Bare Outline "SOME WANT IT RAW" */}
            <g transform="translate(1000, 365)">
              <text
                x="0"
                y="-175"
                textAnchor="middle"
                fill="#FFF4E0"
                fontSize="22"
                fontWeight="700"
              >
                SOME WANT IT RAW (BARE OUTLINE)
              </text>
              <ellipse
                cx="-18"
                cy="30"
                rx="48"
                ry="34"
                transform="rotate(-20 -18 30)"
                fill="none"
                stroke="#FFF4E0"
                strokeWidth="4"
                strokeDasharray="8 5"
              />
              <rect
                x="16"
                y="-95"
                width="14"
                height="125"
                fill="none"
                stroke="#FFF4E0"
                strokeWidth="4"
              />
              <path
                d="M 30 -95 Q 82 -75 70 -30 L 30 -55 Z"
                fill="none"
                stroke="#2EC4B6"
                strokeWidth="4"
              />
            </g>
          </g>
        )}

        {/* 5. "GROOVE" FLASH IN TILES ON THE BEAT (0:39.9 & 1:35.0) */}
        {overlay === 'groove_tiles' && (
          <g transform="translate(720, 165)">
            {'GROOVE'.split('').map((ch, idx) => {
              const x = (idx - 2.5) * 92;
              const pulse = 1 + (idx % 2 === 0 ? sparkBounce : offBeatPhase) * 0.16;
              return (
                <g key={idx} transform={`translate(${x}, 0) scale(${pulse})`}>
                  <rect
                    x="-38"
                    y="-42"
                    width="76"
                    height="84"
                    rx="14"
                    fill={idx % 2 === 0 ? '#2EC4B6' : '#FFB23E'}
                    stroke="#FFF4E0"
                    strokeWidth="3"
                  />
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    fill="#1B1646"
                    fontSize="42"
                    fontWeight="800"
                  >
                    {ch}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 6. GUITAR STAB ZIG-ZAG WIPES & KEYBOARD STAR PINGS (0:48 - 0:53) */}
        {overlay === 'zigzag_guitar' && (
          <g>
            <polyline
              points="120,90 340,240 240,390 540,560 420,760"
              fill="none"
              stroke="#E83F8C"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.45 + 0.5 * (1 - beatPhase)}
            />
            <polyline
              points="1320,110 1090,280 1200,430 920,600 1040,780"
              fill="none"
              stroke="#FFB23E"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.45 + 0.5 * offBeatPhase}
            />
            {/* Keyboard Star Pings */}
            {[
              [280, 180],
              [1140, 210],
              [360, 520],
              [1080, 490],
            ].map(([sx, sy], i) => {
              const sScale = 0.6 + ((beatPhase + i * 0.25) % 1) * 0.9;
              return (
                <g
                  key={i}
                  transform={`translate(${sx}, ${sy}) scale(${sScale}) rotate(${currentTime * 90})`}
                >
                  <polygon
                    points="0,-28 8,-8 28,0 8,8 0,28 -8,8 -28,0 -8,-8"
                    fill="#FFF4E0"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 7. VINYL FLOOR FLIP & RECORD-SCRATCH WIPE (0:53 - 0:56.87) */}
        {overlay === 'vinyl_wipe' && (
          <g transform="translate(720, 420)">
            {[140, 220, 300, 380].map((r, idx) => (
              <circle
                key={idx}
                cx="0"
                cy="0"
                r={r}
                fill="none"
                stroke={idx % 2 === 0 ? '#FFB23E' : '#2EC4B6'}
                strokeWidth="4"
                strokeDasharray="45 25"
                transform={`rotate(${currentTime * (idx % 2 === 0 ? 160 : -140)})`}
                opacity="0.7"
              />
            ))}
          </g>
        )}

        {/* 8. VERSE 2 BELL QUESTION MARKS (1:04.15 - 1:07.21) */}
        {overlay === 'bell_questions' && (
          <g>
            {[-180, -60, 80, 210].map((dx, i) => {
              const floatY = 230 - ((currentTime * 60 + i * 40) % 110);
              return (
                <text
                  key={i}
                  x={640 + dx}
                  y={floatY}
                  fill={i % 2 === 0 ? '#FFB23E' : '#FFF4E0'}
                  fontSize="52"
                  fontWeight="800"
                >
                  ?
                </text>
              );
            })}
          </g>
        )}

        {/* 9. PRE-CHORUS 2 SPINNING COLOR WHEEL (1:11.50 - 1:14.39) */}
        {overlay === 'color_wheel' && (
          <g transform={`translate(720, 210) rotate(${currentTime * 150})`}>
            <circle cx="0" cy="0" r="88" fill="#1B1646" stroke="#FFF4E0" strokeWidth="5" />
            <path d="M 0 0 L 0 -80 A 80 80 0 0 1 80 0 Z" fill="#2EC4B6" />
            <path d="M 0 0 L 80 0 A 80 80 0 0 1 0 80 Z" fill="#FF6B6B" />
            <path d="M 0 0 L 0 80 A 80 80 0 0 1 -80 0 Z" fill="#FFB23E" />
            <path d="M 0 0 L -80 0 A 80 80 0 0 1 0 -80 Z" fill="#E83F8C" />
            <circle cx="0" cy="0" r="22" fill="#FFF4E0" />
          </g>
        )}

        {/* 10. FINAL CHORUS CREAM FLASH & MEMORY COLLAGE (2:23.20 - 2:31.10) */}
        {overlay === 'cream_flash_collage' && (
          <g>
            {shotProgress < 0.18 && (
              <rect
                x="0"
                y="0"
                width="1440"
                height="900"
                fill="#FFF4E0"
                opacity={Math.max(0, 0.85 - shotProgress * 4.5)}
              />
            )}
            {shotProgress >= 0.12 && shotProgress < 0.72 && (
              <g opacity="0.88">
                <rect
                  x="90"
                  y="110"
                  width="320"
                  height="180"
                  rx="18"
                  fill="#1B1646"
                  stroke="#FFB23E"
                  strokeWidth="3"
                />
                <text x="250" y="185" textAnchor="middle" fill="#FFB23E" fontSize="18" fontWeight="700">
                  01 · CROOKED RHYME SQUIGGLE
                </text>
                <path
                  d="M 140 230 Q 190 195 240 235 T 340 220"
                  fill="none"
                  stroke="#FFB23E"
                  strokeWidth="5"
                />

                <rect
                  x="1030"
                  y="110"
                  width="320"
                  height="180"
                  rx="18"
                  fill="#1B1646"
                  stroke="#2EC4B6"
                  strokeWidth="3"
                />
                <text x="1190" y="185" textAnchor="middle" fill="#2EC4B6" fontSize="18" fontWeight="700">
                  02 · SHARPER SNEAKER SHOES
                </text>
                <circle cx="1190" cy="235" r="22" fill="#2EC4B6" />

                <rect
                  x="90"
                  y="330"
                  width="320"
                  height="180"
                  rx="18"
                  fill="#1B1646"
                  stroke="#E83F8C"
                  strokeWidth="3"
                />
                <text x="250" y="405" textAnchor="middle" fill="#E83F8C" fontSize="18" fontWeight="700">
                  03 · BRIDGE MEANING DRAFT
                </text>
                <circle cx="250" cy="455" r="24" fill="none" stroke="#FFF4E0" strokeWidth="4" strokeDasharray="6 4" />

                <rect
                  x="1030"
                  y="330"
                  width="320"
                  height="180"
                  rx="18"
                  fill="#1B1646"
                  stroke="#FFF4E0"
                  strokeWidth="3"
                />
                <text x="1190" y="405" textAnchor="middle" fill="#FFF4E0" fontSize="18" fontWeight="700">
                  04 · DOUBLE HEARTBEAT SYNC
                </text>
                <circle cx="1165" cy="455" r="20" fill="#FFB23E" />
                <circle cx="1215" cy="455" r="20" fill="none" stroke="#2EC4B6" strokeWidth="5" />
              </g>
            )}
          </g>
        )}

        {/* 11. OFFICIAL END CREDITS SLATE IN OUTRO (2:37.5 - 2:51.5) */}
        {currentTime >= 157.5 && (
          <g
            data-testid="outro-end-credits"
            transform={`translate(720, ${395 - Math.min(1, (currentTime - 157.5) / 0.8) * 15})`}
            opacity={Math.min(1, (currentTime - 157.5) / 0.6)}
          >
            {/* Outer Anime Cel-Shaded Drop Shadow */}
            <rect
              x="-442"
              y="-162"
              width="896"
              height="336"
              rx="26"
              fill="#0D0822"
              opacity="0.92"
            />
            {/* Main Credits Card */}
            <rect
              x="-450"
              y="-170"
              width="896"
              height="336"
              rx="26"
              fill="#140F36"
              fillOpacity="0.94"
              stroke="#FFB23E"
              strokeWidth="5"
            />
            <rect
              x="-436"
              y="-156"
              width="868"
              height="308"
              rx="20"
              fill="none"
              stroke="#2EC4B6"
              strokeWidth="2"
              strokeOpacity="0.55"
            />

            {/* Header */}
            <text
              x="0"
              y="-112"
              textAnchor="middle"
              fill="#FFB23E"
              fontSize="20"
              fontWeight="800"
              letterSpacing="4"
            >
              FIND ITS GROOVE · OFFICIAL END CREDITS
            </text>
            <line
              x1="-340"
              y1="-92"
              x2="340"
              y2="-92"
              stroke="#FFF4E0"
              strokeOpacity="0.2"
              strokeWidth="2"
            />

            {/* Credit Row 1: Directed by */}
            <text
              x="-380"
              y="-44"
              textAnchor="start"
              fill="#2EC4B6"
              fontSize="24"
              fontWeight="800"
            >
              Directed by :
            </text>
            <text
              x="380"
              y="-44"
              textAnchor="end"
              fill="#FFF4E0"
              fontSize="26"
              fontWeight="900"
            >
              ARK Handles Music (Aarav Kharade)
            </text>

            {/* Credit Row 2: Lyrics */}
            <text
              x="-380"
              y="8"
              textAnchor="start"
              fill="#FFB23E"
              fontSize="24"
              fontWeight="800"
            >
              Lyrics:
            </text>
            <text
              x="380"
              y="8"
              textAnchor="end"
              fill="#FFF4E0"
              fontSize="26"
              fontWeight="900"
            >
              Aarav Kharade
            </text>

            {/* Credit Row 3: Vocals */}
            <text
              x="-380"
              y="60"
              textAnchor="start"
              fill="#E83F8C"
              fontSize="24"
              fontWeight="800"
            >
              Vocals:
            </text>
            <text
              x="380"
              y="60"
              textAnchor="end"
              fill="#FFF4E0"
              fontSize="26"
              fontWeight="900"
            >
              SUNO v6 mini
            </text>

            {/* Credit Row 4: Animation */}
            <text
              x="-380"
              y="112"
              textAnchor="start"
              fill="#2EC4B6"
              fontSize="24"
              fontWeight="800"
            >
              Animation:
            </text>
            <text
              x="380"
              y="112"
              textAnchor="end"
              fill="#FFB23E"
              fontSize="26"
              fontWeight="900"
            >
              Gemini Argon 4 and Aarav Kharade
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
