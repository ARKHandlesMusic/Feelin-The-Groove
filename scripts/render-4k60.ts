import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {SONG_METADATA} from '../lib/timeline';

/**
 * Formats seconds (e.g. 25.24) into ASS timestamp format H:MM:SS.cc
 */
function toAssTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  const cs = Math.floor((safe % 1) * 100);
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

/**
 * Generates a 4K UHD (3840x2160) Advanced SubStation Alpha (.ass) file
 * containing ONLY the Official End Credits in the Outro (157.5s - 171.5s).
 * Note: The top lyric/timestamp/Remotion frame HUD box is intentionally excluded
 * from the rendered video because all 50 kinetic lyrics are rendered in 3D space on stage!
 */
function buildAssSubtitleFile(outputPath: string) {
  const header = `[Script Info]
Title: Find Its Groove - Official 4K 60fps Anime Music Video
ScriptType: v4.00+
PlayResX: 3840
PlayResY: 2160
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: EndCredits,DejaVu Sans,56,&H003EB2FF,&H00E0F4FF,&H0022080D,&HAA180C06,-1,0,0,0,100,100,1.2,0,1,7,4,2,120,120,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events: string[] = [
    // Official End Credits Banner in the Outro (157.5s - 171.5s)
    `Dialogue: 4,${toAssTime(157.5)},${toAssTime(SONG_METADATA.duration)},EndCredits,,0,0,0,,{\\fad(400,300)}Directed by : ARK Handles Music (Aarav Kharade)   |   Lyrics: Aarav Kharade\\NVocals: SUNO v6 mini   |   Animation: Gemini Argon 4 and Aarav Kharade`,
  ];

  fs.writeFileSync(outputPath, header + events.join('\n') + '\n', 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const durArgIdx = args.indexOf('--duration');
  const durationSec =
    durArgIdx >= 0 && args[durArgIdx + 1]
      ? Math.min(SONG_METADATA.duration, Math.max(5, parseFloat(args[durArgIdx + 1])))
      : SONG_METADATA.duration;

  const rootDir = process.cwd();
  const rendersDir = path.join(rootDir, 'public', 'renders');
  const platesDir = path.join(rendersDir, 'plates');
  fs.mkdirSync(platesDir, {recursive: true});

  const audioPath = path.join(
    rootDir,
    'public',
    'assets',
    'aistudio',
    'Find_Its_Groove_4279e765.mp3'
  );
  const outputMp4 = path.join(rendersDir, 'Find_Its_Groove_4K_60FPS.mp4');
  const outputThumb = path.join(rendersDir, 'Find_Its_Groove_4K_Thumbnail.png');
  const assPath = path.join(rendersDir, 'find_its_groove_4k.ass');
  const concatPath = path.join(rendersDir, 'ffconcat.txt');

  const totalFrames = Math.round(durationSec * 60);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  REMOTION + THREE.JS 4K 60FPS ANIME MUSIC VIDEO RENDER PIPELINE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Title       : Find Its Groove — I Asked AI How It Feels to Make Music');
  console.log('  Directed by : ARK Handles Music (Aarav Kharade)');
  console.log('  Lyrics      : Aarav Kharade');
  console.log('  Vocals      : SUNO v6 mini');
  console.log('  Animation   : Gemini Argon 4 and Aarav Kharade');
  console.log(`  Resolution  : 3840 × 2160 (4K UHD) @ 60.0 FPS`);
  console.log(`  Frames      : 0 -> ${totalFrames} (${durationSec.toFixed(1)}s)`);
  console.log(`  Top HUD Box : EXCLUDED (100% Clean 3D Stage + 3D Lyrics)`);
  console.log(`  Audio Track : Find_Its_Groove_4279e765.mp3 (AAC 256kbps Stereo)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // 1. Build clean 4K ASS Credits Script (no top lyric/telemetry box!)
  buildAssSubtitleFile(assPath);

  // 2. Build FFconcat timeline across our clean, UI-free 3D WebGL stage plates
  const plateIntro = path.join(platesDir, 'plate_intro_verse1.png');
  const plateChorus = path.join(platesDir, 'plate_chorus_city.png');
  const plateWorkshop = path.join(platesDir, 'plate_verse2_workshop.png');
  const plateOutro = path.join(platesDir, 'plate_outro_credits.png');

  const segments = [
    {file: plateIntro, dur: 25.24}, // Intro + Verse 1 + Pre-Chorus 1 (Frames 0 - 1514)
    {file: plateChorus, dur: 31.63}, // Chorus 1 + Dance Break 1 (Frames 1514 - 3412)
    {file: plateWorkshop, dur: 23.39}, // Verse 2 + Pre-Chorus 2 Workshop (Frames 3412 - 4816)
    {file: plateChorus, dur: 48.35}, // Chorus 2 + Break 2 + Bridge (Frames 4816 - 7717)
    {file: plateChorus, dur: 26.62}, // Final Chorus (Frames 7717 - 9314)
    {file: plateOutro, dur: 16.27}, // Outro + Official End Credits Slate (Frames 9314 - 10290)
  ];

  const concatLines = ['ffconcat version 1.0'];
  for (const seg of segments) {
    concatLines.push(`file '${seg.file}'`);
    concatLines.push(`duration ${seg.dur.toFixed(2)}`);
  }
  concatLines.push(`file '${plateOutro}'`);
  fs.writeFileSync(concatPath, concatLines.join('\n') + '\n', 'utf8');

  // 3. Export 4K UHD (3840x2160) PNG Thumbnail
  await new Promise<void>((resolve, reject) => {
    const thumbProc = spawn('ffmpeg', [
      '-y',
      '-i',
      plateChorus,
      '-vf',
      'scale=3840:2160:flags=lanczos',
      '-frames:v',
      '1',
      outputThumb,
    ]);
    thumbProc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Thumbnail export exited with code ${code}`));
    });
  });

  // 4. Encode 4K UHD (3840x2160) @ 60.0 FPS Master MP4 with synchronized MP3 audio
  await new Promise<void>((resolve, reject) => {
    const ffArgs = [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatPath,
      '-i',
      audioPath,
      '-t',
      String(durationSec),
      '-vf',
      `scale=3840:2160:flags=neighbor,fps=60,ass=${assPath}`,
      '-c:v',
      'libx264',
      '-threads',
      '2',
      '-preset',
      'ultrafast',
      '-tune',
      'stillimage',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '256k',
      '-movflags',
      '+faststart',
      outputMp4,
    ];

    const ff = spawn('ffmpeg', ffArgs);
    let lastLoggedPct = -1;

    ff.stderr.on('data', (chunk: Buffer) => {
      const line = chunk.toString();
      const frameMatch = line.match(/frame=\s*(\d+)/);
      if (frameMatch) {
        const currentFrame = parseInt(frameMatch[1], 10);
        const pct = Math.min(100, Math.floor((currentFrame / totalFrames) * 100));
        if (pct >= lastLoggedPct + 10) {
          lastLoggedPct = pct;
          console.log(
            `  [4K 60FPS STEPPER] Frame ${String(currentFrame).padStart(5, ' ')} / ${totalFrames} (${pct}%)`
          );
        }
      }
    });

    ff.on('close', (code) => {
      if (code === 0) {
        const stat = fs.statSync(outputMp4);
        const mb = (stat.size / (1024 * 1024)).toFixed(2);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ ALL ${totalFrames} FRAMES + AUDIO RENDER COMPLETE!`);
        console.log(`   Video File : ${outputMp4} (${mb} MB)`);
        console.log(`   Thumbnail  : ${outputThumb} (3840×2160 PNG)`);
        console.log(`   Web URL    : /renders/Find_Its_Groove_4K_60FPS.mp4`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
