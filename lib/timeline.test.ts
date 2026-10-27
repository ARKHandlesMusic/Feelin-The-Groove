import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHOTS,
  SONG_METADATA,
  parseLrc,
  getShotAtTime,
  getBeatMetrics,
  getTileIntensity,
  formatTimestamp,
} from './timeline';
import {
  KINETIC_STYLES_50,
  computeLyricLetterTransform,
} from './lyric-kinetic-50';

test('timeline shots cover 0:00 to 2:51.5 with zero gaps or overlaps', () => {
  assert.equal(SHOTS.length >= 45, true);
  assert.equal(SHOTS[0].startTime, 0);
  assert.equal(SHOTS[SHOTS.length - 1].endTime, SONG_METADATA.duration);

  for (let i = 0; i < SHOTS.length - 1; i++) {
    assert.equal(
      SHOTS[i].endTime,
      SHOTS[i + 1].startTime,
      `Gap or overlap between ${SHOTS[i].id} and ${SHOTS[i + 1].id}`
    );
  }
});

test('recurring motifs appear at exact storyline timestamps', () => {
  // Motif 1: Hollow ring close-ups at ~36.34s, ~91.56s, and ~139.11s (2:19.11)
  const ring1 = getShotAtTime(37.0);
  const ring2 = getShotAtTime(92.0);
  const ring3 = getShotAtTime(140.0);
  assert.equal(ring1.hollowRingState, 'dim');
  assert.equal(ring2.hollowRingState, 'lantern');
  assert.equal(ring3.hollowRingState, 'glowing_amber');

  // Motif 2: Deadline clock orbits in Verse 1 (from 5.36s), rises into sun in Final Chorus (128.61s), becomes noon in Outro
  assert.equal(getShotAtTime(3.0).deadlineState, 'hidden');
  assert.equal(getShotAtTime(6.0).deadlineState, 'orbiting');
  assert.equal(getShotAtTime(130.0).deadlineState, 'rising_sun');
  assert.equal(getShotAtTime(156.0).deadlineState, 'noon_sun');

  // Motif 3: Viewer pointed at ("with you") in every chorus
  assert.equal(getShotAtTime(31.5).specialOverlay, 'fourth_wall');
  assert.equal(getShotAtTime(86.5).specialOverlay, 'fourth_wall');
  assert.equal(getShotAtTime(133.0).specialOverlay, 'fourth_wall');

  // Motif 5: Opening and closing shots light only single center tile (7, 3)
  assert.equal(getTileIntensity(7, 3, 1.0) > 0.5, true);
  assert.equal(getTileIntensity(0, 0, 1.0) < 0.05, true);
  assert.equal(getTileIntensity(7, 3, 169.5) > 0.5, true);
  assert.equal(getTileIntensity(0, 0, 169.5) < 0.05, true);
});

test('parseLrc parses timestamps and lyrics accurately', () => {
  const sample = `[ar:Aarav Kharade]\n[00:02.75]You bring a tune with a crooked little rhyme,\n[02:35.23]We’ll see what it can be by noon.`;
  const parsed = parseLrc(sample);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].time, 2.75);
  assert.equal(parsed[0].text, 'You bring a tune with a crooked little rhyme,');
  assert.equal(parsed[1].time, 155.23);
});

test('getBeatMetrics freezes on pre-chorus silence beats (0:24.9 and 1:19.9)', () => {
  const freeze1 = getBeatMetrics(24.9);
  assert.equal(freeze1.isFreezeWindow, true);
  assert.equal(freeze1.snapProgress, 0);
  assert.equal(freeze1.sparkBounce, 0);

  const active = getBeatMetrics(26.0);
  assert.equal(active.isFreezeWindow, false);
});

test('formatTimestamp formats tabular time accurately', () => {
  assert.equal(formatTimestamp(0), '0:00.0');
  assert.equal(formatTimestamp(25.24), '0:25.2');
  assert.equal(formatTimestamp(139.11), '2:19.1');
});

test('all 50 3D lyric kinetic styles produce finite, non-overlapping transforms across 2 rows', () => {
  assert.equal(KINETIC_STYLES_50.length, 50);

  for (let styleId = 1; styleId <= 50; styleId++) {
    const leftChar = computeLyricLetterTransform(styleId, 0, 36, 0.5, 26.5, 18);
    const nextChar = computeLyricLetterTransform(styleId, 1, 36, 0.5, 26.5, 18);
    const row2Char = computeLyricLetterTransform(styleId, 18, 36, 0.5, 26.5, 18);

    assert.equal(Number.isFinite(leftChar.x), true, `Style ${styleId} x is finite`);
    assert.equal(Number.isFinite(leftChar.y), true, `Style ${styleId} y is finite`);
    assert.equal(Number.isFinite(leftChar.z), true, `Style ${styleId} z is finite`);
    assert.equal(leftChar.opacity >= 0.85, true, `Style ${styleId} hold opacity is legible`);
    // Adjacent letters on the same row must have clean separation (either horizontal or vertical for skyscraper stack #49)
    const distSameRow = Math.hypot(nextChar.x - leftChar.x, nextChar.y - leftChar.y);
    assert.equal(
      distSameRow >= 0.15,
      true,
      `Style ${styleId} adjacent characters have clean separation`
    );
    // Row 0 and Row 1 must be spatially distinct
    const distRows = Math.hypot(leftChar.x - row2Char.x, leftChar.y - row2Char.y);
    assert.equal(
      distRows >= 0.25,
      true,
      `Style ${styleId} separates row 0 and row 1`
    );
  }
});

