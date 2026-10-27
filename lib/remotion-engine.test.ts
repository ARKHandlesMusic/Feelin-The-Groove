import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REMOTION_CONFIG,
  REMOTION_SEQUENCES,
  SHOT_SEQUENCES,
  frameToSeconds,
  secondsToFrame,
  interpolate,
  spring,
  getSequenceAtFrame,
  getShotSequenceAtFrame,
  evaluateRemotionFrameState,
} from './remotion-engine';

test('REMOTION_CONFIG configures 4K UHD (3840x2160) at 60 FPS for 10,290 frames', () => {
  assert.equal(REMOTION_CONFIG.id, 'FindItsGroove4K60');
  assert.equal(REMOTION_CONFIG.width, 3840);
  assert.equal(REMOTION_CONFIG.height, 2160);
  assert.equal(REMOTION_CONFIG.fps, 60);
  assert.equal(REMOTION_CONFIG.durationInFrames, 10290);
});

test('frameToSeconds and secondsToFrame round-trip accurately at 60 FPS', () => {
  assert.equal(frameToSeconds(0), 0);
  assert.equal(frameToSeconds(60), 1);
  assert.equal(frameToSeconds(1515), 25.25);
  assert.equal(secondsToFrame(0), 0);
  assert.equal(secondsToFrame(1), 60);
  assert.equal(secondsToFrame(160), 9600);
});

test('interpolate handles clamping, linear mapping, and multi-segment ranges', () => {
  assert.equal(interpolate(0, [0, 60], [10, 70]), 10);
  assert.equal(interpolate(30, [0, 60], [10, 70]), 40);
  assert.equal(interpolate(60, [0, 60], [10, 70]), 70);
  assert.equal(
    interpolate(-20, [0, 60], [10, 70], {extrapolateLeft: 'clamp'}),
    10
  );
  assert.equal(
    interpolate(120, [0, 60], [10, 70], {extrapolateRight: 'clamp'}),
    70
  );
});

test('spring evaluates deterministically at any frame', () => {
  const f0 = spring({frame: 0, fps: 60, from: 0, to: 1});
  const f15 = spring({frame: 15, fps: 60, from: 0, to: 1});
  const f120 = spring({frame: 120, fps: 60, from: 0, to: 1});
  assert.equal(f0, 0);
  assert.ok(f15 > 0.3 && f15 < 1.3);
  assert.ok(Math.abs(f120 - 1) < 0.01);
});

test('REMOTION_SEQUENCES and SHOT_SEQUENCES cover all 10,290 frames without gaps or overlaps', () => {
  assert.equal(REMOTION_SEQUENCES.length, 12);
  assert.equal(SHOT_SEQUENCES.length, 46);
  assert.equal(REMOTION_SEQUENCES[0].from, 0);
  assert.equal(SHOT_SEQUENCES[0].from, 0);

  let totalChapterFrames = 0;
  for (let i = 0; i < REMOTION_SEQUENCES.length; i++) {
    const seq = REMOTION_SEQUENCES[i];
    assert.ok(seq.durationInFrames > 0);
    if (i > 0) {
      const prev = REMOTION_SEQUENCES[i - 1];
      assert.equal(seq.from, prev.from + prev.durationInFrames);
    }
    totalChapterFrames += seq.durationInFrames;
  }
  assert.equal(totalChapterFrames, REMOTION_CONFIG.durationInFrames);

  let totalShotFrames = 0;
  for (let i = 0; i < SHOT_SEQUENCES.length; i++) {
    const seq = SHOT_SEQUENCES[i];
    assert.ok(seq.durationInFrames > 0);
    if (i > 0) {
      const prev = SHOT_SEQUENCES[i - 1];
      assert.equal(seq.from, prev.from + prev.durationInFrames);
    }
    totalShotFrames += seq.durationInFrames;
  }
  assert.equal(totalShotFrames, REMOTION_CONFIG.durationInFrames);
});

test('evaluateRemotionFrameState resolves active Chapter Sequence and Shot Sequence at key timestamps', () => {
  const introState = evaluateRemotionFrameState(0);
  assert.equal(introState.chapterSequence.section, 'intro');
  assert.equal(introState.shotSequence.shot.id, 'shot_01_intro');

  const chorus1State = evaluateRemotionFrameState(secondsToFrame(26.0));
  assert.equal(chorus1State.chapterSequence.section, 'chorus1');

  const workshopState = evaluateRemotionFrameState(secondsToFrame(60.0));
  assert.equal(workshopState.chapterSequence.section, 'verse2');

  const outroState = evaluateRemotionFrameState(secondsToFrame(160.0));
  assert.equal(outroState.chapterSequence.section, 'outro');
  assert.equal(getSequenceAtFrame(9600).section, 'outro');
  assert.ok(getShotSequenceAtFrame(9600).shot.startTime <= 160.0);
});
