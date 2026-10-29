import test from 'node:test';
import assert from 'node:assert/strict';
import {SoftwareCanvas3D, renderProcedural3DFrame} from './software-3d-renderer';

test('renderProcedural3DFrame produces distinct moving 60fps 3D frames across consecutive frames', () => {
  const c1 = new SoftwareCanvas3D(640, 360);
  const c2 = new SoftwareCanvas3D(640, 360);

  renderProcedural3DFrame(c1, 1620, false);
  renderProcedural3DFrame(c2, 1635, false);

  let diffBytes = 0;
  for (let i = 0; i < c1.data.length; i++) {
    if (c1.data[i] !== c2.data[i]) {
      diffBytes++;
    }
  }

  // Consecutive frames 0.25s apart must have substantial 3D motion difference
  assert.ok(diffBytes > 50_000, `Expected >50,000 changed RGB bytes between frame 1620 and 1635, got ${diffBytes}`);
});

test('renderProcedural3DFrame renders Outro Official End Credits Slate at frame 9600', () => {
  const cNoCredits = new SoftwareCanvas3D(640, 360);
  const cWithCredits = new SoftwareCanvas3D(640, 360);

  renderProcedural3DFrame(cNoCredits, 9600, false);
  renderProcedural3DFrame(cWithCredits, 9600, true);

  let diffBytes = 0;
  for (let i = 0; i < cNoCredits.data.length; i++) {
    if (cNoCredits.data[i] !== cWithCredits.data[i]) {
      diffBytes++;
    }
  }

  assert.ok(diffBytes > 20_000, 'Expected Official End Credits Slate to alter center region pixels');
});
