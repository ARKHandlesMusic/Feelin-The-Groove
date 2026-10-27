import test from 'node:test';
import assert from 'node:assert/strict';
import {KINETIC_STYLES_50, computeLyricLetterTransform} from './lyric-kinetic-50';

test('KINETIC_STYLES_50 contains exactly 50 unique 3D lyric animation styles', () => {
  assert.equal(KINETIC_STYLES_50.length, 50);
  const ids = new Set(KINETIC_STYLES_50.map((s) => s.id));
  const codes = new Set(KINETIC_STYLES_50.map((s) => s.code));
  assert.equal(ids.size, 50);
  assert.equal(codes.size, 50);
});

test('all 50 kinetic styles produce finite 3D letter transforms for entry, hold, and exit', () => {
  for (let styleId = 1; styleId <= 50; styleId++) {
    for (const progress of [0.05, 0.5, 0.92]) {
      const tr = computeLyricLetterTransform(styleId, 4, 24, progress, 32.5);
      assert.equal(Number.isFinite(tr.x), true, `Non-finite x for style ${styleId}`);
      assert.equal(Number.isFinite(tr.y), true, `Non-finite y for style ${styleId}`);
      assert.equal(Number.isFinite(tr.z), true, `Non-finite z for style ${styleId}`);
      assert.equal(Number.isFinite(tr.rx), true, `Non-finite rx for style ${styleId}`);
      assert.equal(Number.isFinite(tr.ry), true, `Non-finite ry for style ${styleId}`);
      assert.equal(Number.isFinite(tr.rz), true, `Non-finite rz for style ${styleId}`);
      assert.equal(tr.sx > 0 && Number.isFinite(tr.sx), true, `Invalid sx for style ${styleId}`);
      assert.equal(tr.sy > 0 && Number.isFinite(tr.sy), true, `Invalid sy for style ${styleId}`);
      assert.equal(tr.opacity > 0 && tr.opacity <= 1, true, `Invalid opacity for style ${styleId}`);
    }
  }
});
