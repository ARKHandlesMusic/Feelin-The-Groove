import * as THREE from 'three';
import {createRoundedRectShape, createStarShape, createHeartShape} from './stage-models';

export interface ChorusTilesRig {
  group: THREE.Group;
  tiers: THREE.Group[];
  bells: THREE.Mesh[];
}

/**
 * Creates the 3-tier Chorus Tiles (stacked harmonies: three tiers, each tier a different height and color)
 * with eyes and golden bells for the Final Chorus ("Your ears decide what rings as true").
 */
export function createChorusTiles(): ChorusTilesRig {
  const group = new THREE.Group();
  group.name = 'ChorusTilesGroup';
  const tiers: THREE.Group[] = [];
  const bells: THREE.Mesh[] = [];

  const tierConfigs = [
    {rowZ: -2.15, height: 0.78, color: '#2EC4B6', count: 6, spacing: 1.55},
    {rowZ: -2.95, height: 1.18, color: '#FFB23E', count: 7, spacing: 1.45},
    {rowZ: -3.75, height: 1.58, color: '#E83F8C', count: 8, spacing: 1.38},
  ];

  const outlineMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#0B071E'),
    side: THREE.BackSide,
  });

  const eyeGeo = new THREE.SphereGeometry(0.052, 10, 10);
  const eyeMat = new THREE.MeshBasicMaterial({color: new THREE.Color('#FFF4E0')});
  const bellGeo = new THREE.ConeGeometry(0.12, 0.18, 12);
  const bellMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFB23E'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 0.5,
    metalness: 0.75,
    roughness: 0.2,
  });

  tierConfigs.forEach((cfg) => {
    const tierGroup = new THREE.Group();
    const shape = createRoundedRectShape(0.82, cfg.height, 0.24);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      bevelSegments: 2,
    });
    geo.center();
    geo.translate(0, cfg.height / 2, 0);

    const outlineShape = createRoundedRectShape(0.9, cfg.height + 0.08, 0.26);
    const outlineGeo = new THREE.ExtrudeGeometry(outlineShape, {
      depth: 0.42,
      bevelEnabled: false,
    });
    outlineGeo.center();
    outlineGeo.translate(0, cfg.height / 2, 0);

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.color),
      emissive: new THREE.Color(cfg.color),
      emissiveIntensity: 0.28,
      roughness: 0.28,
      metalness: 0.12,
    });

    for (let i = 0; i < cfg.count; i++) {
      const x = (i - (cfg.count - 1) / 2) * cfg.spacing;
      const blob = new THREE.Group();
      blob.position.set(x, 0, cfg.rowZ);

      const body = new THREE.Mesh(geo, mat);
      body.castShadow = true;
      const bodyOutline = new THREE.Mesh(outlineGeo, outlineMat);
      blob.add(body, bodyOutline);

      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.15, cfg.height - 0.22, 0.23);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.15, cfg.height - 0.22, 0.23);
      blob.add(eyeL, eyeR);

      const bell = new THREE.Mesh(bellGeo, bellMat);
      bell.position.set(0.32, cfg.height + 0.14, 0.2);
      bell.visible = false;
      bells.push(bell);
      blob.add(bell);

      tierGroup.add(blob);
    }

    tiers.push(tierGroup);
    group.add(tierGroup);
  });

  group.visible = false;
  return {group, tiers, bells};
}

export interface MelodyOrbRig {
  group: THREE.Group;
  sphereMesh: THREE.Mesh;
  cubeMesh: THREE.Mesh;
  starMesh: THREE.Mesh;
  targetRing: THREE.Mesh;
  trailLine: THREE.Line;
}

/**
 * Creates the passing Melody Orb that travels in a figure-eight and morphs into a Star.
 */
export function createMelodyOrb(): MelodyOrbRig {
  const group = new THREE.Group();
  group.name = 'MelodyOrb';

  const orbMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 1.4,
    roughness: 0.15,
  });

  const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), orbMat);
  const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), orbMat);
  cubeMesh.visible = false;

  const starGeo = new THREE.ExtrudeGeometry(createStarShape(0.38, 0.17, 5), {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  starGeo.center();
  const starMesh = new THREE.Mesh(starGeo, orbMat);
  starMesh.visible = false;

  const targetRing = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.44, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#E83F8C'),
      side: THREE.DoubleSide,
    })
  );
  targetRing.visible = false;

  group.add(sphereMesh, cubeMesh, starMesh, targetRing);

  // Figure-eight trail line
  const trailPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    trailPts.push(new THREE.Vector3(Math.sin(t) * 2.4, 1.45 + Math.sin(t * 2) * 0.45, Math.cos(t) * 0.6));
  }
  const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPts);
  const trailLine = new THREE.Line(
    trailGeo,
    new THREE.LineBasicMaterial({
      color: new THREE.Color('#FFF4E0'),
      transparent: true,
      opacity: 0.6,
    })
  );
  trailLine.visible = false;

  group.visible = false;
  return {group, sphereMesh, cubeMesh, starMesh, targetRing, trailLine};
}

