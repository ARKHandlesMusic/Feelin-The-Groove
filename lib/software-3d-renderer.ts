import {SHOTS, getBeatMetrics, getShotAtTime, getTileIntensity} from './timeline';

/**
 * Pure TypeScript Low-VRAM 1-Frame-at-a-Time 3D Perspective Stage & Character Rasterizer.
 * Renders any exact frame `frameIndex` (t = frameIndex / 60) into a single reusable RGB24 buffer
 * with zero external browser or pre-captured file dependencies.
 */

// 5x7 crisp bitmap font for uppercase, lowercase (mapped cleanly), digits, and punctuation
const FONT_5X7: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1c, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1c],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x12, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ':': [0x00, 0x04, 0x04, 0x00, 0x04, 0x04, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x06],
  ',': [0x00, 0x00, 0x00, 0x00, 0x06, 0x04, 0x08],
  "'": [0x04, 0x04, 0x08, 0x00, 0x00, 0x00, 0x00],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  '·': [0x00, 0x00, 0x00, 0x06, 0x06, 0x00, 0x00],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  if (Number.isNaN(num)) return [27, 22, 70];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  const c = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * c),
    Math.round(a[1] + (b[1] - a[1]) * c),
    Math.round(a[2] + (b[2] - a[2]) * c),
  ];
}

export class SoftwareCanvas3D {
  public readonly width: number;
  public readonly height: number;
  public readonly data: Uint8Array;

  // Camera state
  private camPos: [number, number, number] = [0, 3.2, 10.5];
  private camRight: [number, number, number] = [1, 0, 0];
  private camUp: [number, number, number] = [0, 1, 0];
  private camFwd: [number, number, number] = [0, 0, -1];
  private focalLength: number = 900;

