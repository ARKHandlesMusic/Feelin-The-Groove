import * as THREE from 'three';
import {createRoundedRectShape} from './stage-models';
import {computeLyricLetterTransform, KINETIC_STYLES_50} from './lyric-kinetic-50';

export interface Lyric3DPoolRig {
  group: THREE.Group;
  letterMeshes: THREE.Mesh[];
  updateLyricText: (text: string, accentHex: string) => void;
  animateLetters: (
    styleId: number,
    shotProgress: number,
    timeSec: number
  ) => void;
}

/**
 * Creates a pool of 46 3D beveled model letter blocks that physically render and
 * animate the active lyric inside the 3D scene using any of the 50 kinetic styles.
 */
export function create3DLyricLetterPool(): Lyric3DPoolRig {
  const group = new THREE.Group();
  group.name = 'Immersive3DLyricPool';

  const MAX_CHARS = 64;
  const letterMeshes: THREE.Mesh[] = [];
  const charTextureCache = new Map<string, THREE.CanvasTexture>();

  const blockShape = createRoundedRectShape(0.32, 0.4, 0.06);
  const blockGeo = new THREE.ExtrudeGeometry(blockShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  blockGeo.center();

  // Fix UVs on ExtrudeGeometry front face so the character glyph is centered [0..1]
  const posAttr = blockGeo.attributes.position;
  const uvAttr = blockGeo.attributes.uv;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    uvAttr.setXY(i, (vx + 0.18) / 0.36, (vy + 0.22) / 0.44);
  }
  uvAttr.needsUpdate = true;

  function getCharTexture(char: string, bgHex: string): THREE.CanvasTexture {
    const key = `${char}_${bgHex}`;
    if (charTextureCache.has(key)) {
      return charTextureCache.get(key)!;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Anime cel-shaded tile background with top specular highlight band
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(255, 244, 224, 0.28)';
    ctx.fillRect(0, 0, 128, 36);

    // Bold anime hand-drawn style ink border
    ctx.strokeStyle = '#0D0822';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 118, 118);

    ctx.strokeStyle = '#FFF4E0';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, 104, 104);

    // High-contrast anime glyph with dark ink outline
    ctx.font = '900 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0D0822';
    ctx.lineWidth = 10;
    ctx.strokeText(char, 64, 68);
    ctx.fillStyle = '#FFF4E0';
    ctx.fillText(char, 64, 68);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    charTextureCache.set(key, tex);
    return tex;
  }

  for (let i = 0; i < MAX_CHARS; i++) {
    const sideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0D0822'),
      emissive: new THREE.Color('#FFB23E'),
      emissiveIntensity: 0.28,
      roughness: 0.25,
      metalness: 0.15,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      roughness: 0.2,
      metalness: 0.08,
    });
    const mesh = new THREE.Mesh(blockGeo, [faceMat, sideMat]);
    mesh.castShadow = true;
    mesh.visible = false;
    letterMeshes.push(mesh);
    group.add(mesh);
  }

  let currentText = '';
  let currentAccent = '';
  let activeCount = 0;
  let currentSplitIndex = 0;

  function updateLyricText(rawText: string, accentHex: string) {
    const cleaned = rawText.replace(/[\[\]]/g, '').trim().slice(0, MAX_CHARS);
    if (cleaned === currentText && accentHex === currentAccent) return;
    currentText = cleaned;
    currentAccent = accentHex;
    activeCount = cleaned.length;

    // Find nearest space to midpoint for balanced 2-row wrapping on longer lines
    currentSplitIndex = Math.ceil(activeCount / 2);
    if (activeCount > 24) {
      const mid = Math.floor(activeCount / 2);
      let bestSpace = -1;
      let bestDist = 999;
      for (let i = 6; i < activeCount - 5; i++) {
        if (cleaned[i] === ' ') {
          const d = Math.abs(i - mid);
          if (d < bestDist) {
            bestDist = d;
            bestSpace = i + 1;
          }
        }
      }
      if (bestSpace > 0) {
        currentSplitIndex = bestSpace;
      }
    }

    const palette = [accentHex, '#FFB23E', '#2EC4B6', '#E83F8C'];

    for (let i = 0; i < MAX_CHARS; i++) {
      const mesh = letterMeshes[i];
      if (i >= activeCount || cleaned[i] === ' ') {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      const ch = cleaned[i];
      const tileColor = palette[i % palette.length];
      const mats = mesh.material as THREE.MeshStandardMaterial[];
      mats[0].map = getCharTexture(ch, tileColor);
      mats[0].needsUpdate = true;
      mats[1].emissive.set(tileColor);
    }
  }

  function animateLetters(styleId: number, shotProgress: number, timeSec: number) {
    for (let i = 0; i < activeCount; i++) {
      const mesh = letterMeshes[i];
      if (!mesh.visible) continue;
      const tr = computeLyricLetterTransform(
        styleId,
        i,
        activeCount,
        shotProgress,
        timeSec,
        currentSplitIndex
      );
      mesh.position.set(tr.x, tr.y, tr.z);
      mesh.rotation.set(tr.rx, tr.ry, tr.rz);
      mesh.scale.set(tr.sx, tr.sy, tr.sz);
    }
  }

  return {
    group,
    letterMeshes,
    updateLyricText,
    animateLetters,
  };
}

