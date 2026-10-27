import * as THREE from 'three';

/**
 * Creates a soft radial contact shadow texture procedurally using HTML5 Canvas.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(10, 6, 28, 0.65)');
  grad.addColorStop(0.55, 'rgba(10, 6, 28, 0.25)');
  grad.addColorStop(1, 'rgba(10, 6, 28, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates a subtle brushed micro-grain roughness map procedurally.
 */
export function createMicroGrainTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#888888';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) {
    const x = (i * 37) % 128;
    const y = (i * 73) % 128;
    const v = 115 + ((i * 19) % 45);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, y, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Helper to create a 2D rounded rectangle THREE.Shape centered at (0,0).
 */
export function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/**
 * Helper to create a heart THREE.Shape centered at (0,0).
 */
export function createHeartShape(scale = 0.25): THREE.Shape {
  const s = scale;
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.7 * s);
  shape.bezierCurveTo(-0.9 * s, -0.1 * s, -1.0 * s, 0.7 * s, -0.45 * s, 0.85 * s);
  shape.bezierCurveTo(-0.15 * s, 0.95 * s, 0, 0.65 * s, 0, 0.5 * s);
  shape.bezierCurveTo(0, 0.65 * s, 0.15 * s, 0.95 * s, 0.45 * s, 0.85 * s);
  shape.bezierCurveTo(1.0 * s, 0.7 * s, 0.9 * s, -0.1 * s, 0, -0.7 * s);
  return shape;
}

/**
 * Helper to create a 5-pointed star THREE.Shape.
 */
export function createStarShape(outerR = 0.35, innerR = 0.16, points = 5): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export interface SparkRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  heartMesh: THREE.Mesh;
  heartMaterial: THREE.MeshStandardMaterial;
  pocketFlap: THREE.Group;
  wishesGroup: THREE.Group;
  deadlineGroup: THREE.Group;
  deadlineRingMesh: THREE.Mesh;
  deadlineWedgeMesh: THREE.Mesh;
  sunCoreMesh: THREE.Mesh;
  squiggleMesh: THREE.Mesh;
  bellProp: THREE.Group;
}

/**
 * Creates Spark ("you"): Amber teardrop (#FFB23E) with dot eyes, pulsing chest heart,
 * flip-open belly pocket, wishing stars, crooked squiggle leash, and orbiting deadline ring / sun.
 */