  constructor(width: number = 1280, height: number = 720) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 3);
  }

  public setCamera(
    pos: [number, number, number],
    target: [number, number, number],
    fovDeg: number,
    rollRad: number = 0
  ): void {
    this.camPos = pos;
    let fx = target[0] - pos[0];
    let fy = target[1] - pos[1];
    let fz = target[2] - pos[2];
    const fLen = Math.hypot(fx, fy, fz) || 1;
    fx /= fLen;
    fy /= fLen;
    fz /= fLen;
    this.camFwd = [fx, fy, fz];

    const worldUpX = Math.sin(rollRad);
    const worldUpY = Math.cos(rollRad);
    const worldUpZ = 0;

    // right = cross(fwd, worldUp)
    let rx = fy * worldUpZ - fz * worldUpY;
    let ry = fz * worldUpX - fx * worldUpZ;
    let rz = fx * worldUpY - fy * worldUpX;
    const rLen = Math.hypot(rx, ry, rz) || 1;
    rx /= rLen;
    ry /= rLen;
    rz /= rLen;
    this.camRight = [rx, ry, rz];

    // up = cross(right, fwd)
    const ux = ry * fz - rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy - ry * fx;
    this.camUp = [ux, uy, uz];

    const fovRad = (fovDeg * Math.PI) / 180;
    this.focalLength = (this.height * 0.5) / Math.tan(fovRad * 0.5);
  }

  public project(
    wx: number,
    wy: number,
    wz: number
  ): {sx: number; sy: number; cz: number; scale: number} | null {
    const dx = wx - this.camPos[0];
    const dy = wy - this.camPos[1];
    const dz = wz - this.camPos[2];

    const cx = dx * this.camRight[0] + dy * this.camRight[1] + dz * this.camRight[2];
    const cy = dx * this.camUp[0] + dy * this.camUp[1] + dz * this.camUp[2];
    const cz = dx * this.camFwd[0] + dy * this.camFwd[1] + dz * this.camFwd[2];

    if (cz <= 0.25) return null;
    const scale = this.focalLength / cz;
    const sx = this.width * 0.5 + cx * scale;
    const sy = this.height * 0.5 - cy * scale;
    return {sx, sy, cz, scale};
  }

  public fillBackgroundGradient(topRgb: RGB, bottomRgb: RGB, sunGlowPhase: number): void {
    const W = this.width;
    const H = this.height;
    const d = this.data;

    const sunX = W * 0.24;
    const sunY = H * 0.18;
    const sunR = W * 0.42;
    const sunR2 = sunR * sunR;

    for (let y = 0; y < H; y++) {
      const ty = y / H;
      const baseR = topRgb[0] + (bottomRgb[0] - topRgb[0]) * ty;
      const baseG = topRgb[1] + (bottomRgb[1] - topRgb[1]) * ty;
      const baseB = topRgb[2] + (bottomRgb[2] - topRgb[2]) * ty;
      const dy = y - sunY;
      const dy2 = dy * dy;
      let rowIdx = y * W * 3;

      for (let x = 0; x < W; x++) {
        const dx = x - sunX;
        const dist2 = dx * dx + dy2;
        if (dist2 < sunR2) {
          const glow = (1 - dist2 / sunR2) * 0.24 * sunGlowPhase;
          d[rowIdx] = Math.min(255, Math.round(baseR + 255 * glow));
          d[rowIdx + 1] = Math.min(255, Math.round(baseG + 178 * glow));
          d[rowIdx + 2] = Math.min(255, Math.round(baseB + 62 * glow));
        } else {
          d[rowIdx] = baseR;
          d[rowIdx + 1] = baseG;
          d[rowIdx + 2] = baseB;
        }
        rowIdx += 3;
      }
    }
  }

  public fillRect(x0: number, y0: number, w: number, h: number, rgb: RGB, alpha: number = 1): void {
    const W = this.width;
    const H = this.height;
    const startX = Math.max(0, Math.floor(x0));
    const endX = Math.min(W - 1, Math.floor(x0 + w));
    const startY = Math.max(0, Math.floor(y0));
    const endY = Math.min(H - 1, Math.floor(y0 + h));
    if (startX > endX || startY > endY) return;

    const d = this.data;
    const [r, g, b] = rgb;

    if (alpha >= 0.99) {
      for (let y = startY; y <= endY; y++) {
        let idx = (y * W + startX) * 3;
        for (let x = startX; x <= endX; x++) {
          d[idx] = r;
          d[idx + 1] = g;
          d[idx + 2] = b;
          idx += 3;
        }
      }
    } else {
      const invA = 1 - alpha;
      for (let y = startY; y <= endY; y++) {
        let idx = (y * W + startX) * 3;
        for (let x = startX; x <= endX; x++) {
          d[idx] = Math.round(d[idx] * invA + r * alpha);
          d[idx + 1] = Math.round(d[idx + 1] * invA + g * alpha);
          d[idx + 2] = Math.round(d[idx + 2] * invA + b * alpha);
          idx += 3;
        }
      }
    }
  }

  public strokeRect(
    x0: number,
    y0: number,
    w: number,
    h: number,
    thickness: number,
    rgb: RGB
  ): void {
    this.fillRect(x0, y0, w, thickness, rgb);
    this.fillRect(x0, y0 + h - thickness, w, thickness, rgb);
    this.fillRect(x0, y0, thickness, h, rgb);
    this.fillRect(x0 + w - thickness, y0, thickness, h, rgb);
  }

  public fillCircle(
    cx: number,
    cy: number,
    radius: number,
    rgb: RGB,
    outlineRgb?: RGB,
    outlineWidth: number = 0
  ): void {
    const W = this.width;
    const H = this.height;
    const totalR = radius + outlineWidth;
    const startX = Math.max(0, Math.floor(cx - totalR));
    const endX = Math.min(W - 1, Math.ceil(cx + totalR));
    const startY = Math.max(0, Math.floor(cy - totalR));
    const endY = Math.min(H - 1, Math.ceil(cy + totalR));
    const r2 = radius * radius;
    const totalR2 = totalR * totalR;
    const d = this.data;

    for (let y = startY; y <= endY; y++) {
      const dy = y - cy;
      const dy2 = dy * dy;
      let idx = (y * W + startX) * 3;
      for (let x = startX; x <= endX; x++) {
        const dx = x - cx;
        const dist2 = dx * dx + dy2;
        if (dist2 <= r2) {
          d[idx] = rgb[0];
          d[idx + 1] = rgb[1];
          d[idx + 2] = rgb[2];
        } else if (outlineRgb && dist2 <= totalR2) {
          d[idx] = outlineRgb[0];
          d[idx + 1] = outlineRgb[1];
          d[idx + 2] = outlineRgb[2];
        }
        idx += 3;
      }
    }
  }

  public fillEllipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rgb: RGB,
    outlineRgb?: RGB,
    outlinePad: number = 0,
    alpha: number = 1
  ): void {
    if (rx <= 0.5 || ry <= 0.5) return;
    const W = this.width;
    const H = this.height;
    const orx = rx + outlinePad;
    const ory = ry + outlinePad;
    const startX = Math.max(0, Math.floor(cx - orx));
    const endX = Math.min(W - 1, Math.ceil(cx + orx));
    const startY = Math.max(0, Math.floor(cy - ory));
    const endY = Math.min(H - 1, Math.ceil(cy + ory));
    const invRx2 = 1 / (rx * rx);
    const invRy2 = 1 / (ry * ry);
    const invOrx2 = 1 / (orx * orx);
    const invOry2 = 1 / (ory * ory);
    const d = this.data;
    const invA = 1 - alpha;

    for (let y = startY; y <= endY; y++) {
      const dy = y - cy;
      const dy2 = dy * dy;
      let idx = (y * W + startX) * 3;
      for (let x = startX; x <= endX; x++) {
        const dx = x - cx;
        const dx2 = dx * dx;
        if (dx2 * invRx2 + dy2 * invRy2 <= 1.0) {
          if (alpha >= 0.99) {
            d[idx] = rgb[0];
            d[idx + 1] = rgb[1];
            d[idx + 2] = rgb[2];
          } else {
            d[idx] = Math.round(d[idx] * invA + rgb[0] * alpha);
            d[idx + 1] = Math.round(d[idx + 1] * invA + rgb[1] * alpha);
            d[idx + 2] = Math.round(d[idx + 2] * invA + rgb[2] * alpha);
          }
        } else if (outlineRgb && dx2 * invOrx2 + dy2 * invOry2 <= 1.0) {
          d[idx] = outlineRgb[0];
          d[idx + 1] = outlineRgb[1];
          d[idx + 2] = outlineRgb[2];
        }
        idx += 3;
      }
    }
  }

  public drawLine(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    thickness: number,
    rgb: RGB
  ): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy)));
    const r = Math.max(1, thickness * 0.5);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.fillCircle(x0 + dx * t, y0 + dy * t, r, rgb);
    }
  }

  public fillPolygon(pts: {sx: number; sy: number}[], rgb: RGB, outlineRgb?: RGB): void {
    if (pts.length < 3) return;
    const H = this.height;
    const W = this.width;
    let minY = H;
    let maxY = 0;
    for (const p of pts) {
      if (p.sy < minY) minY = p.sy;
      if (p.sy > maxY) maxY = p.sy;
    }
    const startY = Math.max(0, Math.floor(minY));
    const endY = Math.min(H - 1, Math.ceil(maxY));
    const d = this.data;
    const [r, g, b] = rgb;
    const n = pts.length;

    for (let y = startY; y <= endY; y++) {
      const nodes: number[] = [];
      let j = n - 1;
      for (let i = 0; i < n; i++) {
        const pi = pts[i];
        const pj = pts[j];
        if ((pi.sy < y && pj.sy >= y) || (pj.sy < y && pi.sy >= y)) {
          nodes.push(pi.sx + ((y - pi.sy) / (pj.sy - pi.sy)) * (pj.sx - pi.sx));
        }
        j = i;
      }
      nodes.sort((a, bVal) => a - bVal);
      for (let i = 0; i < nodes.length - 1; i += 2) {
        const xStart = Math.max(0, Math.floor(nodes[i]));
        const xEnd = Math.min(W - 1, Math.ceil(nodes[i + 1]));
        let idx = (y * W + xStart) * 3;
        for (let x = xStart; x <= xEnd; x++) {
          d[idx] = r;
          d[idx + 1] = g;
          d[idx + 2] = b;
          idx += 3;
        }
      }
    }

    if (outlineRgb) {
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        const bPt = pts[(i + 1) % n];
        this.drawLine(a.sx, a.sy, bPt.sx, bPt.sy, 1.8, outlineRgb);
      }
    }
  }

  public draw3DBox(
    cx: number,
    yBottom: number,
    cz: number,
    wx: number,
    wy: number,
    wz: number,
    frontRgb: RGB,
    topRgb: RGB,
    sideRgb: RGB,
    outlineRgb?: RGB
  ): void {
    const hx = wx * 0.5;
    const hz = wz * 0.5;
    const yTop = yBottom + wy;

    // Front face (z + hz)
    const f0 = this.project(cx - hx, yBottom, cz + hz);
    const f1 = this.project(cx + hx, yBottom, cz + hz);
    const f2 = this.project(cx + hx, yTop, cz + hz);
    const f3 = this.project(cx - hx, yTop, cz + hz);

    // Back top corners (z - hz)
    const b2 = this.project(cx + hx, yTop, cz - hz);
    const b3 = this.project(cx - hx, yTop, cz - hz);
    const b1 = this.project(cx + hx, yBottom, cz - hz);
    const b0 = this.project(cx - hx, yBottom, cz - hz);

    // Side face (whichever side faces camera)
    if (cx < this.camPos[0] && f1 && b1 && b2 && f2) {
      this.fillPolygon([f1, b1, b2, f2], sideRgb, outlineRgb);
    } else if (cx >= this.camPos[0] && b0 && f0 && f3 && b3) {
      this.fillPolygon([b0, f0, f3, b3], sideRgb, outlineRgb);
    }

    // Top face
    if (yTop < this.camPos[1] && f3 && f2 && b2 && b3) {
      this.fillPolygon([f3, f2, b2, b3], topRgb, outlineRgb);
    }

    // Front face
    if (f0 && f1 && f2 && f3) {
      this.fillPolygon([f0, f1, f2, f3], frontRgb, outlineRgb);
    }
  }

  public drawText(
    text: string,
    x: number,
    y: number,
    scale: number,
    rgb: RGB,
    align: 'left' | 'center' | 'right' = 'left'
  ): void {
    const clean = text.toUpperCase();
    const charStep = 6 * scale;
    const totalW = clean.length * charStep;
    let cursorX =
      align === 'center' ? x - totalW * 0.5 : align === 'right' ? x - totalW : x;

    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i];
      const glyph = FONT_5X7[ch] || FONT_5X7[' '];
      for (let row = 0; row < 7; row++) {
        const bits = glyph[row];
        for (let col = 0; col < 5; col++) {
          if ((bits >> (4 - col)) & 1) {
            this.fillRect(
              cursorX + col * scale,
              y + row * scale,
              scale,
              scale,
              rgb
            );
          }
        }
      }
      cursorX += charStep;
    }
  }
}

