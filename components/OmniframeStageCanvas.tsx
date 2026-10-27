'use client';

import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {
  CameraPresetMode,
  SHOTS,
  getBeatMetrics,
  getShotAtTime,
  getTileIntensity,
} from '@/lib/timeline';
import {
  createContactShadowTexture,
  createSparkCharacter,
  createBeatCharacter,
  createSharpShoedNote,
  NoteDancerRig,
} from '@/lib/stage-models';
import {
  createChorusTiles,
  createMelodyOrb,
  createNarrativeProps,
} from '@/lib/stage-props';
import {
  create3DLyricLetterPool,
  createCityScenery,
  createBeatAudioStudioRig,
  KINETIC_STYLES_50,
} from '@/lib/world-sceneries';

interface OmniframeStageCanvasProps {
  currentTimeRef: React.MutableRefObject<number>;
  audioEnergyRef: React.MutableRefObject<{bass: number; mid: number; high: number}>;
  cameraMode: CameraPresetMode;
  lyricStyleOverride?: number | 'auto';
  animeFilterStyle?: React.CSSProperties;
}

// Pre-allocated module-scope math objects (Zero GC inside render loop)
const _dummy = new THREE.Object3D();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();
const _colorC = new THREE.Color();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.2, 0);

export default function OmniframeStageCanvas({
  currentTimeRef,
  audioEnergyRef,
  cameraMode,
  lyricStyleOverride = 'auto',
  animeFilterStyle,
}: OmniframeStageCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cameraModeRef = useRef<CameraPresetMode>(cameraMode);
  const lyricStyleOverrideRef = useRef<number | 'auto'>(lyricStyleOverride);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    lyricStyleOverrideRef.current = lyricStyleOverride;
  }, [lyricStyleOverride]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software-WebGL Guard per Three.js skill
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    // 4K UHD Supersampling on hardware GPU, 1x on Software GL
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min((window.devicePixelRatio || 1) * 1.5, 2.5)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('data-stage-webgl', 'true');

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1B1646');
    scene.fog = new THREE.FogExp2('#1B1646', 0.028);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    camera.position.set(0, 3.2, 10.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.2, 0);
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 3.0;
    controls.maxDistance = 24.0;
    controls.enabled = false;

    // 2. Balanced Studio 3-Point Lighting Rig (Warm Key + Cool Hemisphere Fill + Rim)
    const hemiLight = new THREE.HemisphereLight('#FFF4E0', '#1B1646', 0.85);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF4E0', 1.85);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const d = 9;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#E83F8C', 1.15);
    rimLight.position.set(-7, 6, -8);
    scene.add(rimLight);

    // Master Turntable Stage Group (allows spinning the entire stage 360° at 2:17.4!)
    const stageTurntable = new THREE.Group();
    scene.add(stageTurntable);

    // 3. Expanded Dark Stage Platform & 16-Column x 8-Row Beat-Grid Floor (128 Instanced Tiles)
    const stageBase = new THREE.Mesh(
      new THREE.BoxGeometry(22.4, 0.44, 14.8),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#120E31'),
        roughness: 0.7,
        metalness: 0.2,
      })
    );
    stageBase.position.set(0, -0.24, -1.0);
    stageBase.receiveShadow = true;
    stageTurntable.add(stageBase);

    const COLS = 16;
    const ROWS = 8;
    const TILE_COUNT = COLS * ROWS;
    const tileGeo = new THREE.BoxGeometry(0.84, 0.12, 0.84);
    const tileMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      roughness: 0.28,
      metalness: 0.15,
    });
    const floorTilesMesh = new THREE.InstancedMesh(tileGeo, tileMat, TILE_COUNT);
    floorTilesMesh.receiveShadow = true;
    floorTilesMesh.frustumCulled = false;

    for (let i = 0; i < TILE_COUNT; i++) {
      floorTilesMesh.setColorAt(i, new THREE.Color('#241E59'));
    }
    stageTurntable.add(floorTilesMesh);

    // 16 Back-Row Equalizer Bars (InstancedMesh)
    const eqGeo = new THREE.BoxGeometry(0.68, 1.0, 0.32);
    eqGeo.translate(0, 0.5, 0); // Pivot at bottom
    const eqMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      emissive: new THREE.Color('#2EC4B6'),
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.2,
    });
    const eqBarsMesh = new THREE.InstancedMesh(eqGeo, eqMat, COLS);
    eqBarsMesh.frustumCulled = false;
    const eqPalette = ['#2EC4B6', '#FFB23E', '#E83F8C', '#FFF4E0'];
    for (let c = 0; c < COLS; c++) {
      eqBarsMesh.setColorAt(c, new THREE.Color(eqPalette[c % eqPalette.length]));
    }
    stageTurntable.add(eqBarsMesh);

    // 4. Cast, Beat's 3D Audio Producer Workstation, 3D Lyric Letters & Pop-Up City Scenery
    const shadowTex = createContactShadowTexture();
    const spark = createSparkCharacter(shadowTex);
    const beat = createBeatCharacter(shadowTex);
    const beatAudioStudio = createBeatAudioStudioRig();
    beat.bodyGroup.add(beatAudioStudio.headphonesGroup);
    beat.root.add(beatAudioStudio.workstationGroup);
    stageTurntable.add(spark.root, beat.root);

    const lyric3DPool = create3DLyricLetterPool();
    const cityScenery = createCityScenery();
    stageTurntable.add(lyric3DPool.group, cityScenery.group);

    // 4 Sharp-Shoed Note Performers
    const noteColors = ['#FFB23E', '#2EC4B6', '#E83F8C', '#FFF4E0'];
    const notes: NoteDancerRig[] = noteColors.map((hex) => {
      const n = createSharpShoedNote(hex, shadowTex);
      stageTurntable.add(n.group);
      return n;
    });

    const chorusTiles = createChorusTiles();
    const melodyOrb = createMelodyOrb();
    const narrativeProps = createNarrativeProps();

    stageTurntable.add(
      chorusTiles.group,
      melodyOrb.group,
      melodyOrb.trailLine,
      narrativeProps.workshopWall,
      narrativeProps.metronomeGroup,
      narrativeProps.staircaseGroup,
      narrativeProps.giantDialGroup,
      narrativeProps.bridgeCardsGroup,
      narrativeProps.pedestalsGroup,
      narrativeProps.dottedDraftGroup,
      narrativeProps.outroSquiggleMesh
    );

    // Pre-warm shaders on GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Ensure initial URL ?t= is synced prior to the very first draw
    try {
      const params = new URLSearchParams(window.location.search);
      const tParam = params.get('t');
      if (tParam) {
        const parsed = parseFloat(tParam);
        if (!Number.isNaN(parsed)) {
          currentTimeRef.current = parsed;
        }
      }
    } catch {
      // Ignore SSR/URL errors
    }

    let lastShotId = '';
    let lastEvaluatedTime = -999;
    let lastClockTime = performance.now();
    let frameId = 0;

    // Deterministic frame evaluation & animation update
    function evaluateSceneAtTime(t: number, dt: number) {
      const shot = getShotAtTime(t);
      const metrics = getBeatMetrics(t);
      const energy = audioEnergyRef.current;
      const isJump = Math.abs(t - lastEvaluatedTime) > 1.2;
      lastEvaluatedTime = t;

      // Background & Fog smooth or hard-cut transition
      _colorA.set(shot.bgHex);
      if (isJump || lastShotId === '') {
        (scene.background as THREE.Color).copy(_colorA);
      } else {
        (scene.background as THREE.Color).lerp(_colorA, 0.25);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.copy(scene.background as THREE.Color);
      }

      // Stage 360 spin in Final Chorus (2:17.35 - 2:19.11 "Your hands can turn the whole thing through")
      if (shot.specialOverlay === 'stage_spin_360') {
        const spinP = (t - shot.startTime) / Math.max(0.1, shot.endTime - shot.startTime);
        stageTurntable.rotation.y = spinP * Math.PI * 2;
      } else if (shot.specialOverlay === 'vinyl_wipe') {
        const spinP = (t - shot.startTime) / Math.max(0.1, shot.endTime - shot.startTime);
        stageTurntable.rotation.y = spinP * Math.PI * 4;
      } else {
        stageTurntable.rotation.y = THREE.MathUtils.damp(stageTurntable.rotation.y, 0, 8, dt);
      }

      // Update 16x8 Beat-Grid Floor Tiles
      _colorB.set(shot.floorBaseHex);
      _colorC.set(shot.accentHex);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c;
          const intensity = getTileIntensity(c, r, t, energy.bass);
          const x = (c - 7.5) * 0.9;
          const z = (r - 3.5) * 0.9;
          const liftY = intensity * 0.14;

          _dummy.position.set(x, liftY, z);
          // Flip tiles during vinyl wipe (0:53 - 0:56.87)
          if (shot.specialOverlay === 'vinyl_wipe') {
            _dummy.rotation.set(((t - 53.0) * 6 + c * 0.2) % (Math.PI * 2), 0, 0);
          } else {
            _dummy.rotation.set(0, 0, 0);
          }
          _dummy.scale.set(1, 1, 1);
          _dummy.updateMatrix();
          floorTilesMesh.setMatrixAt(idx, _dummy.matrix);

          _colorA.copy(_colorB).lerp(_colorC, intensity);
          if (intensity < 0.12) {
            _colorA.set('#161238');
          }
          floorTilesMesh.setColorAt(idx, _colorA);
        }
      }
      floorTilesMesh.instanceMatrix.needsUpdate = true;
      if (floorTilesMesh.instanceColor) floorTilesMesh.instanceColor.needsUpdate = true;

      // Update 16 Back-Row Equalizer Bars
      const isChorusOrBreak =
        shot.section === 'chorus1' ||
        shot.section === 'chorus2' ||
        shot.section === 'finalchorus' ||
        shot.section === 'break1' ||
        shot.section === 'break2';
      for (let c = 0; c < COLS; c++) {
        const x = (c - 7.5) * 0.9;
        const wave = Math.abs(Math.sin(t * 6 + c * 0.55));
        const barHeight =
          shot.specialOverlay === 'intro_title' || shot.specialOverlay === 'loop_single_tile'
            ? 0.05
            : (isChorusOrBreak ? 0.8 : 0.25) +
              wave * (isChorusOrBreak ? 2.4 : 0.75) +
              energy.bass * 1.1;
        _dummy.position.set(x, 0.06, -3.95);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.set(1, Math.max(0.05, barHeight), 1);
        _dummy.updateMatrix();
        eqBarsMesh.setMatrixAt(c, _dummy.matrix);
      }
      eqBarsMesh.instanceMatrix.needsUpdate = true;

      // =========================================================================
      // SPARK ("YOU") CHOREOGRAPHY & SQUASH-AND-STRETCH
      // =========================================================================
      const sparkBounce = metrics.sparkBounce;
      const squashY = 1 + sparkBounce * 0.24 - (1 - sparkBounce) * 0.08;
      const squashXZ = 1 / Math.sqrt(squashY);
      spark.bodyGroup.scale.set(squashXZ, squashY, squashXZ);

      if (shot.sparkAction === 'waiting_offstage_left') {
        spark.root.visible = false;
      } else {
        spark.root.visible = true;
        let sparkX = -1.45;
        let sparkY = sparkBounce * 0.38;
        let sparkZ = 0.4;
        let sparkRotY = 0.25;

        if (shot.id === 'shot_02_v1_crooked_rhyme') {
          const enterP = Math.min(1, (t - 2.75) / 1.8);
          sparkX = -5.0 + enterP * 3.5;
        } else if (shot.id === 'shot_20_v2_tower_bridge') {
          // Riding the stacked note tower cleanly at x = -2.4
          sparkX = -2.4;
          sparkY = 1.72 + sparkBounce * 0.22;
        } else if (shot.id === 'shot_24_pc2_staircase_riser') {
          const climbP = Math.min(1, (t - 74.39) / 5.0);
          sparkX = -0.6;
          sparkY = climbP * 1.8 + sparkBounce * 0.2;
          sparkZ = 1.0 - climbP * 2.5;
        } else if (shot.id === 'shot_33_b2_mirror_dance') {
          // Role swap: Spark does Beat's clipped off-beat moves!
          sparkY = metrics.snapProgress * 0.25;
          sparkRotY = (metrics.beatIndex % 2 === 0 ? -0.35 : 0.35) * metrics.snapProgress;
        } else if (shot.specialOverlay === 'fourth_wall') {
          sparkX = -1.2;
          sparkZ = 1.3;
          sparkRotY = 0; // Pointing straight at viewer
        }

        spark.root.position.set(sparkX, sparkY, sparkZ);
        spark.bodyGroup.rotation.y = sparkRotY;
      }

      // Spark Heart Glow Pulse
      spark.heartMaterial.emissiveIntensity = 1.1 + sparkBounce * 1.2;
      const heartScale = 1 + sparkBounce * 0.25;
      spark.heartMesh.scale.setScalar(heartScale);

      // Spark Belly Pocket & Wishing Stars (0:05.36 - 0:16.19)
      const pocketOpen = t >= 5.36 && t < 16.19;
      spark.pocketFlap.rotation.x = pocketOpen ? 1.15 : 0;
      spark.wishesGroup.visible = pocketOpen;
      if (pocketOpen) {
        spark.wishesGroup.rotation.y = t * 1.8;
        spark.wishesGroup.position.y = 0.55 + Math.sin(t * 3) * 0.15;
      }

      // Crooked Squiggle Leash (0:02.75 - 0:12.57)
      spark.squiggleMesh.visible = t >= 2.75 && t < 12.57;
      if (spark.squiggleMesh.visible) {
        spark.squiggleMesh.rotation.x = Math.sin(t * 6) * 0.18;
      }

      // Spark Tuning Bell Prop (Verse 2: 1:04.15 - 1:07.21)
      spark.bellProp.visible = shot.id === 'shot_21_v2_words_ring_true';
      if (spark.bellProp.visible) {
        spark.bellProp.rotation.z = Math.sin(t * 16) * 0.35;
      }

      // Deadline Countdown Ring -> Golden Sun -> Noon Sun (Motif #2)
      if (shot.deadlineState === 'hidden') {
        spark.deadlineGroup.visible = false;
      } else if (shot.deadlineState === 'orbiting') {
        spark.deadlineGroup.visible = true;
        spark.deadlineRingMesh.visible = true;
        spark.deadlineWedgeMesh.visible = true;
        spark.sunCoreMesh.visible = false;
        spark.deadlineGroup.position.set(
          Math.cos(t * 2.5) * 0.12,
          1.95,
          Math.sin(t * 2.5) * 0.12
        );
        spark.deadlineGroup.scale.setScalar(1);
        spark.deadlineGroup.rotation.y = t * 1.6;
      } else if (shot.deadlineState === 'rising_sun' || shot.deadlineState === 'noon_sun') {
        spark.deadlineGroup.visible = true;
        spark.deadlineWedgeMesh.visible = false;
        spark.sunCoreMesh.visible = true;
        const isNoon = shot.deadlineState === 'noon_sun' && t >= 155.23;
        const targetSunY = isNoon ? 4.4 : 3.2;
        spark.deadlineGroup.position.set(1.45, targetSunY, -2.8);
        spark.deadlineGroup.scale.setScalar(isNoon ? 1.85 : 1.45);
        spark.deadlineGroup.rotation.y = t * 0.8;
      }

      // =========================================================================
      // BEAT ("ME") CHOREOGRAPHY, MODULAR TILE SPLIT & HOLLOW CHEST RING
      // =========================================================================
      if (shot.beatAction === 'hidden_below' || shot.beatAction === 'hidden_right') {
        beat.root.visible = false;
      } else {
        beat.root.visible = true;
        let beatX = 1.45;
        let beatY = 0;
        let beatZ = 0.35;
        let beatRotZ = 0;
        let beatRotY = -0.22;

        if (shot.id === 'shot_03_v1_pocket_deadline') {
          beatX = 3.8; // Peeking from right
        } else if (shot.id === 'shot_04_v1_sharper_shoes') {
          const slideP = Math.min(1, (t - 9.04) / 1.2);
          beatX = 3.8 - slideP * 2.35;
        } else if (shot.id === 'shot_07_pc1_open_space') {
          // Rolling along dotted path
          beatX = Math.sin(t * 2.0) * 1.8;
          beatZ = Math.cos(t * 2.0) * 0.9;
        } else if (shot.id === 'shot_24_pc2_staircase_riser') {
          const climbP = Math.min(1, (t - 74.39) / 5.0);
          beatX = 0.75;
          beatY = climbP * 1.8;
          beatZ = 1.0 - climbP * 2.5;
        } else if (shot.specialOverlay === 'fourth_wall') {
          beatX = 1.2;
          beatZ = 1.3;
          beatRotY = 0;
        } else {
          // Clipped off-beat groove: hold, snap, hold!
          const snap = metrics.snapProgress;
          beatY = snap * 0.18;
          beatRotZ = (metrics.beatIndex % 2 === 0 ? 1 : -1) * snap * 0.12;
          beatRotY = -0.2 + (metrics.beatIndex % 2 === 0 ? 0.18 : -0.18) * snap;
        }

        beat.root.position.set(beatX, beatY, beatZ);
        beat.bodyGroup.rotation.set(0, beatRotY, beatRotZ);
      }

      // Beat Splits into 9 Modular Tiles at 0:12.57 ("I gather up the pieces and decide what they could do")
      const isSplitting = shot.beatAction === 'split_tiles_sort_tray';
      beat.solidBodyMesh.visible = !isSplitting;
      beat.subTilesGroup.visible = isSplitting;
      beat.sortingTray.visible = isSplitting;
      if (isSplitting) {
        const splitPhase = Math.sin(((t - 12.57) / 3.62) * Math.PI);
        beat.subTiles.forEach((tileMesh, idx) => {
          const {gridC, gridR} = tileMesh.userData as {gridC: number; gridR: number};
          tileMesh.position.set(
            gridC * (0.45 + splitPhase * 0.55) - splitPhase * 0.35,
            gridR * (0.45 + splitPhase * 0.35) + Math.sin(t * 6 + idx) * 0.12,
            splitPhase * 0.45
          );
          tileMesh.rotation.set(splitPhase * idx * 0.3, splitPhase * 0.6, 0);
        });
      }

      // Beat Custom Painted Stripes (Verse 2 onwards: 0:56.87 - 1:11.50 & Final Chorus)
      beat.stripesGroup.visible =
        shot.section === 'verse2' || shot.section === 'finalchorus';

      // Beat Hollow Chest Ring Motif State (Motif #1, #2, #3)
      beat.travelingRingMesh.visible = false;
      if (shot.hollowRingState === 'dim') {
        beat.hollowRingMat.color.set('#1B1646');
        beat.hollowRingMat.emissive.set('#2EC4B6');
        beat.hollowRingMat.emissiveIntensity = 0.12;
        beat.lanternMesh.visible = false;
      } else if (shot.hollowRingState === 'faint') {
        beat.hollowRingMat.color.set('#2EC4B6');
        beat.hollowRingMat.emissive.set('#2EC4B6');
        beat.hollowRingMat.emissiveIntensity = 0.55;
        beat.lanternMesh.visible = false;
      } else if (shot.hollowRingState === 'lit_combo') {
        // At 0:39.9, show Spark's heartbeat ring traveling across into Beat's chest!
        if (t >= 39.9 && t < 41.2) {
          const travelP = (t - 39.9) / 1.3;
          beat.travelingRingMesh.visible = true;
          beat.travelingRingMesh.position.set(
            -2.8 * (1 - travelP),
            0.72 + Math.sin(travelP * Math.PI) * 0.35,
            0.45
          );
        }
        beat.hollowRingMat.color.set('#FFB23E');
        beat.hollowRingMat.emissive.set('#2EC4B6');
        beat.hollowRingMat.emissiveIntensity = 1.2 + sparkBounce * 0.8;
        beat.lanternMesh.visible = true;
        beat.lanternMat.emissiveIntensity = 1.0 + sparkBounce * 0.6;
      } else if (shot.hollowRingState === 'lantern') {
        beat.hollowRingMat.color.set('#2EC4B6');
        beat.hollowRingMat.emissive.set('#FFB23E');
        beat.hollowRingMat.emissiveIntensity = 0.85;
        beat.lanternMesh.visible = true;
        beat.lanternMat.emissiveIntensity = 1.4 + Math.sin(t * 8) * 0.35;
      } else if (
        shot.hollowRingState === 'glowing_amber' ||
        shot.hollowRingState === 'double_pulse'
      ) {
        const doubleBeat =
          shot.hollowRingState === 'double_pulse'
            ? Math.abs(Math.sin(t * Math.PI * 4.2))
            : sparkBounce;
        beat.hollowRingMat.color.set('#FFB23E');
        beat.hollowRingMat.emissive.set('#FFB23E');
        beat.hollowRingMat.emissiveIntensity = 1.6 + doubleBeat * 1.2;
        beat.lanternMesh.visible = true;
        beat.lanternMat.emissiveIntensity = 1.8 + doubleBeat * 1.2;
      }

      // =========================================================================
      // SHARP-SHOED NOTES (Flanking Formation — ZERO Phasing with Beat's Desk!)
      // =========================================================================
      const showNotes =
        t >= 9.04 &&
        shot.section !== 'intro' &&
        shot.section !== 'bridge' &&
        shot.section !== 'outro';
      const hasSharpShoes = t >= 10.6;
      const noteSlotsX = [-3.65, -2.55, 2.85, 3.95];

      notes.forEach((nRig, idx) => {
        nRig.group.visible = showNotes;
        if (!showNotes) return;

        nRig.leftSneaker.visible = hasSharpShoes;
        nRig.rightSneaker.visible = hasSharpShoes;
        nRig.bookmarkRibbon.visible = idx === 0 && shot.section === 'verse2';

        // Soft pillowy scale at 0:09.04 - 0:10.6 ("Make it tender")
        if (!hasSharpShoes) {
          const pillow = 1.15 + Math.sin(t * 6 + idx) * 0.15;
          nRig.headMesh.scale.set(1.3 * pillow, 1.0 * pillow, 1.0 * pillow);
        } else if (shot.id === 'shot_19_v2_custom_style' && idx === 2) {
          // "a note you want to bend": stretch like rubber
          nRig.headMesh.scale.set(1.8 + Math.sin(t * 8) * 0.4, 0.7, 0.9);
        } else {
          nRig.headMesh.scale.set(1.25, 0.9, 0.9);
        }

        if (shot.id === 'shot_20_v2_tower_bridge') {
          // Stack cleanly into a 4-note tower at x = -2.4 under Spark (y = 1.72)
          nRig.group.position.set(-2.4, idx * 0.42, 0.4);
          nRig.group.rotation.z = 0;
        } else if (shot.id === 'shot_21_v2_words_ring_true' && idx === 3) {
          // Wobbling note sitting outside the staff on far right
          nRig.group.position.set(3.85, 0.28, 1.35);
          nRig.group.rotation.z = Math.sin(t * 22) * 0.35;
        } else {
          const baseX = noteSlotsX[idx];
          const tapHop = hasSharpShoes
            ? Math.abs(Math.sin(t * 8.2 + idx * 1.1)) * 0.24
            : 0.05;
          nRig.group.position.set(baseX, tapHop, 1.48);
          nRig.group.rotation.z = Math.sin(t * 4 + idx) * 0.08;
          // Tap-dancing sneaker articulation
          nRig.leftSneaker.rotation.x = Math.sin(t * 12 + idx) * 0.35;
          nRig.rightSneaker.rotation.x = -Math.sin(t * 12 + idx) * 0.35;
        }
      });

      // =========================================================================
      // 3-TIER CHORUS TILES & BELLS
      // =========================================================================
      const showChorusTiles =
        shot.section === 'chorus1' ||
        shot.section === 'chorus2' ||
        shot.section === 'finalchorus' ||
        (shot.section === 'break2' && t < 107.0);
      chorusTiles.group.visible = showChorusTiles;
      if (showChorusTiles) {
        const sinkFactor =
          shot.section === 'break2' && t >= 103.0
            ? Math.max(0, 1 - (t - 103.0) / 4.0)
            : 1;
        chorusTiles.tiers.forEach((tier, tIdx) => {
          const bounce = Math.abs(Math.sin(t * 5.2 + tIdx * 0.7)) * 0.22;
          tier.position.y = -1.5 * (1 - sinkFactor) + bounce * sinkFactor;
        });
        const showBells = shot.id === 'shot_40_fc_ears_ring_true';
        chorusTiles.bells.forEach((b, bIdx) => {
          b.visible = showBells;
          if (showBells) {
            b.rotation.z = Math.sin(t * 18 + bIdx) * 0.4;
          }
        });
      }

      // =========================================================================
      // MELODY ORB & STAR MORPH (Choruses 1, 2, Final Chorus)
      // =========================================================================
      const showOrb =
        shot.id === 'shot_09_c1_pass_melody' ||
        shot.id === 'shot_10_c1_make_it_new' ||
        shot.id === 'shot_26_c2_crowd_orb_loop' ||
        shot.id === 'shot_27_c2_triple_morph' ||
        shot.id === 'shot_38_fc_deadline_becomes_sun';
      melodyOrb.group.visible = showOrb;
      melodyOrb.trailLine.visible =
        shot.id === 'shot_09_c1_pass_melody' || shot.id === 'shot_26_c2_crowd_orb_loop';

      if (showOrb) {
        const figT = t * 3.4;
        melodyOrb.group.position.set(
          Math.sin(figT) * 2.2,
          1.45 + Math.sin(figT * 2) * 0.45,
          Math.cos(figT) * 0.65
        );
        melodyOrb.group.rotation.y = t * 3.0;

        if (shot.id === 'shot_10_c1_make_it_new') {
          const isStar = t >= 29.9;
          melodyOrb.sphereMesh.visible = !isStar;
          melodyOrb.cubeMesh.visible = false;
          melodyOrb.starMesh.visible = isStar;
          melodyOrb.targetRing.visible = !isStar;
        } else if (shot.id === 'shot_27_c2_triple_morph') {
          const phase = Math.floor(((t - 84.29) / 1.62) * 3) % 3;
          melodyOrb.sphereMesh.visible = phase === 0;
          melodyOrb.cubeMesh.visible = phase === 1;
          melodyOrb.starMesh.visible = phase === 2;
          melodyOrb.targetRing.visible = false;
        } else {
          melodyOrb.sphereMesh.visible = true;
          melodyOrb.cubeMesh.visible = false;
          melodyOrb.starMesh.visible = false;
          melodyOrb.targetRing.visible = false;
        }
      }

      // =========================================================================
      // WORKSHOP WALL, METRONOME, STAIRCASE, BRIDGE CARDS & OUTRO SQUIGGLE
      // =========================================================================
      narrativeProps.workshopWall.visible =
        shot.section === 'verse2' || shot.section === 'finalchorus';
      if (narrativeProps.workshopWall.visible) {
        narrativeProps.sliderHandles.forEach((h, i) => {
          h.position.y = 1.45 + Math.sin(t * 3.5 + i * 0.9) * 0.65;
        });
      }

      narrativeProps.metronomeGroup.visible = shot.id === 'shot_06_pc1_colors_pace';
      if (narrativeProps.metronomeGroup.visible) {
        narrativeProps.metronomeArm.rotation.z = Math.sin(t * 10) * 0.55;
      }

      narrativeProps.staircaseGroup.visible =
        shot.id === 'shot_20_v2_tower_bridge' ||
        shot.id === 'shot_24_pc2_staircase_riser' ||
        shot.section === 'finalchorus';

      narrativeProps.giantDialGroup.visible = shot.id === 'shot_41_fc_spin_stage_360';
      if (narrativeProps.giantDialGroup.visible) {
        narrativeProps.giantDialGroup.rotation.y = t * 4.5;
      }

      // Bridge Floating Draft Cards & Stone Note (1:51.69 - 1:59.21)
      narrativeProps.bridgeCardsGroup.visible =
        shot.id === 'shot_34_br_draft_cards' || shot.id === 'shot_35_br_polish_stone';
      if (narrativeProps.bridgeCardsGroup.visible) {
        narrativeProps.bridgeCardsGroup.position.y = Math.sin(t * 2.2) * 0.14;
        if (shot.id === 'shot_35_br_polish_stone') {
          const polishP = Math.min(1, (t - 115.38) / 3.0);
          narrativeProps.stoneNoteMat.color.lerpColors(
            new THREE.Color('#7B798E'),
            new THREE.Color('#FFB23E'),
            polishP
          );
          narrativeProps.stoneNoteMat.emissiveIntensity = polishP * 1.4;
          narrativeProps.stoneNoteMat.roughness = 0.85 - polishP * 0.7;
          narrativeProps.stoneNoteMesh.rotation.y = t * 2.5;
        }
      }

      // Bridge 3 Pedestals & Selector Ring (1:59.21 - 2:02.82)
      narrativeProps.pedestalsGroup.visible = shot.id === 'shot_36_br_three_pedestals';
      if (narrativeProps.pedestalsGroup.visible) {
        const pTime = (t - 119.21) / 3.61;
        const selectedX = pTime < 0.33 ? -2.0 : pTime < 0.66 ? 2.0 : 0.0;
        narrativeProps.selectorRing.position.x = THREE.MathUtils.damp(
          narrativeProps.selectorRing.position.x,
          selectedX,
          10,
          dt
        );
      }

      // Bridge Dotted Draft Filling with Amber Meaning (2:02.82 - 2:08.61)
      narrativeProps.dottedDraftGroup.visible = shot.id === 'shot_37_br_meaning_from_you';
      if (narrativeProps.dottedDraftGroup.visible) {
        const fillP = Math.min(1, (t - 122.82) / 4.2);
        narrativeProps.draftFillMat.opacity = fillP;
        narrativeProps.dottedDraftGroup.rotation.y = Math.sin(t * 1.5) * 0.25;
      }

      // Outro New Drifting Squiggle Idea (2:31.10 - 2:48.0)
      narrativeProps.outroSquiggleMesh.visible =
        shot.id === 'shot_44_outro_new_thought' || shot.id === 'shot_45_outro_by_noon';
      if (narrativeProps.outroSquiggleMesh.visible) {
        if (shot.id === 'shot_44_outro_new_thought') {
          const driftP = Math.min(1, (t - 151.1) / 4.0);
          narrativeProps.outroSquiggleMesh.position.set(
            4.5 - driftP * 3.8,
            2.4 - driftP * 0.6,
            0.2
          );
        } else {
          // Lands gently on the floor at 2:35.23
          const landP = Math.min(1, (t - 155.23) / 2.5);
          narrativeProps.outroSquiggleMesh.position.set(
            0.7 * (1 - landP),
            1.8 * (1 - landP) + 0.22,
            0.5
          );
        }
      }

      // =========================================================================
      // IMMERSIVE 3D MODEL LYRIC LETTERS (50 KINETIC ANIMATION STYLES — LOCKED PER SHOT)
      // =========================================================================
      const shotIdx = Math.max(
        0,
        SHOTS.findIndex((s) => s.id === shot.id)
      );
      const shotDuration = Math.max(0.15, shot.endTime - shot.startTime);
      const shotProgress = Math.max(0, Math.min(1, (t - shot.startTime) / shotDuration));

      // Lock auto style strictly per shot so styles never jump mid-sentence!
      const autoStyleId = (shotIdx % 50) + 1;
      const activeStyleId =
        lyricStyleOverrideRef.current === 'auto'
          ? autoStyleId
          : Math.max(1, Math.min(50, lyricStyleOverrideRef.current));
      const activeStyleMeta =
        KINETIC_STYLES_50[activeStyleId - 1] || KINETIC_STYLES_50[0];

      lyric3DPool.updateLyricText(shot.lyric, shot.accentHex);
      lyric3DPool.animateLetters(activeStyleId, shotProgress, t);

      // =========================================================================
      // POP-UP 3D CITY SCENERY (Buildings, Windows, Balconies, Plants, Trees, Benches, Billboards)
      // =========================================================================
      const isCityActive =
        shot.section === 'verse1' ||
        shot.section === 'prechorus1' ||
        shot.section === 'chorus1' ||
        shot.section === 'break1' ||
        shot.section === 'prechorus2' ||
        shot.section === 'chorus2' ||
        shot.section === 'break2' ||
        shot.section === 'finalchorus';

      cityScenery.group.visible = shot.section !== 'intro';
      if (cityScenery.group.visible) {
        cityScenery.updateBillboards(
          shot.lyric,
          shot.section,
          activeStyleMeta.label
        );

        cityScenery.buildings.forEach((bGroup, bIdx) => {
          const popScale = isCityActive
            ? Math.min(1, Math.max(0.05, (t - 2.5 - bIdx * 0.18) * 1.4))
            : 0.12;
          bGroup.scale.y = isJump
            ? popScale
            : THREE.MathUtils.damp(bGroup.scale.y, popScale, 6, dt);
          bGroup.position.y = (1 - bGroup.scale.y) * -2.2 + energy.bass * 0.08;
        });

        cityScenery.trees.forEach((tGroup, tIdx) => {
          const treeScale = isCityActive ? 1 + Math.sin(t * 4 + tIdx) * 0.04 : 0.01;
          tGroup.scale.setScalar(
            isJump
              ? treeScale
              : THREE.MathUtils.damp(tGroup.scale.x, treeScale, 7, dt)
          );
        });

        cityScenery.benches.forEach((benchGroup) => {
          const benchScale = isCityActive ? 1 : 0.01;
          benchGroup.scale.setScalar(
            isJump
              ? benchScale
              : THREE.MathUtils.damp(benchGroup.scale.x, benchScale, 7, dt)
          );
        });

        cityScenery.billboards.forEach((bbGroup, bbIdx) => {
          const bbScale = isCityActive ? 1 : 0.01;
          bbGroup.scale.setScalar(
            isJump
              ? bbScale
              : THREE.MathUtils.damp(bbGroup.scale.x, bbScale, 6, dt)
          );
          bbGroup.position.y = 4.65 + Math.sin(t * 2.4 + bbIdx * Math.PI) * 0.08;
        });
      }

      // =========================================================================
      // BEAT ("ME" — SUNO AI) 3D AUDIO CREATION, EDITING & MIXING WORKSTATION
      // =========================================================================
      const showAudioWorkstation =
        beat.root.visible &&
        !isSplitting &&
        shot.section !== 'intro' &&
        shot.section !== 'outro';
      beatAudioStudio.workstationGroup.visible = showAudioWorkstation;
      beatAudioStudio.headphonesGroup.visible = beat.root.visible && !isSplitting;

      if (showAudioWorkstation) {
        // Low-profile hovering producer desk in front of Beat (never blocks Hollow Chest Ring)
        beatAudioStudio.workstationGroup.position.set(
          0,
          0.34 + Math.sin(t * 3.5) * 0.03,
          0.86
        );

        // Motorized faders slide dynamically to the rhythm & lyrics
        beatAudioStudio.faderCaps.forEach((cap, fIdx) => {
          cap.position.z = Math.sin(t * 6.5 + fIdx * 1.1) * 0.14;
        });

        // Dual DJ/DAW Jog-Wheels spin while Beat scrubs & edits audio
        beatAudioStudio.jogWheelL.rotation.y = t * 5.0;
        beatAudioStudio.jogWheelR.rotation.y = -t * 6.5;

        // 12 Floating Holographic 3D Audio Waveform Clip Blocks:
        const isSlicingOrSorting =
          shot.id === 'shot_08_c1_spark_sound' ||
          shot.id === 'shot_19_v2_custom_style' ||
          shot.id === 'shot_20_v2_tower_bridge' ||
          shot.id === 'shot_32_b2_trade_pieces';

        beatAudioStudio.waveformBlocks.forEach((wBlock, wIdx) => {
          const baseX = (wIdx - 5.5) * 0.125;
          const sliceSpread = isSlicingOrSorting
            ? Math.sin(t * 7 + wIdx * 0.8) * 0.12
            : 0;
          const waveH =
            0.5 +
            Math.abs(Math.sin(t * 9 + wIdx * 0.65)) * 1.15 +
            energy.bass * 0.65;
          wBlock.position.set(
            baseX + sliceSpread * 0.2,
            0.24 + sliceSpread * 0.22,
            -0.04 + Math.cos(t * 5 + wIdx) * 0.04
          );
          wBlock.scale.set(1, waveH, 1);
          wBlock.rotation.z = isSlicingOrSorting
            ? Math.sin(t * 6 + wIdx) * 0.18
            : 0;
        });

        // Elastic 3D Pitch-Bend Synth Wave Ribbon ("a note you want to bend")
        const bendFactor =
          shot.id === 'shot_19_v2_custom_style'
            ? 1.45 + Math.sin(t * 10) * 0.45
            : 1.0 + Math.sin(t * 4) * 0.15;
        beatAudioStudio.pitchBendWave.scale.set(1, bendFactor, 1);
        beatAudioStudio.pitchBendWave.rotation.x = Math.sin(t * 5) * 0.25;

        // Animate Beat's Left & Right Hands hovering cleanly above the console (zero clipping!)
        beat.leftHand.position.set(
          -0.56 + Math.sin(t * 8.0) * 0.22,
          0.56 + Math.abs(Math.cos(t * 8.0)) * 0.14,
          0.74 + Math.cos(t * 6.0) * 0.1
        );
        beat.rightHand.position.set(
          0.56 + Math.cos(t * 8.5) * 0.22,
          0.56 + Math.abs(Math.sin(t * 8.5)) * 0.16,
          0.74 + Math.sin(t * 6.5) * 0.1
        );
        beat.leftHand.rotation.set(Math.sin(t * 9) * 0.3, 0, Math.cos(t * 7) * 0.22);
        beat.rightHand.rotation.set(Math.cos(t * 9) * 0.3, 0, -Math.sin(t * 7) * 0.22);
      } else {
        beat.leftHand.position.set(-0.92, 0.78, 0.15);
        beat.rightHand.position.set(0.92, 0.78, 0.15);
        beat.leftHand.rotation.set(0, 0, 0);
        beat.rightHand.rotation.set(0, 0, 0);
      }

      // =========================================================================
      // CINEMATIC CAMERA CHOREOGRAPHY (Spline Drift, Chorus Punch-Ins & Dutch Roll)
      // =========================================================================
      const mode = cameraModeRef.current;
      controls.enabled = mode === 'orbit';

      if (mode === 'orbit') {
        controls.update();
      } else {
        if (mode === 'director') {
          const orbitDriftX = Math.sin(t * 0.65) * 0.32;
          const orbitDriftY = Math.cos(t * 0.55) * 0.12;
          const chorusPunchZ = isChorusOrBreak ? -metrics.snapProgress * 0.28 : 0;

          _targetCamPos.set(
            shot.cameraPos[0] + orbitDriftX,
            Math.max(0.88, shot.cameraPos[1] + orbitDriftY),
            shot.cameraPos[2] + chorusPunchZ
          );
          _targetLookAt.set(
            shot.cameraTarget[0] + orbitDriftX * 0.25,
            shot.cameraTarget[1],
            shot.cameraTarget[2]
          );

          if (Math.abs(camera.fov - shot.fov) > 0.5) {
            camera.fov = shot.fov;
            camera.updateProjectionMatrix();
          }
        } else if (mode === 'wide') {
          _targetCamPos.set(Math.sin(t * 0.4) * 0.4, 4.6, 12.8);
          _targetLookAt.set(0, 1.4, -0.8);
        } else if (mode === 'isometric') {
          _targetCamPos.set(8.5, 7.8, 9.5);
          _targetLookAt.set(0, 1.0, -0.5);
        } else if (mode === 'closeup') {
          _targetCamPos.set(Math.sin(t * 0.5) * 0.25, 2.0, 5.2);
          _targetLookAt.set(0, 1.25, 0.2);
        }

        const isHardCutSection =
          isJump ||
          lastShotId === '' ||
          (mode === 'director' &&
            shot.id !== lastShotId &&
            (shot.section === 'chorus1' ||
              shot.section === 'chorus2' ||
              shot.section === 'finalchorus'));

        if (isHardCutSection) {
          camera.position.copy(_targetCamPos);
          _currentLookAt.copy(_targetLookAt);
        } else {
          const dampAlpha = 1 - Math.exp(-6.2 * dt);
          camera.position.lerp(_targetCamPos, dampAlpha);
          _currentLookAt.lerp(_targetLookAt, dampAlpha);
        }

        // Subtle motivated Dutch-angle roll during guitar zig-zag stabs or vinyl wipes
        const dutchRoll =
          shot.specialOverlay === 'zigzag_guitar'
            ? Math.sin(t * 8) * 0.045
            : shot.specialOverlay === 'vinyl_wipe'
              ? Math.sin(t * 4) * 0.06
              : 0;
        camera.up.set(Math.sin(dutchRoll), Math.cos(dutchRoll), 0);
        camera.lookAt(_currentLookAt);
      }

      lastShotId = shot.id;
    }

    // Software-WebGL fenceSync frame pacing per Three.js skill
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (gl.flush) gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0.001, (now - lastClockTime) / 1000));
      lastClockTime = now;

      evaluateSceneAtTime(currentTimeRef.current, dt);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    const winAny = window as unknown as {
      __OMNIFRAME_RENDER_AT_FRAME__?: (frameIndex: number) => HTMLCanvasElement;
    };
    winAny.__OMNIFRAME_RENDER_AT_FRAME__ = (frameIndex: number) => {
      const exactTimeSec = Math.max(0, frameIndex) / 60;
      currentTimeRef.current = exactTimeSec;
      evaluateSceneAtTime(exactTimeSec, 1 / 60);
      renderer.render(scene, camera);
      return renderer.domElement;
    };

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      delete winAny.__OMNIFRAME_RENDER_AT_FRAME__;
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
    };
  }, [currentTimeRef, audioEnergyRef]);

  return (
    <div
      ref={mountRef}
      data-testid="omniframe-stage-canvas"
      style={animeFilterStyle}
      className="absolute inset-0 w-full h-full overflow-hidden"
    />
  );
}