export function createSparkCharacter(shadowTex: THREE.Texture): SparkRig {
  const root = new THREE.Group();
  root.name = 'SparkCharacter';

  // Soft contact shadow flush on floor
  const shadowMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 24),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.015;
  root.add(shadowMesh);

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // 1. Primary Silhouette: Custom LatheGeometry Teardrop Body pivoted at y=0
  const lathePoints: THREE.Vector2[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 (bottom) to 1 (top tip)
    const y = t * 1.65;
    // Teardrop profile: plump rounded belly at t=0.32, tapering smoothly to top tip at t=1.0
    const r =
      t < 0.35
        ? Math.sin((t / 0.35) * (Math.PI / 2)) * 0.62
        : Math.cos(((t - 0.35) / 0.65) * (Math.PI / 2)) * 0.62 * (1 - 0.18 * t);
    lathePoints.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const teardropGeo = new THREE.LatheGeometry(lathePoints, 32);
  teardropGeo.scale(1.0, 1.0, 0.72); // Slightly flattened 2.5D profile
  const amberMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FFB23E'),
    roughness: 0.32,
    metalness: 0.08,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 0.12,
  });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0A061D'),
    side: THREE.BackSide,
  });

  const bodyMesh = new THREE.Mesh(teardropGeo, amberMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  const bodyOutlineGeo = teardropGeo.clone();
  bodyOutlineGeo.scale(1.06, 1.04, 1.06);
  const bodyOutlineMesh = new THREE.Mesh(bodyOutlineGeo, outlineMat);
  bodyOutlineMesh.position.y = -0.02;
  bodyGroup.add(bodyMesh, bodyOutlineMesh);

  // 2. Secondary Read: Expressive Anime Eyes + Dual Starlight Glints + Anime Cheek Blush & Brows
  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#140D36'),
    roughness: 0.12,
    metalness: 0.1,
  });
  const irisMat = new THREE.MeshBasicMaterial({color: new THREE.Color('#2EC4B6')});
  const glintMat = new THREE.MeshBasicMaterial({color: new THREE.Color('#FFF4E0')});
  const blushMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#E83F8C'),
    transparent: true,
    opacity: 0.55,
  });
  const eyeGeo = new THREE.SphereGeometry(0.095, 18, 18);
  const irisGeo = new THREE.SphereGeometry(0.052, 12, 12);
  const glintGeo = new THREE.SphereGeometry(0.032, 10, 10);
  const glintSmallGeo = new THREE.SphereGeometry(0.016, 8, 8);
  const browGeo = new THREE.BoxGeometry(0.14, 0.028, 0.03);
  const blushGeo = new THREE.SphereGeometry(0.055, 12, 12);
  blushGeo.scale(1.4, 0.65, 0.4);

  [-0.2, 0.2].forEach((xOffset, idx) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.scale.set(1.0, 1.18, 0.85);
    eye.position.set(xOffset, 1.03, 0.39);
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(xOffset, 1.01, 0.445);
    const glint = new THREE.Mesh(glintGeo, glintMat);
    glint.position.set(xOffset + 0.028, 1.06, 0.465);
    const glint2 = new THREE.Mesh(glintSmallGeo, glintMat);
    glint2.position.set(xOffset - 0.022, 0.99, 0.465);
    const brow = new THREE.Mesh(browGeo, eyeMat);
    brow.position.set(xOffset, 1.19, 0.38);
    brow.rotation.z = idx === 0 ? 0.14 : -0.14;
    const blush = new THREE.Mesh(blushGeo, blushMat);
    blush.position.set(xOffset * 1.42, 0.91, 0.39);
    bodyGroup.add(eye, iris, glint, glint2, brow, blush);
  });

  // 3. Accent Detail: Pulsing Heart-Shaped Glow in Chest
  const heartShape = createHeartShape(0.24);
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  heartGeo.center();
  const heartMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.0,
  });
  const heartMesh = new THREE.Mesh(heartGeo, heartMaterial);
  heartMesh.position.set(0, 0.68, 0.44);
  bodyGroup.add(heartMesh);

  // 4. Hinged Belly Pocket Flap ("A pocket full of wishes")
  const pocketFlap = new THREE.Group();
  pocketFlap.position.set(0, 0.32, 0.42);
  const flapShape = createRoundedRectShape(0.46, 0.22, 0.06);
  const flapGeo = new THREE.ExtrudeGeometry(flapShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  flapGeo.translate(0, 0.11, 0); // Pivot at bottom edge of pocket
  const flapMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E8921E'),
    roughness: 0.55,
    metalness: 0.1,
  });
  const flapMesh = new THREE.Mesh(flapGeo, flapMat);
  pocketFlap.add(flapMesh);
  bodyGroup.add(pocketFlap);

  // 5. Spilled Wishing Stars Group
  const wishesGroup = new THREE.Group();
  wishesGroup.position.set(0, 0.45, 0.55);
  const starGeo = new THREE.ExtrudeGeometry(createStarShape(0.11, 0.05, 5), {
    depth: 0.03,
    bevelEnabled: false,
  });
  const starMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  for (let i = 0; i < 6; i++) {
    const sMesh = new THREE.Mesh(starGeo, starMat);
    const angle = (i / 6) * Math.PI * 2;
    sMesh.position.set(Math.cos(angle) * 0.35, i * 0.15, Math.sin(angle) * 0.2);
    wishesGroup.add(sMesh);
  }
  wishesGroup.visible = false;
  root.add(wishesGroup);

  // 6. Orbiting Deadline Countdown Ring -> Swelling Golden Sun
  const deadlineGroup = new THREE.Group();
  deadlineGroup.position.set(0, 1.92, 0);
  const ringMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    emissive: new THREE.Color('#FFF4E0'),
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });
  const deadlineRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.025, 12, 48),
    ringMat
  );
  deadlineRingMesh.rotation.x = Math.PI / 2;
  deadlineGroup.add(deadlineRingMesh);

  const wedgeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#E83F8C'),
    side: THREE.DoubleSide,
  });
  const deadlineWedgeMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.44, 24, 1, 0, Math.PI * 1.4),
    wedgeMat
  );
  deadlineWedgeMesh.rotation.x = -Math.PI / 2;
  deadlineGroup.add(deadlineWedgeMesh);

  // Sun Core (visible when deadline ring transforms into the Sun in Final Chorus & Outro)
  const sunMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFB23E'),
    emissive: new THREE.Color('#FFF4E0'),
    emissiveIntensity: 1.5,
    roughness: 0.15,
  });
  const sunCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), sunMat);
  sunCoreMesh.visible = false;
  deadlineGroup.add(sunCoreMesh);
  deadlineGroup.visible = false;
  root.add(deadlineGroup);

  // 7. Crooked Little Rhyme Squiggle Leash
  const squigglePoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    squigglePoints.push(
      new THREE.Vector3(
        -0.5 - t * 2.8,
        0.55 + Math.sin(t * Math.PI * 5) * 0.28 + Math.cos(t * 11) * 0.1,
        Math.sin(t * Math.PI * 3) * 0.2
      )
    );
  }
  const squiggleCurve = new THREE.CatmullRomCurve3(squigglePoints);
  const squiggleGeo = new THREE.TubeGeometry(squiggleCurve, 48, 0.045, 8, false);
  const squiggleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFB23E'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 0.65,
    roughness: 0.3,
  });
  const squiggleMesh = new THREE.Mesh(squiggleGeo, squiggleMat);
  squiggleMesh.visible = false;
  root.add(squiggleMesh);

  // 8. Small Tuning Bell Prop (for Verse 2 "You wonder if the words ring true")
  const bellProp = new THREE.Group();
  const bellCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.26, 16),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFB23E'),
      metalness: 0.7,
      roughness: 0.2,
    })
  );
  const bellHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8),
    new THREE.MeshStandardMaterial({color: new THREE.Color('#FFF4E0'), roughness: 0.4})
  );
  bellHandle.position.y = 0.18;
  bellProp.add(bellCone, bellHandle);
  bellProp.position.set(0.65, 1.15, 0.25);
  bellProp.visible = false;
  root.add(bellProp);

  return {
    root,
    bodyGroup,
    heartMesh,
    heartMaterial,
    pocketFlap,
    wishesGroup,
    deadlineGroup,
    deadlineRingMesh,
    deadlineWedgeMesh,
    sunCoreMesh,
    squiggleMesh,
    bellProp,
  };
}