/**
 * Deterministically evaluates and renders frame `frameIndex` (t = frameIndex / 60.0)
 * of the 3D Remotion + Three.js Music Video into `canvas3d.data` (RGB24).
 * Guaranteed 60.0 FPS continuous motion on every single frame, zero top HUD box!
 */
export function renderProcedural3DFrame(
  canvas3d: SoftwareCanvas3D,
  frameIndex: number,
  includeOutroCredits?: boolean
): Uint8Array {
  const t = Math.max(0, frameIndex) / 60.0;
  const shot = getShotAtTime(t);
  const metrics = getBeatMetrics(t);
  const showCredits = includeOutroCredits ?? t >= 157.5;

  // Deterministic 60fps harmonic phase (1 full cycle = 60 frames = 1.00s)
  const phase = t * Math.PI * 2;
  const bassEnergy = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.cos(phase * 2), 2);

  // 1. Camera Setup with continuous 60fps 3D orbit, crane, and beat-synced dolly
  const isChorusOrBreak =
    shot.section === 'chorus1' ||
    shot.section === 'chorus2' ||
    shot.section === 'finalchorus' ||
    shot.section === 'break1' ||
    shot.section === 'break2';

  const orbitX = Math.sin(phase) * 0.82;
  const orbitY = Math.cos(phase) * 0.28;
  const dollyZ = Math.sin(phase * 2) * 0.42 - (isChorusOrBreak ? metrics.snapProgress * 0.25 : 0);

  const camPos: [number, number, number] = [
    shot.cameraPos[0] + orbitX,
    Math.max(1.2, shot.cameraPos[1] + orbitY),
    shot.cameraPos[2] + dollyZ,
  ];
  const camTarget: [number, number, number] = [
    shot.cameraTarget[0] + orbitX * 0.25,
    shot.cameraTarget[1] + orbitY * 0.18,
    shot.cameraTarget[2],
  ];
  const dutchRoll =
    shot.specialOverlay === 'zigzag_guitar'
      ? Math.sin(phase * 2) * 0.045
      : shot.specialOverlay === 'vinyl_wipe'
        ? Math.sin(phase) * 0.055
        : 0;

  canvas3d.setCamera(camPos, camTarget, shot.fov, dutchRoll);

  // 2. Sky Gradient & Volumetric Anime Sun Bloom
  const bgTop = hexToRgb(shot.bgHex || '#1B1646');
  const bgBottom = lerpRgb(bgTop, [46, 30, 96], 0.55);
  canvas3d.fillBackgroundGradient(bgTop, bgBottom, 0.85 + 0.15 * Math.sin(phase));

  // Twinkling anime background stars
  const starRgb: RGB = [255, 244, 224];
  for (let s = 0; s < 18; s++) {
    const sx = ((s * 197 + 83) % (canvas3d.width - 80)) + 40;
    const sy = ((s * 131 + 29) % Math.floor(canvas3d.height * 0.42)) + 18;
    const twinkle = 1.5 + Math.sin(phase * 2 + s) * 1.2;
    if (twinkle > 1.2) {
      canvas3d.fillCircle(sx, sy, twinkle, starRgb);
    }
  }

  const outlineDark: RGB = [14, 10, 38];

  // 3. Pop-Up 3D Vinyl City Buildings & 3D Billboards
  const bldgColors: RGB[] = [
    [68, 48, 128],
    [88, 62, 148],
    [52, 40, 112],
    [102, 68, 158],
  ];
  const buildingSpecs = [
    {x: -8.8, z: -5.8, w: 2.2, h: 6.4, d: 1.8},
    {x: -6.2, z: -6.2, w: 2.4, h: 8.2, d: 2.0},
    {x: -3.4, z: -6.5, w: 2.5, h: 7.4, d: 2.0},
    {x: 3.4, z: -6.5, w: 2.5, h: 7.8, d: 2.0},
    {x: 6.2, z: -6.2, w: 2.4, h: 8.0, d: 2.0},
    {x: 8.8, z: -5.8, w: 2.2, h: 6.6, d: 1.8},
  ];

  buildingSpecs.forEach((b, idx) => {
    const baseCol = bldgColors[idx % bldgColors.length];
    const bounceH = b.h + Math.sin(phase + idx * 0.7) * 0.18 + bassEnergy * 0.15;
    canvas3d.draw3DBox(
      b.x,
      -0.4,
      b.z,
      b.w,
      bounceH,
      b.d,
      baseCol,
      lerpRgb(baseCol, [255, 178, 62], 0.45),
      lerpRgb(baseCol, [18, 14, 48], 0.35),
      outlineDark
    );

    // Lit anime building windows
    for (let wy = 1.2; wy < bounceH - 0.8; wy += 1.1) {
      for (let wxOff = -0.55; wxOff <= 0.55; wxOff += 1.1) {
        const wp = canvas3d.project(b.x + wxOff, wy, b.z + b.d * 0.51);
        if (wp) {
          const ww = Math.max(4, wp.scale * 0.34);
          const wh = Math.max(5, wp.scale * 0.42);
          const winLit = (idx + Math.floor(wy)) % 2 === 0;
          canvas3d.fillRect(
            wp.sx - ww * 0.5,
            wp.sy - wh * 0.5,
            ww,
            wh,
            winLit ? [255, 212, 112] : [255, 142, 198]
          );
        }
      }
    }
  });

  // 4. Stage Base Platform & 16x8 Perspective 3D Beat-Grid Floor Tiles (Back-to-Front Painter's Order)
  const floorBaseRgb = hexToRgb(shot.floorBaseHex || '#241E59');
  const accentRgb = hexToRgb(shot.accentHex || '#FFB23E');
  const COLS = 16;
  const ROWS = 8;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const intensity = getTileIntensity(c, r, t, bassEnergy);
      const x = (c - 7.5) * 0.9;
      const z = (r - 3.5) * 0.9;
      const liftY = intensity * 0.16;
      const hw = 0.41;

      const p0 = canvas3d.project(x - hw, liftY, z + hw);
      const p1 = canvas3d.project(x + hw, liftY, z + hw);
      const p2 = canvas3d.project(x + hw, liftY, z - hw);
      const p3 = canvas3d.project(x - hw, liftY, z - hw);

      if (p0 && p1 && p2 && p3) {
        const tileTopRgb =
          intensity < 0.12
            ? ([28, 22, 68] as RGB)
            : lerpRgb(floorBaseRgb, lerpRgb(accentRgb, [255, 244, 224], 0.35), intensity);
        const tileFrontRgb = lerpRgb(tileTopRgb, [14, 10, 36], 0.38);

        // Front lip of tile
        const b0 = canvas3d.project(x - hw, -0.06, z + hw);
        const b1 = canvas3d.project(x + hw, -0.06, z + hw);
        if (b0 && b1) {
          canvas3d.fillPolygon([b0, b1, p1, p0], tileFrontRgb);
        }
        canvas3d.fillPolygon([p0, p1, p2, p3], tileTopRgb, [20, 15, 52]);
      }
    }
  }

  // 5. 16 Back-Row 3D Equalizer Bars (z = -3.95)
  const eqPalette: RGB[] = [
    [46, 196, 182],
    [255, 178, 62],
    [232, 63, 140],
    [255, 244, 224],
  ];
  for (let c = 0; c < COLS; c++) {
    const x = (c - 7.5) * 0.9;
    const wave = Math.abs(Math.sin(phase * 2 + c * 0.55));
    const barH = 0.75 + wave * (isChorusOrBreak ? 2.35 : 1.35) + bassEnergy * 0.65;
    const col = eqPalette[c % eqPalette.length];
    canvas3d.draw3DBox(
      x,
      0.06,
      -3.95,
      0.66,
      barH,
      0.32,
      col,
      lerpRgb(col, [255, 255, 255], 0.35),
      lerpRgb(col, [18, 14, 48], 0.3),
      outlineDark
    );
  }

  // 6. 3-Tier Pastel Chorus Steps (z = -2.2)
  const tierPalette: RGB[] = [
    [232, 118, 188],
    [255, 218, 112],
    [132, 238, 232],
  ];
  for (let c = -5; c <= 5; c++) {
    const tx = c * 0.95;
    const bounce = Math.abs(Math.sin(phase * 2 + c * 0.6)) * 0.22;
    const col = tierPalette[Math.abs(c) % 3];
    canvas3d.draw3DBox(
      tx,
      0.04,
      -2.2,
      0.78,
      0.95 + (Math.abs(c) % 2) * 0.38 + bounce,
      0.48,
      col,
      lerpRgb(col, [255, 255, 255], 0.3),
      lerpRgb(col, [20, 15, 52], 0.28),
      outlineDark
    );
  }

  // 7. Two 3D Overhead City Billboards (Left & Right)
  const drawBillboard = (bx: number, by: number, bz: number, header: string, borderRgb: RGB) => {
    const pCenter = canvas3d.project(bx, by, bz);
    if (!pCenter) return;
    const bw = Math.round(pCenter.scale * 3.8);
    const bh = Math.round(pCenter.scale * 1.75);
    const x0 = Math.round(pCenter.sx - bw * 0.5);
    const y0 = Math.round(pCenter.sy - bh * 0.5);

    canvas3d.fillRect(x0 - 4, y0 - 4, bw + 8, bh + 8, outlineDark);
    canvas3d.fillRect(x0, y0, bw, bh, [18, 14, 44]);
    canvas3d.strokeRect(x0, y0, bw, bh, 4, borderRgb);

    const textScale = Math.max(1.0, Math.min(1.35, bw / 235));
    canvas3d.drawText(header, x0 + 12, y0 + 12, textScale, borderRgb, 'left');
    const lyricShort = (shot.lyric || 'FIND ITS GROOVE').slice(0, 24);
    canvas3d.drawText(lyricShort, x0 + 12, y0 + 32, textScale, [255, 244, 224], 'left');

    // Mini animated spectrum bars inside billboard
    const barCount = 16;
    const barW = Math.max(3, Math.floor((bw - 28) / barCount) - 3);
    for (let i = 0; i < barCount; i++) {
      const bhSpec = Math.round(
        (0.25 + 0.75 * Math.abs(Math.sin(phase * 3 + i * 0.6))) * (bh * 0.28)
      );
      const bCol = i % 2 === 0 ? ([255, 178, 62] as RGB) : ([46, 196, 182] as RGB);
      canvas3d.fillRect(
        x0 + 14 + i * (barW + 3),
        y0 + bh - 10 - bhSpec,
        barW,
        bhSpec,
        bCol
      );
    }
  };

  drawBillboard(-5.2, 4.5, -3.4, `SUNO AI STUDIO · ${shot.section.toUpperCase()}`, [255, 178, 62]);
  drawBillboard(5.2, 4.5, -3.4, 'ANIME 3D LYRIC STAGE · 4K 60FPS', [46, 196, 182]);

  // 8. 3D Beveled Kinetic Lyric Tiles Floating Above Stage
  const lyricWords = (shot.lyric || 'FIND ITS GROOVE').toUpperCase();
  const maxRowLen = Math.min(22, Math.ceil(lyricWords.length * 0.55));
  const row1 = lyricWords.slice(0, maxRowLen).trim();
  const row2 = lyricWords.slice(maxRowLen, maxRowLen * 2).trim();
  const tileColors: RGB[] = [
    [255, 178, 62],
    [46, 196, 182],
    [232, 63, 140],
    [255, 244, 224],
  ];

  const renderLyricRow3D = (rowStr: string, worldY: number, rowOffset: number) => {
    const len = rowStr.length;
    for (let i = 0; i < len; i++) {
      const ch = rowStr[i];
      if (ch === ' ') continue;
      const wx = (i - (len - 1) * 0.5) * 0.42;
      const wy = worldY + Math.sin(phase * 2 + i * 0.45 + rowOffset) * 0.12;
      const wz = -1.2 + Math.cos(phase + i * 0.3) * 0.1;
      const pt = canvas3d.project(wx, wy, wz);
      if (!pt) continue;
      const ts = Math.max(14, Math.round(pt.scale * 0.34));
      const tx = Math.round(pt.sx - ts * 0.5);
      const ty = Math.round(pt.sy - ts * 0.5);
      const col = tileColors[(i + rowOffset) % tileColors.length];

      canvas3d.fillRect(tx - 2, ty - 2, ts + 4, ts + 4, outlineDark);
      canvas3d.fillRect(tx, ty, ts, ts, [255, 248, 236]);
      canvas3d.strokeRect(tx, ty, ts, ts, 3, col);
      canvas3d.drawText(ch, pt.sx + 1, ty + Math.round(ts * 0.22), Math.max(1.5, ts / 10), col, 'center');
    }
  };

  renderLyricRow3D(row1, 2.95, 0);
  if (row2.length > 0) {
    renderLyricRow3D(row2, 2.35, 2);
  }

  // 9. Spark ("You" — Golden Amber 3D Teardrop Character)
  const sparkBounce = metrics.sparkBounce;
  const sparkX = -1.45 + Math.sin(phase) * 0.34;
  const sparkY = sparkBounce * 0.44 + Math.abs(Math.sin(phase * 2)) * 0.18;
  const sparkZ = 0.4 + Math.cos(phase) * 0.16;

  const sparkShadow = canvas3d.project(sparkX, 0.04, sparkZ);
  if (sparkShadow) {
    canvas3d.fillEllipse(
      sparkShadow.sx,
      sparkShadow.sy,
      sparkShadow.scale * (0.65 - sparkY * 0.2),
      sparkShadow.scale * 0.22,
      [10, 8, 28],
      undefined,
      0,
      0.55
    );
  }

  const sparkCenter = canvas3d.project(sparkX, 0.92 + sparkY, sparkZ);
  if (sparkCenter) {
    const s = sparkCenter.scale;
    const squashY = 1 + sparkBounce * 0.18;
    const squashX = 1 / Math.sqrt(squashY);

    // Teardrop / Diamond 3D body polygon
    const topPt = {sx: sparkCenter.sx, sy: sparkCenter.sy - s * 0.95 * squashY};
    const rightPt = {sx: sparkCenter.sx + s * 0.72 * squashX, sy: sparkCenter.sy + s * 0.15};
    const botPt = {sx: sparkCenter.sx, sy: sparkCenter.sy + s * 0.72 * squashY};
    const leftPt = {sx: sparkCenter.sx - s * 0.72 * squashX, sy: sparkCenter.sy + s * 0.15};
    const upRightPt = {sx: sparkCenter.sx + s * 0.48 * squashX, sy: sparkCenter.sy - s * 0.35};
    const upLeftPt = {sx: sparkCenter.sx - s * 0.48 * squashX, sy: sparkCenter.sy - s * 0.35};

    canvas3d.fillPolygon(
      [topPt, upRightPt, rightPt, botPt, leftPt, upLeftPt],
      [255, 224, 92],
      outlineDark
    );

    // Glowing heart core on Spark's chest
    const heartR = s * (0.22 + sparkBounce * 0.05);
    canvas3d.fillCircle(sparkCenter.sx - heartR * 0.45, sparkCenter.sy + s * 0.12, heartR * 0.65, [255, 252, 240]);
    canvas3d.fillCircle(sparkCenter.sx + heartR * 0.45, sparkCenter.sy + s * 0.12, heartR * 0.65, [255, 252, 240]);
    canvas3d.fillPolygon(
      [
        {sx: sparkCenter.sx - heartR * 1.05, sy: sparkCenter.sy + s * 0.16},
        {sx: sparkCenter.sx + heartR * 1.05, sy: sparkCenter.sy + s * 0.16},
        {sx: sparkCenter.sx, sy: sparkCenter.sy + s * 0.46},
      ],
      [255, 252, 240]
    );

    // Anime Eyes + Specular Catchlights
    const eyeY = sparkCenter.sy - s * 0.12;
    const eyeOffX = s * 0.22;
    [-1, 1].forEach((dir) => {
      const ex = sparkCenter.sx + dir * eyeOffX;
      canvas3d.fillEllipse(ex, eyeY, s * 0.085, s * 0.11, [20, 24, 58], outlineDark, 1.5);
      canvas3d.fillCircle(ex - s * 0.025, eyeY - s * 0.035, s * 0.032, [255, 255, 255]);
      canvas3d.fillCircle(ex + s * 0.02, eyeY + s * 0.03, s * 0.018, [46, 196, 182]);
      // Rosy blush
      canvas3d.fillEllipse(ex + dir * s * 0.07, eyeY + s * 0.11, s * 0.06, s * 0.03, [255, 138, 188]);
    });

    // Orbiting Deadline / Golden Halo Ring above Spark
    canvas3d.fillEllipse(
      sparkCenter.sx + Math.sin(phase) * s * 0.08,
      topPt.sy - s * 0.18,
      s * 0.55,
      s * 0.11,
      [255, 198, 228],
      [255, 255, 255],
      2,
      0.85
    );
  }

  // 10. Beat ("Me" — Suno AI Teal/Cyan 3D Boombox Character + 3D DJ Workstation)
  const snap = metrics.snapProgress;
  const beatX = 1.45 + Math.cos(phase) * 0.24;
  const beatY = snap * 0.28 + Math.abs(Math.cos(phase * 2)) * 0.14;
  const beatZ = 0.35;

  const beatShadow = canvas3d.project(beatX, 0.04, beatZ);
  if (beatShadow) {
    canvas3d.fillEllipse(
      beatShadow.sx,
      beatShadow.sy,
      beatShadow.scale * 0.85,
      beatShadow.scale * 0.26,
      [10, 8, 28],
      undefined,
      0,
      0.55
    );
  }

  // Beat 3D body box
  canvas3d.draw3DBox(
    beatX,
    0.12 + beatY,
    beatZ,
    1.52,
    1.36,
    1.15,
    [132, 248, 242],
    [188, 255, 252],
    [46, 196, 182],
    outlineDark
  );

  const beatFront = canvas3d.project(beatX, 0.82 + beatY, beatZ + 0.58);
  if (beatFront) {
    const bs = beatFront.scale;

    // Headphones arch & earcups
    canvas3d.fillEllipse(
      beatFront.sx,
      beatFront.sy - bs * 0.52,
      bs * 0.82,
      bs * 0.42,
      [34, 24, 92],
      outlineDark,
      2
    );
    canvas3d.fillEllipse(
      beatFront.sx,
      beatFront.sy - bs * 0.46,
      bs * 0.72,
      bs * 0.32,
      [132, 248, 242]
    );
    // Left & Right Earcups
    canvas3d.fillEllipse(beatFront.sx - bs * 0.78, beatFront.sy - bs * 0.15, bs * 0.12, bs * 0.26, [232, 63, 140], outlineDark, 2);
    canvas3d.fillEllipse(beatFront.sx + bs * 0.78, beatFront.sy - bs * 0.15, bs * 0.12, bs * 0.26, [232, 63, 140], outlineDark, 2);

    // Beat Eyes
    [-1, 1].forEach((dir) => {
      const ex = beatFront.sx + dir * bs * 0.26;
      const ey = beatFront.sy - bs * 0.14;
      canvas3d.fillRect(ex - bs * 0.1, ey - bs * 0.07, bs * 0.2, bs * 0.14, [24, 20, 68]);
      canvas3d.fillCircle(ex, ey, bs * 0.038, [255, 255, 255]);
    });

    // Hollow Chest Ring Motif
    const ringGlowRgb: RGB =
      shot.hollowRingState === 'lit_combo' || shot.hollowRingState === 'glowing_amber'
        ? [255, 178, 62]
        : [46, 196, 182];
    canvas3d.fillCircle(beatFront.sx, beatFront.sy + bs * 0.22, bs * 0.22, ringGlowRgb, outlineDark, 2);
    canvas3d.fillCircle(beatFront.sx, beatFront.sy + bs * 0.22, bs * 0.14, [14, 10, 38]);
  }

  // Beat's Hovering 3D DJ/DAW Producer Console
  const deskY = 0.34 + Math.sin(phase) * 0.04;
  const deskZ = beatZ + 0.88;
  canvas3d.draw3DBox(
    beatX,
    deskY,
    deskZ,
    1.55,
    0.12,
    0.68,
    [24, 20, 64],
    [42, 36, 98],
    [16, 12, 44],
    outlineDark
  );

  // 12 Animated Holographic 3D Waveform Bars on Beat's Console
  for (let wIdx = 0; wIdx < 12; wIdx++) {
    const wx = beatX + (wIdx - 5.5) * 0.11;
    const wh = 0.14 + Math.abs(Math.sin(phase * 3 + wIdx * 0.65)) * 0.32;
    const wCol = wIdx % 2 === 0 ? ([255, 218, 112] as RGB) : ([132, 248, 242] as RGB);
    canvas3d.draw3DBox(wx, deskY + 0.12, deskZ, 0.06, wh, 0.06, wCol, [255, 255, 255], wCol);
  }

  // 11. 4 Sharp-Shoed 3D Musical Note Performers (Tap-Dancing at 60 FPS)
  const noteSlotsX = [-3.65, -2.55, 2.85, 3.95];
  const noteColors: RGB[] = [
    [255, 224, 92],
    [132, 248, 242],
    [244, 118, 198],
    [255, 252, 244],
  ];

  noteSlotsX.forEach((nx, idx) => {
    const hop = Math.abs(Math.sin(phase * 2 + idx * 1.1)) * 0.34;
    const nz = 1.48;
    const np = canvas3d.project(nx, 0.42 + hop, nz);
    const nFoot = canvas3d.project(nx, 0.08 + hop * 0.3, nz);
    if (!np || !nFoot) return;
    const ns = np.scale;
    const nCol = noteColors[idx];

    // Pink tap-dancing sneakers
    const stepSwing = Math.sin(phase * 3 + idx) * ns * 0.08;
    canvas3d.fillEllipse(nFoot.sx - ns * 0.12, nFoot.sy + stepSwing, ns * 0.09, ns * 0.05, [244, 118, 198], outlineDark, 1.5);
    canvas3d.fillEllipse(nFoot.sx + ns * 0.12, nFoot.sy - stepSwing, ns * 0.09, ns * 0.05, [244, 118, 198], outlineDark, 1.5);

    // Note stem & flag
    canvas3d.drawLine(
      np.sx + ns * 0.24,
      np.sy,
      np.sx + ns * 0.32,
      np.sy - ns * 0.78,
      Math.max(3, ns * 0.08),
      nCol
    );
    canvas3d.drawLine(
      np.sx + ns * 0.32,
      np.sy - ns * 0.78,
      np.sx + ns * 0.56,
      np.sy - ns * 0.62,
      Math.max(3, ns * 0.08),
      nCol
    );

    // Glossy 3D note head
    canvas3d.fillEllipse(np.sx, np.sy, ns * 0.32, ns * 0.23, nCol, outlineDark, 2.5);
    canvas3d.fillEllipse(np.sx - ns * 0.08, np.sy - ns * 0.06, ns * 0.12, ns * 0.06, [255, 255, 255]);
  });

  // 12. Flying 3D Melody Orb (Chorus / Climax)
  if (isChorusOrBreak) {
    const orbX = Math.sin(phase) * 2.1;
    const orbY = 1.55 + Math.sin(phase * 2) * 0.42;
    const orbZ = Math.cos(phase) * 0.65;
    const orbPt = canvas3d.project(orbX, orbY, orbZ);
    if (orbPt) {
      canvas3d.fillCircle(orbPt.sx, orbPt.sy, orbPt.scale * 0.26, [255, 248, 224], [255, 178, 62], 3);
    }
  }

  // 13. Official End Credits Slate (ONLY in Outro — ZERO top HUD box anywhere!)
  if (showCredits) {
    const W = canvas3d.width;
    const H = canvas3d.height;
    const cw = Math.round(W * 0.58);
    const ch = Math.round(H * 0.44);
    const cx0 = Math.round((W - cw) * 0.5);
    const cy0 = Math.round((H - ch) * 0.5);

    canvas3d.fillRect(cx0 + 6, cy0 + 6, cw, ch, [10, 6, 26], 0.92);
    canvas3d.fillRect(cx0, cy0, cw, ch, [20, 15, 54], 0.94);
    canvas3d.strokeRect(cx0, cy0, cw, ch, 4, [255, 178, 62]);

    canvas3d.drawText(
      'FIND ITS GROOVE · OFFICIAL END CREDITS',
      W * 0.5,
      cy0 + 28,
      2.2,
      [255, 178, 62],
      'center'
    );

    const rows: [string, string, RGB][] = [
      ['DIRECTED BY :', 'ARK HANDLES MUSIC (AARAV KHARADE)', [46, 196, 182]],
      ['LYRICS:', 'AARAV KHARADE', [255, 178, 62]],
      ['VOCALS:', 'SUNO V6 MINI', [232, 63, 140]],
      ['ANIMATION:', 'GEMINI ARGON 4 AND AARAV KHARADE', [46, 196, 182]],
    ];

    rows.forEach(([label, val, col], idx) => {
      const ry = cy0 + 82 + idx * 54;
      canvas3d.drawText(label, cx0 + 38, ry, 2.0, col, 'left');
      canvas3d.drawText(val, cx0 + cw - 38, ry, 2.0, [255, 244, 224], 'right');
    });
  }

  return canvas3d.data;
}