export interface CitySceneryRig {
  group: THREE.Group;
  buildings: THREE.Group[];
  trees: THREE.Group[];
  benches: THREE.Group[];
  streetlights: THREE.Group[];
  billboards: THREE.Group[];
  updateBillboards: (lyric: string, sectionLabel: string, styleLabel: string) => void;
}

/**
 * Creates the Pop-Up Anime City Boulevard Scenery around the expanded stage:
 * - Multi-story buildings with cel-outlined roofs, glowing windows, balconies, and balcony plants
 * - Footpaths / sidewalks with glowing neon curbs
 * - Stylized anime trees in planter boxes, park benches & warm streetlamps
 * - 2 Giant 3D City Billboards that integrate the live lyrics into the skyline
 */
export function createCityScenery(): CitySceneryRig {
  const group = new THREE.Group();
  group.name = 'PopUpCityScenery';

  const buildings: THREE.Group[] = [];
  const trees: THREE.Group[] = [];
  const benches: THREE.Group[] = [];
  const streetlampsList: THREE.Group[] = [];
  const billboards: THREE.Group[] = [];

  // 1. Footpaths / Sidewalks on Left, Right, and Back Perimeter (clear of the 16x8 tile grid)
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#251E52'),
    roughness: 0.65,
    metalness: 0.1,
  });
  const curbMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2EC4B6'),
    emissive: new THREE.Color('#2EC4B6'),
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });

  const leftFootpath = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 12.6), sidewalkMat);
  leftFootpath.position.set(-9.4, 0.02, -1.2);
  const rightFootpath = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 12.6), sidewalkMat);
  rightFootpath.position.set(9.4, 0.02, -1.2);
  const backFootpath = new THREE.Mesh(new THREE.BoxGeometry(21.6, 0.18, 2.6), sidewalkMat);
  backFootpath.position.set(0, 0.02, -6.4);

  const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 12.6), curbMat);
  leftCurb.position.set(-7.95, 0.06, -1.2);
  const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 12.6), curbMat);
  rightCurb.position.set(7.95, 0.06, -1.2);

  group.add(leftFootpath, rightFootpath, backFootpath, leftCurb, rightCurb);

  // 2. Pop-Up Anime Buildings with Cel-Outlines, Windows, Balconies & Balcony Plants
  const buildingConfigs = [
    {x: -9.8, z: -6.8, w: 2.5, h: 6.4, d: 2.2, color: '#1E174A', winColor: '#FFB23E'},
    {x: -6.8, z: -7.1, w: 2.3, h: 5.1, d: 2.0, color: '#261D5C', winColor: '#2EC4B6'},
    {x: -3.8, z: -7.3, w: 2.5, h: 7.5, d: 2.2, color: '#1B1442', winColor: '#E83F8C'},
    {x: 3.8, z: -7.3, w: 2.5, h: 7.2, d: 2.2, color: '#221A54', winColor: '#FFB23E'},
    {x: 6.8, z: -7.1, w: 2.3, h: 5.4, d: 2.0, color: '#1E1648', winColor: '#FFF4E0'},
    {x: 9.8, z: -6.8, w: 2.5, h: 6.8, d: 2.2, color: '#271E60', winColor: '#2EC4B6'},
    {x: -9.9, z: -2.8, w: 2.2, h: 5.2, d: 2.2, color: '#231B56', winColor: '#E83F8C'},
    {x: 9.9, z: -2.8, w: 2.2, h: 5.5, d: 2.2, color: '#20184D', winColor: '#FFB23E'},
  ];

  const plantMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2EC4B6'),
    emissive: new THREE.Color('#1B8A7E'),
    emissiveIntensity: 0.3,
    roughness: 0.45,
  });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0B071E'),
    side: THREE.BackSide,
  });

  buildingConfigs.forEach((cfg) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(cfg.x, 0, cfg.z);
    bGroup.userData = {targetH: cfg.h};

    const hullMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.color),
      roughness: 0.55,
      metalness: 0.15,
    });
    const hull = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), hullMat);
    hull.position.y = cfg.h / 2;
    hull.castShadow = true;
    hull.receiveShadow = true;

    // Anime cel-shaded ink outline hull
    const hullOutline = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.w + 0.12, cfg.h + 0.12, cfg.d + 0.12),
      outlineMat
    );
    hullOutline.position.y = cfg.h / 2;
    bGroup.add(hull, hullOutline);

    // Roof Cornice & Neon Rooftop Beacon
    const roofTrim = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.w + 0.22, 0.24, cfg.d + 0.22),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.winColor),
        emissive: new THREE.Color(cfg.winColor),
        emissiveIntensity: 0.4,
        roughness: 0.3,
      })
    );
    roofTrim.position.y = cfg.h + 0.12;
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.05, 1.2, 8),
      new THREE.MeshStandardMaterial({color: new THREE.Color('#FFF4E0'), metalness: 0.7})
    );
    antenna.position.set(0.3, cfg.h + 0.7, 0);
    bGroup.add(roofTrim, antenna);

    // Glowing Anime Windows + Extruded Balconies with Plants
    const winMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.winColor),
      emissive: new THREE.Color(cfg.winColor),
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const balconyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF4E0'),
      roughness: 0.35,
    });

    const floors = Math.floor(cfg.h / 1.25);
    for (let f = 1; f < floors; f++) {
      const fy = f * 1.2;
      for (const wx of [-0.54, 0.54]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.58, 0.06), winMat);
        win.position.set(wx, fy, cfg.d / 2 + 0.02);
        bGroup.add(win);
      }

      // Add a 3D Balcony with Railing & Plants on alternating floors
      if (f % 2 === 1) {
        const balSlab = new THREE.Mesh(
          new THREE.BoxGeometry(1.48, 0.09, 0.48),
          balconyMat
        );
        balSlab.position.set(0, fy - 0.28, cfg.d / 2 + 0.24);
        const balRail = new THREE.Mesh(
          new THREE.BoxGeometry(1.48, 0.25, 0.05),
          balconyMat
        );
        balRail.position.set(0, fy - 0.14, cfg.d / 2 + 0.46);

        const bush1 = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), plantMat);
        bush1.position.set(0.44, fy - 0.06, cfg.d / 2 + 0.28);
        const bush2 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), plantMat);
        bush2.position.set(-0.44, fy - 0.08, cfg.d / 2 + 0.28);
        bGroup.add(balSlab, balRail, bush1, bush2);
      }
    }

    buildings.push(bGroup);
    group.add(bGroup);
  });

  // 3. Multi-Part 3D Anime Trees & Planter Boxes along the Footpaths
  const treePositions = [
    [-8.8, 1.6],
    [-8.8, -0.8],
    [-8.8, -4.0],
    [8.8, 1.6],
    [8.8, -0.8],
    [8.8, -4.0],
  ];
  const trunkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5C3D2E'),
    roughness: 0.75,
  });
  const planterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#382E73'),
    roughness: 0.45,
  });

  treePositions.forEach(([tx, tz], idx) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tx, 0.1, tz);

    const planter = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.34, 0.78), planterMat);
    planter.position.y = 0.17;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.15, 10), trunkMat);
    trunk.position.y = 0.75;

    const canopyColor = idx % 2 === 0 ? '#2EC4B6' : '#E83F8C';
    const canopyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(canopyColor),
      emissive: new THREE.Color(canopyColor),
      emissiveIntensity: 0.28,
      roughness: 0.4,
    });
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 14), canopyMat);
    c1.position.set(0, 1.48, 0);
    const c1Outline = new THREE.Mesh(new THREE.SphereGeometry(0.54, 12, 12), outlineMat);
    c1Outline.position.copy(c1.position);
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), canopyMat);
    c2.position.set(0.24, 1.75, 0.12);
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12), canopyMat);
    c3.position.set(-0.22, 1.7, -0.1);

    tGroup.add(planter, trunk, c1, c1Outline, c2, c3);
    trees.push(tGroup);
    group.add(tGroup);
  });

  // 4. Park Benches & Streetlamps on the Footpaths
  const benchPositions = [
    [-8.8, 0.4, Math.PI / 2],
    [-8.8, -2.4, Math.PI / 2],
    [8.8, 0.4, -Math.PI / 2],
    [8.8, -2.4, -Math.PI / 2],
  ];
  const benchWoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFB23E'),
    roughness: 0.4,
  });
  const benchFrameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1B1646'),
    metalness: 0.6,
    roughness: 0.3,
  });

  benchPositions.forEach(([bx, bz, rotY]) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(bx, 0.12, bz);
    bGroup.rotation.y = rotY;

    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.07, 0.38), benchWoodMat);
    seat.position.y = 0.28;
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.32, 0.06), benchWoodMat);
    backrest.position.set(0, 0.48, -0.16);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.36), benchFrameMat);
    legL.position.set(-0.44, 0.14, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.36), benchFrameMat);
    legR.position.set(0.44, 0.14, 0);

    bGroup.add(seat, backrest, legL, legR);
    benches.push(bGroup);
    group.add(bGroup);
  });

  // Streetlamps
  const lampPositions = [
    [-8.1, 2.4],
    [-8.1, -1.4],
    [-8.1, -4.6],
    [8.1, 2.4],
    [8.1, -1.4],
    [8.1, -4.6],
  ];
  const poleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    metalness: 0.7,
    roughness: 0.25,
  });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 1.6,
  });

  lampPositions.forEach(([lx, lz]) => {
    const lGroup = new THREE.Group();
    lGroup.position.set(lx, 0.1, lz);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.6, 10), poleMat);
    pole.position.y = 1.3;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.05), poleMat);
    arm.position.set(lx < 0 ? 0.2 : -0.2, 2.58, 0);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), bulbMat);
    globe.position.set(lx < 0 ? 0.38 : -0.38, 2.48, 0);
    lGroup.add(pole, arm, globe);
    streetlampsList.push(lGroup);
    group.add(lGroup);
  });
  const streetlights = streetlampsList;

  // 5. Giant 3D City Lyric Billboards (Left & Right Skyscrapers, framing the proscenium stage)
  const billboardCanvases: HTMLCanvasElement[] = [];
  const billboardTextures: THREE.CanvasTexture[] = [];

  [-6.7, 6.7].forEach((bx, idx) => {
    const bbGroup = new THREE.Group();
    bbGroup.position.set(bx, 4.65, -5.6);
    bbGroup.rotation.y = idx === 0 ? 0.26 : -0.26;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    billboardCanvases.push(canvas);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    billboardTextures.push(tex);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(4.3, 2.05, 0.16),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(idx === 0 ? '#FFB23E' : '#2EC4B6'),
        roughness: 0.25,
        metalness: 0.4,
      })
    );
    const frameOutline = new THREE.Mesh(
      new THREE.BoxGeometry(4.42, 2.17, 0.2),
      outlineMat
    );
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 1.8),
      new THREE.MeshBasicMaterial({map: tex})
    );
    screen.position.z = 0.09;

    const pillarL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8),
      poleMat
    );
    pillarL.position.set(-1.5, -1.6, 0);
    const pillarR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8),
      poleMat
    );
    pillarR.position.set(1.5, -1.6, 0);

    bbGroup.add(frame, frameOutline, screen, pillarL, pillarR);
    billboards.push(bbGroup);
    group.add(bbGroup);
  });

  let lastBillboardKey = '';
  function updateBillboards(lyric: string, sectionLabel: string, styleLabel: string) {
    const key = `${lyric}_${sectionLabel}_${styleLabel}`;
    if (key === lastBillboardKey) return;
    lastBillboardKey = key;

    billboardCanvases.forEach((canvas, idx) => {
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#120C32';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = idx === 0 ? '#FFB23E' : '#2EC4B6';
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, 496, 240);

      ctx.fillStyle = idx === 0 ? '#FFB23E' : '#2EC4B6';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(
        idx === 0 ? `SUNO AI STUDIO · ${sectionLabel.toUpperCase()}` : `ANIME 3D LYRIC · ${styleLabel.slice(0, 24)}`,
        24,
        44
      );

      // Wrap lyric across 2 lines on the 3D city billboard
      ctx.fillStyle = '#FFF4E0';
      ctx.font = '800 30px sans-serif';
      const words = lyric.replace(/[\[\]]/g, '').split(' ');
      let line1 = '';
      let line2 = '';
      words.forEach((w) => {
        if ((line1 + ' ' + w).length < 26) {
          line1 = (line1 + ' ' + w).trim();
        } else {
          line2 = (line2 + ' ' + w).trim();
        }
      });
      ctx.fillText(line1, 24, 118);
      if (line2) {
        ctx.fillStyle = '#E83F8C';
        ctx.fillText(line2, 24, 166);
      }

      // Bottom decorative waveform bars on billboard
      for (let b = 0; b < 28; b++) {
        const bh = 12 + ((b * 17 + lyric.length * 7) % 28);
        ctx.fillStyle = b % 2 === 0 ? '#2EC4B6' : '#FFB23E';
        ctx.fillRect(24 + b * 16, 228 - bh, 10, bh);
      }

      billboardTextures[idx].needsUpdate = true;
    });
  }

  return {
    group,
    buildings,
    trees,
    benches,
    streetlights,
    billboards,
    updateBillboards,
  };
}