export interface BeatRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  solidBodyMesh: THREE.Mesh;
  subTilesGroup: THREE.Group;
  subTiles: THREE.Mesh[];
  sortingTray: THREE.Mesh;
  hollowRingMesh: THREE.Mesh;
  hollowRingMat: THREE.MeshStandardMaterial;
  lanternMesh: THREE.Mesh;
  lanternMat: THREE.MeshStandardMaterial;
  travelingRingMesh: THREE.Mesh;
  stripesGroup: THREE.Group;
  leftHand: THREE.Mesh;
  rightHand: THREE.Mesh;
}

/**
 * Creates Beat ("me"): Teal rounded square (#2EC4B6), no mouth, two soft anime eyes,
 * splittable 9-tile modular body, anime ink outline, and the Hollow Chest Ring emotional centerpiece.
 */
export function createBeatCharacter(shadowTex: THREE.Texture): BeatRig {
  const root = new THREE.Group();
  root.name = 'BeatCharacter';

  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0A061D'),
    side: THREE.BackSide,
  });

  // Contact shadow
  const shadowMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 24),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.015;
  root.add(shadowMesh);

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // 1. Primary Silhouette: Rounded Square Extruded Body + Anime Ink Outline
  const sqShape = createRoundedRectShape(1.36, 1.36, 0.26);
  const sqGeo = new THREE.ExtrudeGeometry(sqShape, {
    depth: 0.56,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 3,
  });
  sqGeo.center();
  sqGeo.translate(0, 0.85, 0);

  const tealMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#2EC4B6'),
    roughness: 0.24,
    metalness: 0.16,
    clearcoat: 0.45,
    clearcoatRoughness: 0.18,
    emissive: new THREE.Color('#2EC4B6'),
    emissiveIntensity: 0.1,
  });
  const solidBodyMesh = new THREE.Mesh(sqGeo, tealMat);
  solidBodyMesh.castShadow = true;
  solidBodyMesh.receiveShadow = true;

  const sqOutlineGeo = sqGeo.clone();
  sqOutlineGeo.scale(1.05, 1.05, 1.06);
  const solidOutlineMesh = new THREE.Mesh(sqOutlineGeo, outlineMat);
  solidOutlineMesh.position.y = -0.03;
  bodyGroup.add(solidBodyMesh, solidOutlineMesh);

  // 2. Modular 9 Sub-Tiles ("I gather up the pieces and decide what they could do")
  const subTilesGroup = new THREE.Group();
  subTilesGroup.position.set(0, 0.85, 0);
  const subTileShape = createRoundedRectShape(0.41, 0.41, 0.08);
  const subTileGeo = new THREE.ExtrudeGeometry(subTileShape, {
    depth: 0.48,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  subTileGeo.center();
  const subTiles: THREE.Mesh[] = [];
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      const tileMesh = new THREE.Mesh(subTileGeo, tealMat);
      tileMesh.position.set(c * 0.45, r * 0.45, 0);
      tileMesh.userData = {gridC: c, gridR: r};
      subTiles.push(tileMesh);
      subTilesGroup.add(tileMesh);
    }
  }
  subTilesGroup.visible = false;
  bodyGroup.add(subTilesGroup);

  // Sorting Tray for 0:12.57
  const sortingTray = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.08, 0.9),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF4E0'),
      roughness: 0.3,
      metalness: 0.2,
    })
  );
  sortingTray.position.set(-0.9, 0.72, 0.65);
  sortingTray.visible = false;
  root.add(sortingTray);

  // 3. Two Soft Anime Eyes (no mouth!) with Starlight Specular Glints
  const eyeShape = createRoundedRectShape(0.22, 0.16, 0.06);
  const eyeGeo = new THREE.ExtrudeGeometry(eyeShape, {depth: 0.04, bevelEnabled: false});
  eyeGeo.center();
  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#140D36'),
    roughness: 0.15,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    emissive: new THREE.Color('#FFF4E0'),
    emissiveIntensity: 0.9,
  });
  const pupilGeo = new THREE.SphereGeometry(0.048, 12, 12);
  [-0.29, 0.29].forEach((xOff) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(xOff, 1.18, 0.375);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(xOff + 0.02, 1.19, 0.405);
    bodyGroup.add(eye, pupil);
  });

  // 4. The Hollow Chest Ring (Emotional Spine of the Video)
  const recessMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#0E0B26'),
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  );
  recessMesh.rotation.x = Math.PI / 2;
  recessMesh.position.set(0, 0.72, 0.34);
  bodyGroup.add(recessMesh);

  const hollowRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1B1646'),
    emissive: new THREE.Color('#2EC4B6'),
    emissiveIntensity: 0.15,
    roughness: 0.25,
    metalness: 0.3,
  });
  const hollowRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.23, 0.048, 16, 36),
    hollowRingMat
  );
  hollowRingMesh.position.set(0, 0.72, 0.38);
  bodyGroup.add(hollowRingMesh);

  // Borrowed Amber Lantern inside Hollow Ring (Motif #2 & #3)
  const lanternMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFB23E'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 0.0,
    roughness: 0.15,
  });
  const lanternMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), lanternMat);
  lanternMesh.position.set(0, 0.72, 0.38);
  lanternMesh.visible = false;
  bodyGroup.add(lanternMesh);

  // Traveling Heartbeat Ring (0:39.9 transfer from Spark to Beat)
  const travelingRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.04, 12, 32),
    new THREE.MeshBasicMaterial({color: new THREE.Color('#FFB23E')})
  );
  travelingRingMesh.visible = false;
  root.add(travelingRingMesh);

  // 5. Custom Style Stripes (Verse 2: 0:56.9 "A custom style")
  const stripesGroup = new THREE.Group();
  const stripeColors = ['#E83F8C', '#FFB23E', '#FFF4E0'];
  stripeColors.forEach((hex, idx) => {
    const sMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.07, 0.66),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(hex),
        emissive: new THREE.Color(hex),
        emissiveIntensity: 0.35,
        roughness: 0.3,
      })
    );
    sMesh.position.set(0, 0.38 + idx * 0.12, 0);
    stripesGroup.add(sMesh);
  });
  stripesGroup.visible = false;
  bodyGroup.add(stripesGroup);

  // 6. Floating Articulated Hands
  const handGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const handMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    roughness: 0.3,
    metalness: 0.2,
  });
  const leftHand = new THREE.Mesh(handGeo, handMat);
  leftHand.position.set(-0.92, 0.78, 0.15);
  const rightHand = new THREE.Mesh(handGeo, handMat);
  rightHand.position.set(0.92, 0.78, 0.15);
  bodyGroup.add(leftHand, rightHand);

  return {
    root,
    bodyGroup,
    solidBodyMesh,
    subTilesGroup,
    subTiles,
    sortingTray,
    hollowRingMesh,
    hollowRingMat,
    lanternMesh,
    lanternMat,
    travelingRingMesh,
    stripesGroup,
    leftHand,
    rightHand,
  };
}

