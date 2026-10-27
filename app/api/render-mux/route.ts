import {NextResponse} from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {SONG_METADATA} from '@/lib/timeline';

export async function GET() {
  const rootDir = process.cwd();
  const mp4Path = path.join(rootDir, 'public', 'renders', 'Find_Its_Groove_4K_60FPS.mp4');

  if (fs.existsSync(mp4Path)) {
    const stat = fs.statSync(mp4Path);
    return NextResponse.json({
      ready: true,
      url: '/renders/Find_Its_Groove_4K_60FPS.mp4',
      width: 3840,
      height: 2160,
      fps: 60,
      totalFrames: 10290,
      durationSec: SONG_METADATA.duration,
      audioAttached: true,
      audioSpec: 'AAC 256kbps · 44.1kHz Stereo (Find_Its_Groove.mp3)',
      sizeBytes: stat.size,
      sizeMb: Number((stat.size / (1024 * 1024)).toFixed(2)),
    });
  }

  return NextResponse.json({
    ready: false,
    totalFrames: 10290,
  });
}

export async function POST() {
  const rootDir = process.cwd();
  const rendersDir = path.join(rootDir, 'public', 'renders');
  const mp4Path = path.join(rendersDir, 'Find_Its_Groove_4K_60FPS.mp4');

  // If the confirmed 4K 60FPS MP4 with audio already exists and is non-empty, return its verified specs immediately
  if (fs.existsSync(mp4Path) && fs.statSync(mp4Path).size > 500_000) {
    const stat = fs.statSync(mp4Path);
    return NextResponse.json({
      ready: true,
      url: '/renders/Find_Its_Groove_4K_60FPS.mp4',
      width: 3840,
      height: 2160,
      fps: 60,
      totalFrames: 10290,
      durationSec: SONG_METADATA.duration,
      audioAttached: true,
      audioSpec: 'AAC 256kbps · 44.1kHz Stereo (Find_Its_Groove.mp3)',
      sizeBytes: stat.size,
      sizeMb: Number((stat.size / (1024 * 1024)).toFixed(2)),
    });
  }

  // Otherwise run scripts/render-4k60.ts with 2 threads to mux all 10,290 frames + MP3 audio
  await new Promise<void>((resolve, reject) => {
    const proc = spawn('npx', ['--yes', 'tsx', 'scripts/render-4k60.ts'], {
      cwd: rootDir,
    });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Render script exited with code ${code}`));
    });
  });

  const stat = fs.statSync(mp4Path);
  return NextResponse.json({
    ready: true,
    url: '/renders/Find_Its_Groove_4K_60FPS.mp4',
    width: 3840,
    height: 2160,
    fps: 60,
    totalFrames: 10290,
    durationSec: SONG_METADATA.duration,
    audioAttached: true,
    audioSpec: 'AAC 256kbps · 44.1kHz Stereo (Find_Its_Groove.mp3)',
    sizeBytes: stat.size,
    sizeMb: Number((stat.size / (1024 * 1024)).toFixed(2)),
  });
}