export interface BeatAudioProducerRig {
  headphonesGroup: THREE.Group;
  workstationGroup: THREE.Group;
  faderCaps: THREE.Mesh[];
  jogWheelL: THREE.Mesh;
  jogWheelR: THREE.Mesh;
  waveformBlocks: THREE.Mesh[];
  pitchBendWave: THREE.Mesh;
}

/**
 * Creates Beat's ("me" — the AI Music Generator) 3D Audio Creation, Editing & Mixing Workstation:
 * 1. 3D Studio Headphones mounted on Beat's head with anime cel-outline
 * 2. Low-profile Floating 3D Producer Desk positioned so it never obscures Beat's Hollow Chest Ring
 * 3. Floating Holographic Timeline of 12 3D Audio Waveform Clip Blocks that Beat slices & mixes
 * 4. Elastic 3D Pitch-Bend Synth Wave
 */
export function createBeatAudioStudioRig(): BeatAudioProducerRig {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0B071E'),
    side: THREE.BackSide,
  });

  // 1. 3D Studio Headphones for Beat
  const headphonesGroup = new THREE.Group();
  headphonesGroup.position.set(0, 1.32, 0);

  const bandMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1B1646'),
    metalness: 0.6,
    roughness: 0.25,
  });
  const cupMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E83F8C'),
    emissive: new THREE.Color('#E83F8C'),
    emissiveIntensity: 0.55,
    roughness: 0.22,
  });
  const glowRingMat = new THREE.MeshBasicMaterial({color: new THREE.Color('#FFB23E')});

  const headband = new THREE.Mesh(
    new THREE.TorusGeometry(0.76, 0.055, 12, 32, Math.PI),
    bandMat
  );
  headband.position.y = 0.05;
  headphonesGroup.add(headband);

  [-0.76, 0.76].forEach((xSide) => {
    const earcup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 20), cupMat);
    earcup.rotation.z = Math.PI / 2;
    earcup.position.set(xSide, -0.05, 0);
    const earOutline = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.19, 18),
      outlineMat
    );
    earOutline.rotation.z = Math.PI / 2;
    earOutline.position.copy(earcup.position);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 10, 24), glowRingMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(xSide + (xSide < 0 ? -0.09 : 0.09), -0.05, 0);
    headphonesGroup.add(earcup, earOutline, ring);
  });

  // 2. Floating 3D Producer Mixing Desk & Holographic DAW (compact & below chest ring height!)
  const workstationGroup = new THREE.Group();
  workstationGroup.position.set(0, 0.34, 0.86);

  const deskHull = new THREE.Mesh(
    new THREE.BoxGeometry(1.58, 0.09, 0.56),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#161138'),
      roughness: 0.3,
      metalness: 0.45,
    })
  );
  deskHull.rotation.x = 0.18;
  const deskOutline = new THREE.Mesh(
    new THREE.BoxGeometry(1.64, 0.13, 0.62),
    outlineMat
  );
  deskOutline.rotation.x = 0.18;
  workstationGroup.add(deskHull, deskOutline);

  // Motorized Fader Caps on the Producer Desk
  const faderCaps: THREE.Mesh[] = [];
  const faderGeo = new THREE.BoxGeometry(0.075, 0.05, 0.11);
  for (let i = 0; i < 6; i++) {
    const capColor = i % 2 === 0 ? '#2EC4B6' : '#FFB23E';
    const cap = new THREE.Mesh(
      faderGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(capColor),
        emissive: new THREE.Color(capColor),
        emissiveIntensity: 0.7,
      })
    );
    cap.position.set(-0.32 + i * 0.128, 0.065, 0.0);
    faderCaps.push(cap);
    workstationGroup.add(cap);
  }

  // Dual DJ / Studio Jog-Wheels
  const jogGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.045, 24);
  const jogMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2EC4B6'),
    emissive: new THREE.Color('#E83F8C'),
    emissiveIntensity: 0.4,
    metalness: 0.6,
    roughness: 0.2,
  });
  const jogWheelL = new THREE.Mesh(jogGeo, jogMat);
  jogWheelL.position.set(-0.58, 0.07, 0.04);
  const jogWheelR = new THREE.Mesh(jogGeo, jogMat);
  jogWheelR.position.set(0.58, 0.07, 0.04);
  workstationGroup.add(jogWheelL, jogWheelR);

  // 3. 12 Floating Holographic 3D Audio Waveform Clip Blocks above the Desk
  const waveformBlocks: THREE.Mesh[] = [];
  const waveGeo = new THREE.BoxGeometry(0.085, 0.22, 0.06);
  const waveColors = ['#2EC4B6', '#FFB23E', '#E83F8C', '#FFF4E0'];
  for (let i = 0; i < 12; i++) {
    const cHex = waveColors[i % waveColors.length];
    const wMesh = new THREE.Mesh(
      waveGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(cHex),
        emissive: new THREE.Color(cHex),
        emissiveIntensity: 0.9,
        roughness: 0.2,
      })
    );
    wMesh.position.set((i - 5.5) * 0.125, 0.24, -0.04);
    waveformBlocks.push(wMesh);
    workstationGroup.add(wMesh);
  }

  // 4. Elastic 3D Pitch-Bend Synth Wave Ribbon
  const curvePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    curvePts.push(new THREE.Vector3((t - 0.5) * 1.45, 0.24 + Math.sin(t * Math.PI * 4) * 0.09, 0.05));
  }
  const pitchBendWave = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 32, 0.022, 8, false),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF4E0'),
      emissive: new THREE.Color('#FFB23E'),
      emissiveIntensity: 1.2,
    })
  );
  workstationGroup.add(pitchBendWave);

  return {
    headphonesGroup,
    workstationGroup,
    faderCaps,
    jogWheelL,
    jogWheelR,
    waveformBlocks,
    pitchBendWave,
  };
}

export {KINETIC_STYLES_50};