export interface NoteDancerRig {
  group: THREE.Group;
  headMesh: THREE.Mesh;
  leftSneaker: THREE.Group;
  rightSneaker: THREE.Group;
  bookmarkRibbon: THREE.Mesh;
}

/**
 * Creates a composite Sharp-Shoed Note performer with round note head, anime cel outline, stem, flag,
 * and pointed sneakers that pop on at 0:10.8.
 */
export function createSharpShoedNote(colorHex: string, shadowTex: THREE.Texture): NoteDancerRig {
  const group = new THREE.Group();

  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0A061D'),
    side: THREE.BackSide,
  });

  // Contact shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 16),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.4,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;
  group.add(shadow);

  const noteMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    emissive: new THREE.Color(colorHex),
    emissiveIntensity: 0.28,
    roughness: 0.26,
    metalness: 0.1,
  });

  // Note Head + Anime Cel Outline
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), noteMat);
  headMesh.scale.set(1.25, 0.9, 0.9);
  headMesh.rotation.z = -0.25;
  headMesh.position.set(0, 0.46, 0);
  headMesh.castShadow = true;

  const headOutline = new THREE.Mesh(new THREE.SphereGeometry(0.265, 16, 14), outlineMat);
  headOutline.scale.set(1.25, 0.9, 0.9);
  headOutline.rotation.z = -0.25;
  headOutline.position.copy(headMesh.position);
  group.add(headMesh, headOutline);

  // Stem
  const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 10), noteMat);
  stemMesh.position.set(0.2, 0.82, 0);
  group.add(stemMesh);

  // Flag
  const flagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.05), noteMat);
  flagMesh.position.set(0.3, 1.12, 0);
  flagMesh.rotation.z = -0.35;
  group.add(flagMesh);

  // Ribbon bookmark (for Verse 2 "a line to keep")
  const bookmarkRibbon = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.42, 0.04),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E83F8C'),
      emissive: new THREE.Color('#E83F8C'),
      emissiveIntensity: 0.6,
    })
  );
  bookmarkRibbon.position.set(0.2, 1.35, 0.06);
  bookmarkRibbon.visible = false;
  group.add(bookmarkRibbon);

  // Pointed Sneakers (Left & Right)
  const buildSneaker = (xSign: number) => {
    const shoe = new THREE.Group();
    shoe.position.set(xSign * 0.14, 0.08, 0.05);
    const upperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E83F8C'),
      roughness: 0.35,
    });
    const soleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFF4E0'),
      roughness: 0.5,
    });
    // Heel base
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.16), upperMat);
    // Sharp pointed toe cone
    const toe = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 12), upperMat);
    toe.rotation.x = Math.PI / 2;
    toe.position.set(0, -0.01, 0.18);
    // Crisp white sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.03, 0.3), soleMat);
    sole.position.set(0, -0.06, 0.07);
    shoe.add(heel, toe, sole);
    return shoe;
  };

  const leftSneaker = buildSneaker(-1);
  const rightSneaker = buildSneaker(1);
  group.add(leftSneaker, rightSneaker);

  return {
    group,
    headMesh,
    leftSneaker,
    rightSneaker,
    bookmarkRibbon,
  };
}