export interface WorkshopAndBridgeRig {
  workshopWall: THREE.Group;
  sliderHandles: THREE.Mesh[];
  metronomeGroup: THREE.Group;
  metronomeArm: THREE.Group;
  staircaseGroup: THREE.Group;
  giantDialGroup: THREE.Group;
  bridgeCardsGroup: THREE.Group;
  stoneNoteMesh: THREE.Mesh;
  stoneNoteMat: THREE.MeshStandardMaterial;
  pedestalsGroup: THREE.Group;
  selectorRing: THREE.Mesh;
  dottedDraftGroup: THREE.Group;
  draftFillMesh: THREE.Mesh;
  draftFillMat: THREE.MeshStandardMaterial;
  outroSquiggleMesh: THREE.Mesh;
}

/**
 * Creates all narrative stage props for Pre-Chorus, Verse 2 Workshop, Bridge Draft Cards,
 * Final Chorus Giant Turntable Dial, and Outro New Idea Squiggle.
 */
export function createNarrativeProps(): WorkshopAndBridgeRig {
  // 1. Verse 2 Workshop Wall of Sliders & Knobs (positioned at z=-4.85 clear of Chorus Tiles & EQ bars)
  const workshopWall = new THREE.Group();
  workshopWall.position.set(0, 0, -4.85);
  const wallBack = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 3.8, 0.25),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1B1646'),
      roughness: 0.55,
      metalness: 0.2,
    })
  );
  wallBack.position.y = 1.9;
  workshopWall.add(wallBack);

  const sliderHandles: THREE.Mesh[] = [];
  const trackGeo = new THREE.BoxGeometry(0.08, 2.2, 0.08);
  const trackMat = new THREE.MeshBasicMaterial({color: new THREE.Color('#352B6E')});
  const handleGeo = new THREE.BoxGeometry(0.42, 0.18, 0.18);

  for (let i = 0; i < 8; i++) {
    const x = (i - 3.5) * 1.25;
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(x, 1.9, 0.16);
    workshopWall.add(track);

    const hColor = i % 2 === 0 ? '#2EC4B6' : '#FFB23E';
    const handle = new THREE.Mesh(
      handleGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(hColor),
        emissive: new THREE.Color(hColor),
        emissiveIntensity: 0.45,
        roughness: 0.3,
      })
    );
    handle.position.set(x, 1.5 + (i % 3) * 0.4, 0.22);
    sliderHandles.push(handle);
    workshopWall.add(handle);
  }
  workshopWall.visible = false;

  // 2. Metronome Arm (Pre-Chorus 1: 0:16.2)
  const metronomeGroup = new THREE.Group();
  metronomeGroup.position.set(3.6, 0, 0.5);
  const metroBase = new THREE.Mesh(
    new THREE.ConeGeometry(0.55, 1.5, 4),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#28205E'),
      roughness: 0.4,
    })
  );
  metroBase.position.y = 0.75;
  metroBase.rotation.y = Math.PI / 4;
  metronomeGroup.add(metroBase);

  const metronomeArm = new THREE.Group();
  metronomeArm.position.set(0, 0.25, 0.28);
  const rod = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 1.35, 0.04),
    new THREE.MeshBasicMaterial({color: new THREE.Color('#FFF4E0')})
  );
  rod.position.y = 0.65;
  const weight = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.16, 0.08),
    new THREE.MeshBasicMaterial({color: new THREE.Color('#E83F8C')})
  );
  weight.position.y = 0.95;
  metronomeArm.add(rod, weight);
  metronomeGroup.add(metronomeArm);
  metronomeGroup.visible = false;

  // 3. Rising Staircase / Endless Horizon Bridge (Verse 2 & Pre-Chorus 2)
  const staircaseGroup = new THREE.Group();
  const stepGeo = new THREE.BoxGeometry(1.6, 0.14, 0.75);
  for (let i = 0; i < 10; i++) {
    const stepColor = i % 2 === 0 ? '#2EC4B6' : '#FFB23E';
    const step = new THREE.Mesh(
      stepGeo,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(stepColor),
        emissive: new THREE.Color(stepColor),
        emissiveIntensity: 0.35,
        roughness: 0.3,
      })
    );
    step.position.set(0, 0.22 + i * 0.26, 1.2 - i * 0.85);
    staircaseGroup.add(step);
  }
  staircaseGroup.visible = false;

  // 4. Giant Turntable Dial (Final Chorus 2:17.4 "Your hands can turn the whole thing through")
  const giantDialGroup = new THREE.Group();
  giantDialGroup.position.set(0, 0.12, 1.8);
  const dialCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.05, 0.28, 32),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2EC4B6'),
      emissive: new THREE.Color('#2EC4B6'),
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.25,
    })
  );
  const dialHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16),
    new THREE.MeshStandardMaterial({color: new THREE.Color('#FFB23E'), roughness: 0.2})
  );
  dialHandle.position.set(0.6, 0.25, 0);
  giantDialGroup.add(dialCylinder, dialHandle);
  giantDialGroup.visible = false;

  // 5. Bridge Floating Paper Draft Cards & Polished Stone Note (1:51.7 - 1:59.2)
  const bridgeCardsGroup = new THREE.Group();
  const cardGeo = new THREE.BoxGeometry(1.35, 1.75, 0.06);
  const cardMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    roughness: 0.55,
    metalness: 0.05,
  });

  [-2.2, 0, 2.2].forEach((xPos, idx) => {
    const cardHolder = new THREE.Group();
    cardHolder.position.set(xPos, 1.85, -0.6);
    const card = new THREE.Mesh(cardGeo, cardMat);
    cardHolder.add(card);

    if (idx === 0) {
      // Card 1: Heart stamp
      const hMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(createHeartShape(0.28), {depth: 0.04, bevelEnabled: false}),
        new THREE.MeshBasicMaterial({color: new THREE.Color('#E83F8C')})
      );
      hMesh.position.set(0, 0, 0.05);
      cardHolder.add(hMesh);
    } else if (idx === 1) {
      // Card 2: Redrawn melody line
      const lineMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.08, 0.04),
        new THREE.MeshBasicMaterial({color: new THREE.Color('#2EC4B6')})
      );
      lineMesh.position.set(0, 0.1, 0.05);
      cardHolder.add(lineMesh);
    }
    bridgeCardsGroup.add(cardHolder);
  });

  // Stone Note on Card 3 ("Maybe the first take just helps you find the shine")
  const stoneNoteMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#7B798E'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 0.0,
    roughness: 0.85,
    metalness: 0.1,
  });
  const stoneNoteMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 1), stoneNoteMat);
  stoneNoteMesh.position.set(2.2, 1.85, -0.35);
  bridgeCardsGroup.add(stoneNoteMesh);
  bridgeCardsGroup.visible = false;

  // 6. Bridge Three Pedestals & Selector Ring (1:59.2 "The choice stays yours")
  const pedestalsGroup = new THREE.Group();
  const pedGeo = new THREE.CylinderGeometry(0.45, 0.52, 0.9, 20);
  const pedMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFF4E0'),
    roughness: 0.4,
  });
  const versionColors = ['#2EC4B6', '#FFB23E', '#E83F8C'];
  [-2.0, 0, 2.0].forEach((xPos, idx) => {
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.set(xPos, 0.45, -0.4);
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(versionColors[idx]),
        emissive: new THREE.Color(versionColors[idx]),
        emissiveIntensity: 0.5,
        roughness: 0.2,
      })
    );
    gem.position.set(xPos, 1.25, -0.4);
    pedestalsGroup.add(ped, gem);
  });

  const selectorRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.045, 12, 36),
    new THREE.MeshBasicMaterial({color: new THREE.Color('#FFB23E')})
  );
  selectorRing.rotation.x = Math.PI / 2;
  selectorRing.position.set(0, 1.25, -0.4);
  pedestalsGroup.add(selectorRing);
  pedestalsGroup.visible = false;

  // 7. Dotted Draft Outline that fills with Spark's Amber Light (2:02.8)
  const dottedDraftGroup = new THREE.Group();
  dottedDraftGroup.position.set(0, 1.45, 0.3);
  const draftRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.03, 12, 36),
    new THREE.MeshBasicMaterial({color: new THREE.Color('#2EC4B6'), wireframe: true})
  );
  const draftFillMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#FFB23E'),
    emissive: new THREE.Color('#FFB23E'),
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.0,
    roughness: 0.2,
  });
  const draftFillMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(createHeartShape(0.45), {depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03}),
    draftFillMat
  );
  draftFillMesh.geometry.center();
  dottedDraftGroup.add(draftRing, draftFillMesh);
  dottedDraftGroup.visible = false;

  // 8. Outro New Drifting Squiggle Idea (2:31.1 "Bring me a thought, a phrase, a tune")
  const outroPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    outroPts.push(
      new THREE.Vector3(
        (t - 0.5) * 2.2,
        Math.sin(t * Math.PI * 4) * 0.26,
        Math.cos(t * Math.PI * 2) * 0.15
      )
    );
  }
  const outroCurve = new THREE.CatmullRomCurve3(outroPts);
  const outroSquiggleMesh = new THREE.Mesh(
    new THREE.TubeGeometry(outroCurve, 40, 0.055, 8, false),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E83F8C'),
      emissive: new THREE.Color('#2EC4B6'),
      emissiveIntensity: 0.85,
      roughness: 0.2,
    })
  );
  outroSquiggleMesh.visible = false;

  return {
    workshopWall,
    sliderHandles,
    metronomeGroup,
    metronomeArm,
    staircaseGroup,
    giantDialGroup,
    bridgeCardsGroup,
    stoneNoteMesh,
    stoneNoteMat,
    pedestalsGroup,
    selectorRing,
    dottedDraftGroup,
    draftFillMesh,
    draftFillMat,
    outroSquiggleMesh,
  };
}
