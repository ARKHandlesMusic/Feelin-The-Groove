export interface LetterTransform3D {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  sx: number;
  sy: number;
  sz: number;
  opacity: number;
}

export interface KineticStyleDef {
  id: number;
  code: string;
  label: string;
  category: 'fall' | 'shoot' | 'roll' | 'pop' | 'fade' | 'wave' | 'orbit' | 'flip' | ' architectural';
}

/**
 * All 50 distinct 3D lyric kinetic animation styles for placing and animating
 * 3D model letters directly inside the Three.js scene.
 */
export const KINETIC_STYLES_50: KineticStyleDef[] = [
  {id: 1, code: 'falling_gravity_bounce', label: '01 · Gravity Drop & Elastic Bounce', category: 'fall'},
  {id: 2, code: 'falling_feather_drift', label: '02 · Feather Cascade Fall', category: 'fall'},
  {id: 3, code: 'falling_anvil_slam', label: '03 · Heavy Anvil Stage Slam', category: 'fall'},
  {id: 4, code: 'falling_domino_cascade', label: '04 · Falling Domino Topple', category: 'fall'},
  {id: 5, code: 'falling_rain_streaks', label: '05 · Neon Rain Matrix Drop', category: 'fall'},
  {id: 6, code: 'falling_stair_step', label: '06 · Stair-Step Descending Blocks', category: 'fall'},
  {id: 7, code: 'falling_meteor_angle', label: '07 · Diagonal Meteor Shower In', category: 'fall'},
  {id: 8, code: 'shooting_left_cannon', label: '08 · Left Cannon High-Velocity Shoot', category: 'shoot'},
  {id: 9, code: 'shooting_right_laser', label: '09 · Right Laser Zip-In & Out', category: 'shoot'},
  {id: 10, code: 'shooting_depth_z_punch', label: '10 · Deep Horizon Z-Punch Forward', category: 'shoot'},
  {id: 11, code: 'shooting_camera_flyby', label: '11 · From Behind Camera Fly-In', category: 'shoot'},
  {id: 12, code: 'shooting_crossfire_zipper', label: '12 · Alternating Left/Right Crossfire', category: 'shoot'},
  {id: 13, code: 'shooting_floor_geyser', label: '13 · Stage Floor Upward Geyser Shoot', category: 'shoot'},
  {id: 14, code: 'shooting_slingshot_snap', label: '14 · Elastic Slingshot Overshoot', category: 'shoot'},
  {id: 15, code: 'rolling_wheel_left', label: '15 · Rolling Wheel Cartwheel In', category: 'roll'},
  {id: 16, code: 'rolling_barrel_x', label: '16 · Forward Barrel Roll 720°', category: 'roll'},
  {id: 17, code: 'rolling_coin_spin', label: '17 · Spinning Coin Y-Axis Roll', category: 'roll'},
  {id: 18, code: 'rolling_vinyl_platter', label: '18 · Vinyl Turntable Curve Roll', category: 'roll'},
  {id: 19, code: 'rolling_bowling_strike', label: '19 · Bowling Lane Roll & Scatter Out', category: 'roll'},
  {id: 20, code: 'rolling_helix_screw', label: '20 · Corkscrew Helix Roll In/Out', category: 'roll'},
  {id: 21, code: 'pop_elastic_bubble', label: '21 · Elastic Bubble Pop In & Out', category: 'pop'},
  {id: 22, code: 'pop_jack_in_box', label: '22 · Jack-in-the-Box Floor Pop', category: 'pop'},
  {id: 23, code: 'pop_firework_burst', label: '23 · Center Firework Radial Pop', category: 'pop'},
  {id: 24, code: 'pop_syncopated_offbeat', label: '24 · Syncopated Off-Beat Snap Pop', category: 'pop'},
  {id: 25, code: 'pop_heartbeat_thump', label: '25 · Double Heartbeat Pulse Pop', category: 'pop'},
  {id: 26, code: 'pop_accordion_stretch', label: '26 · Accordion Width Expand Pop', category: 'pop'},
  {id: 27, code: 'pop_popcorn_random', label: '27 · Popcorn Stage Scatter Pop', category: 'pop'},
  {id: 28, code: 'fade_mist_materialize', label: '28 · Soft Mist Materialize Fade', category: 'fade'},
  {id: 29, code: 'fade_ghost_rise', label: '29 · Ascending Lantern Fade In/Out', category: 'fade'},
  {id: 30, code: 'fade_depth_blur_zoom', label: '30 · Depth-of-Field Zoom Fade', category: 'fade'},
  {id: 31, code: 'fade_cinematic_dissolve', label: '31 · Slow Bridge Paper Dissolve', category: 'fade'},
  {id: 32, code: 'fade_neon_flicker', label: '32 · City Billboard Neon Flicker On', category: 'fade'},
  {id: 33, code: 'wave_sine_ribbon', label: '33 · Crooked Squiggle Sine Wave', category: 'wave'},
  {id: 34, code: 'wave_equalizer_columns', label: '34 · Equalizer Bar Vertical Wave', category: 'wave'},
  {id: 35, code: 'wave_rubber_bend', label: '35 · Pitch-Wheel Rubber Note Bend', category: 'wave'},
  {id: 36, code: 'wave_ocean_crest', label: '36 · Sweeping Chorus Crest Wave', category: 'wave'},
  {id: 37, code: 'wave_pendulum_swing', label: '37 · Metronome Pendulum Swing', category: 'wave'},
  {id: 38, code: 'orbit_crown_halo', label: '38 · Deadline Ring Halo Orbit', category: 'orbit'},
  {id: 39, code: 'orbit_figure_eight', label: '39 · Melody Orb Figure-Eight Path', category: 'orbit'},
  {id: 40, code: 'orbit_tornado_vortex', label: '40 · Spiral Vortex Funnel In', category: 'orbit'},
  {id: 41, code: 'orbit_carousel_wheel', label: '41 · Ferris Wheel Vertical Orbit', category: 'orbit'},
  {id: 42, code: 'orbit_planetary_rings', label: '42 · Dual Character Orbit Arc', category: 'orbit'},
  {id: 43, code: 'flip_split_flap_board', label: '43 · Split-Flap Departure Board Flip', category: 'flip'},
  {id: 44, code: 'flip_origami_unfold', label: '44 · Origami Draft Card Unfold', category: 'flip'},
  {id: 45, code: 'flip_mirror_duet', label: '45 · Mirror Dance 180° Role Flip', category: 'flip'},
  {id: 46, code: 'flip_book_page', label: '46 · Manuscript Page Turn Flip', category: 'flip'},
  {id: 47, code: 'arch_billboard_mount', label: '47 · City Billboard Architectural Lock', category: ' architectural'},
  {id: 48, code: 'arch_bridge_span', label: '48 · Horizon Suspension Bridge Arch', category: ' architectural'},
  {id: 49, code: 'arch_tower_stack', label: '49 · Vertical Skyscraper Word Stack', category: ' architectural'},
  {id: 50, code: 'arch_noon_sun_corona', label: '50 · Rising Noon Sun Corona Arc', category: ' architectural'},
];

/**
 * Deterministic elastic helper for snappy 3D typography.
 */
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const clamped = Math.max(0, Math.min(1, x));
  return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
}

function easeOutBounce(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  let t = Math.max(0, Math.min(1, x));
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Computes the exact 3D transform (x, y, z, rx, ry, rz, sx, sy, sz, opacity)
 * for a 3D letter block at `charIndex` out of `totalChars` given:
 * - `styleId` (1..50)
 * - `shotProgress` (0..1 across the shot duration)
 * - `timeSec` (global song time for continuous secondary groove motion)
 * - `splitIndex` (optional split index for 2-line balanced wrapping on longer lyrics)
 */
export function computeLyricLetterTransform(
  styleId: number,
  charIndex: number,
  totalChars: number,
  shotProgress: number,
  timeSec: number,
  splitIndex?: number
): LetterTransform3D {
  const normalizedIdx = ((styleId - 1 + 500) % 50) + 1;
  const count = Math.max(1, totalChars);

  // Automatic 2-row balanced proscenium layout for lines > 24 chars so letters NEVER overlap
  const useTwoRows = count > 24;
  const rowBreak =
    useTwoRows && splitIndex && splitIndex > 0 && splitIndex < count
      ? splitIndex
      : Math.ceil(count / 2);

  const isSecondRow = useTwoRows && charIndex >= rowBreak;
  const rowCharIdx = isSecondRow ? charIndex - rowBreak : charIndex;
  const rowCount = useTwoRows
    ? isSecondRow
      ? count - rowBreak
      : rowBreak
    : count;

  const spacing = rowCount > 22 ? 0.33 : 0.38;
  const centerOffset = rowCharIdx - (rowCount - 1) / 2;
  const baseX = centerOffset * spacing;
  const baseY = useTwoRows ? (isSecondRow ? 2.92 : 3.45) : 3.22;
  const baseZ = -1.75;

  // Crisp, disciplined entrance (0..0.18) and exit (0.88..1.0) so lyrics hold rock-steady for 70% of every shot
  const charDelay = (charIndex / count) * 0.07;
  const enterT = Math.max(0, Math.min(1, (shotProgress - charDelay) / 0.13));
  const exitT = Math.max(0, Math.min(1, (shotProgress - 0.88 - charDelay * 0.25) / 0.11));
  const activeEnvelope = enterT * (1 - exitT);

  let x = baseX;
  let y = baseY;
  let z = baseZ;
  let rx = 0;
  let ry = 0;
  let rz = 0;
  let sx = 0.94;
  let sy = 0.94;
  let sz = 0.94;
  let opacity = Math.max(0.01, Math.min(1, activeEnvelope));

  // Subtle musical breathing during the hold phase (never chaotic "kawabunga" scatter)
  const grooveWave = Math.sin(timeSec * 5.5 + charIndex * 0.35);
  const grooveCos = Math.cos(timeSec * 4.8 + charIndex * 0.3);

  switch (normalizedIdx) {
    // 1-7: FALLING STYLES
    case 1: {
      // Gravity Drop & Elastic Bounce
      const bounce = easeOutBounce(enterT);
      y = baseY + (1 - bounce) * 2.8 - exitT * 1.8 + grooveWave * 0.035;
      rx = (1 - bounce) * 0.55;
      break;
    }
    case 2: {
      // Feather Cascade Fall
      y = baseY + (1 - enterT) * 2.4 - exitT * 1.4 + grooveWave * 0.045;
      x = baseX + Math.sin((1 - enterT) * 4 + charIndex) * (1 - enterT) * 0.35;
      rz = Math.sin(timeSec * 3.5 + charIndex * 0.4) * 0.05;
      break;
    }
    case 3: {
      // Heavy Anvil Stage Slam
      const slam = Math.pow(enterT, 2.5);
      y = baseY + (1 - slam) * 3.2 - exitT * 1.8;
      sy = enterT > 0.82 && enterT < 0.96 ? 0.78 : 0.94;
      sx = sy < 0.9 ? 1.12 : 0.94;
      break;
    }
    case 4: {
      // Falling Domino Topple
      y = baseY + (1 - enterT) * 2.0 + grooveWave * 0.03;
      rz = (1 - enterT) * -0.75 + exitT * 0.75;
      break;
    }
    case 5: {
      // Neon Rain Matrix Drop
      y = baseY + (1 - enterT) * 2.8 - exitT * 2.4 + grooveWave * 0.03;
      sy = 0.94 + (1 - enterT) * 0.75;
      break;
    }
    case 6: {
      // Stair-Step Descending Blocks
      const stepOffset = (1 - enterT) * ((rowCharIdx % 4) * 0.25);
      y = baseY + stepOffset + (1 - enterT) * 2.2 - exitT * 1.6 + grooveWave * 0.03;
      break;
    }
    case 7: {
      // Diagonal Meteor Shower In
      x = baseX - (1 - enterT) * 3.2 + exitT * 3.2;
      y = baseY + (1 - enterT) * 2.6 - exitT * 2.0 + grooveWave * 0.03;
      rz = (1 - enterT) * 0.45;
      break;
    }

    // 8-14: SHOOTING STYLES (IN AND OUT)
    case 8: {
      // Left Cannon High-Velocity Shoot
      const shoot = easeOutBack(enterT);
      x = baseX - (1 - shoot) * 5.2 + exitT * 5.2;
      rz = (1 - shoot) * -0.28;
      y = baseY + grooveWave * 0.03;
      break;
    }
    case 9: {
      // Right Laser Zip-In & Out
      const shoot = easeOutBack(enterT);
      x = baseX + (1 - shoot) * 5.2 - exitT * 5.2;
      sx = 0.94 + (1 - enterT) * 0.95;
      y = baseY + grooveWave * 0.03;
      break;
    }
    case 10: {
      // Deep Horizon Z-Punch Forward
      const shoot = easeOutBack(enterT);
      z = baseZ - (1 - shoot) * 7.5 + exitT * 4.5;
      y = baseY + grooveWave * 0.04;
      break;
    }
    case 11: {
      // From Behind Camera Fly-In
      z = baseZ + (1 - enterT) * 5.5 - exitT * 5.0;
      rx = (1 - enterT) * 0.85;
      y = baseY + grooveWave * 0.035;
      break;
    }
    case 12: {
      // Alternating Left/Right Crossfire
      const dir = charIndex % 2 === 0 ? -1 : 1;
      x = baseX + dir * (1 - easeOutBack(enterT)) * 4.2 + dir * exitT * 3.8;
      y = baseY + dir * (1 - enterT) * 0.65 + grooveWave * 0.03;
      break;
    }
    case 13: {
      // Stage Floor Upward Geyser Shoot
      const shoot = easeOutBack(enterT);
      y = 0.8 + shoot * (baseY - 0.8) + exitT * 2.2 + grooveWave * 0.03;
      ry = (1 - enterT) * Math.PI;
      break;
    }
    case 14: {
      // Elastic Slingshot Overshoot
      const sling = easeOutBack(enterT);
      z = baseZ - (1 - sling) * 5.5;
      y = baseY + Math.sin((1 - enterT) * Math.PI) * 0.65 + grooveWave * 0.035;
      break;
    }

    // 15-20: ROLLING IN AND OUT STYLES
    case 15: {
      // Rolling Wheel Cartwheel In
      x = baseX - (1 - enterT) * 4.2 + exitT * 4.2;
      rz = -(1 - enterT) * Math.PI * 2 + exitT * Math.PI * 2;
      y = baseY + Math.abs(Math.sin((1 - enterT) * Math.PI * 2)) * 0.25 + grooveWave * 0.03;
      break;
    }
    case 16: {
      // Forward Barrel Roll 720
      z = baseZ - (1 - enterT) * 3.8 + exitT * 3.2;
      rx = (1 - enterT) * Math.PI * 2 + exitT * Math.PI * 2;
      y = baseY + grooveWave * 0.035;
      break;
    }
    case 17: {
      // Spinning Coin Y-Axis Roll
      ry = (1 - enterT) * Math.PI * 2 + exitT * Math.PI + Math.sin(timeSec * 2.5 + charIndex * 0.2) * 0.12;
      y = baseY + grooveWave * 0.04;
      break;
    }
    case 18: {
      // Vinyl Turntable Curve Roll
      const angle = (1 - enterT) * Math.PI * 0.85 - exitT * Math.PI * 0.65;
      x = baseX * Math.cos(angle) - Math.sin(angle) * 1.4;
      z = baseZ + Math.sin(angle) * 1.4;
      ry = -angle * 0.6;
      y = baseY + grooveWave * 0.035;
      break;
    }
    case 19: {
      // Bowling Lane Roll & Scatter Out
      z = baseZ - (1 - enterT) * 5.5;
      rx = (1 - enterT) * Math.PI * 2;
      y = baseY + grooveWave * 0.035;
      if (exitT > 0) {
        x += (charIndex % 2 === 0 ? -1 : 1) * exitT * 2.5;
        y += exitT * 1.6;
        rz = exitT * 2.2;
      }
      break;
    }
    case 20: {
      // Corkscrew Helix Roll In/Out
      const hAngle = (1 - enterT) * Math.PI * 2 + charIndex * 0.25;
      x = baseX + Math.cos(hAngle) * (1 - enterT) * 1.2;
      y = baseY + Math.sin(hAngle) * (1 - enterT) * 1.2 + grooveWave * 0.035;
      rz = (1 - enterT) * Math.PI;
      break;
    }

    // 21-27: POP IN AND OUT STYLES
    case 21: {
      // Elastic Bubble Pop In & Out
      const popScale = easeOutBack(enterT) * (1 - exitT) * 0.94;
      sx = Math.max(0.01, popScale);
      sy = Math.max(0.01, popScale);
      sz = Math.max(0.01, popScale);
      y = baseY + grooveWave * 0.04;
      break;
    }
    case 22: {
      // Jack-in-the-Box Floor Pop
      const pop = easeOutBack(enterT);
      y = 1.2 + pop * (baseY - 1.2) + grooveWave * 0.035;
      sx = Math.max(0.01, pop * (1 - exitT) * 0.94);
      sy = Math.max(0.01, pop * (1 + (1 - enterT) * 0.3) * (1 - exitT) * 0.94);
      break;
    }
    case 23: {
      // Center Firework Radial Pop
      const burst = easeOutBack(enterT);
      x = baseX * burst;
      const arch = Math.cos((centerOffset / Math.max(1, rowCount)) * Math.PI) * 0.16;
      y = baseY + arch * burst + grooveWave * 0.035;
      sx = Math.max(0.01, burst * (1 - exitT) * 0.94);
      sy = sx;
      break;
    }
    case 24: {
      // Syncopated Off-Beat Snap Pop
      const stepSnap = 0.92 + Math.abs(Math.sin(timeSec * Math.PI * 2.03)) * 0.08;
      sx = Math.max(0.01, enterT * (1 - exitT) * stepSnap);
      sy = sx;
      rz = (charIndex % 2 === 0 ? 0.035 : -0.035);
      y = baseY + grooveWave * 0.03;
      break;
    }
    case 25: {
      // Double Heartbeat Pulse Pop
      const pulse = 0.92 + Math.pow(Math.sin(timeSec * Math.PI * 4.07), 4) * 0.14;
      sx = Math.max(0.01, enterT * (1 - exitT) * pulse);
      sy = sx;
      y = baseY + grooveWave * 0.03;
      break;
    }
    case 26: {
      // Accordion Width Expand Pop
      const exp = easeOutBack(enterT) * (1 - exitT);
      x = baseX * exp;
      sx = Math.max(0.01, exp * 0.94);
      y = baseY + grooveWave * 0.035;
      break;
    }
    case 27: {
      // Popcorn Stage Scatter Pop
      const pJump = Math.sin((1 - enterT) * Math.PI);
      y = baseY + pJump * 0.95 + grooveWave * 0.035;
      ry = (1 - enterT) * 1.4;
      sx = Math.max(0.01, enterT * (1 - exitT) * 0.94);
      sy = sx;
      break;
    }

    // 28-32: FADE IN AND OUT STYLES
    case 28: {
      // Soft Mist Materialize Fade
      opacity = Math.max(0.01, Math.sin(shotProgress * Math.PI));
      y = baseY + grooveWave * 0.04;
      break;
    }
    case 29: {
      // Ascending Lantern Fade In/Out
      y = baseY - (1 - enterT) * 0.65 + exitT * 0.65 + grooveWave * 0.035;
      opacity = Math.max(0.01, enterT * (1 - exitT));
      break;
    }
    case 30: {
      // Depth-of-Field Zoom Fade
      z = baseZ - (1 - enterT) * 2.2 + exitT * 1.8;
      sx = (0.82 + enterT * 0.12) * (1 - exitT * 0.5);
      sy = sx;
      y = baseY + grooveWave * 0.035;
      break;
    }
    case 31: {
      // Slow Bridge Paper Dissolve
      y = baseY + Math.sin(charIndex * 0.45 + timeSec * 2.2) * 0.06;
      ry = Math.cos(charIndex * 0.35 + timeSec * 1.8) * 0.08;
      break;
    }
    case 32: {
      // City Billboard Neon Flicker On
      const flicker = enterT < 0.5 ? ((Math.floor(timeSec * 24 + charIndex) % 2) * 0.7 + 0.3) : 1;
      opacity = Math.max(0.05, flicker * (1 - exitT));
      y = baseY + grooveWave * 0.03;
      break;
    }

    // 33-37: WAVE & GROOVE STYLES
    case 33: {
      // Crooked Squiggle Sine Wave
      y = baseY + Math.sin(charIndex * 0.45 + timeSec * 4.5) * 0.11;
      rz = Math.cos(charIndex * 0.45 + timeSec * 4.5) * 0.06;
      break;
    }
    case 34: {
      // Equalizer Bar Vertical Wave
      const eq = Math.abs(Math.sin(charIndex * 0.6 + timeSec * 5.5));
      y = baseY - 0.06 + eq * 0.14;
      sy = 0.88 + eq * 0.16;
      break;
    }
    case 35: {
      // Pitch-Wheel Rubber Note Bend
      const bend = Math.sin(timeSec * 3.8) * 0.16;
      y = baseY + Math.exp(-Math.pow(centerOffset * 0.22, 2)) * bend;
      sx = 0.92 + Math.abs(bend) * 0.12;
      break;
    }
    case 36: {
      // Sweeping Chorus Crest Wave
      y = baseY + Math.sin(charIndex * 0.3 - timeSec * 4.2) * 0.12;
      z = baseZ + Math.cos(charIndex * 0.3 - timeSec * 4.2) * 0.14;
      break;
    }
    case 37: {
      // Metronome Pendulum Swing
      const swing = Math.sin(timeSec * 4.2) * 0.12;
      x = baseX + Math.sin(swing) * 0.18;
      rz = swing * 0.15;
      y = baseY + grooveWave * 0.03;
      break;
    }

    // 38-42: ORBIT & SPATIAL CURVE STYLES
    case 38: {
      // Deadline Ring Halo Orbit
      const haloAngle = (centerOffset / Math.max(1, rowCount)) * 0.65;
      x = baseX;
      z = baseZ - Math.cos(haloAngle) * 0.45 + 0.35;
      y = baseY + Math.cos(haloAngle) * 0.18 + grooveWave * 0.035;
      ry = -haloAngle * 0.35;
      break;
    }
    case 39: {
      // Melody Orb Figure-Eight Path
      const fWave = Math.sin(charIndex * 0.35 + timeSec * 3.2);
      x = baseX;
      y = baseY + fWave * 0.11;
      z = baseZ + Math.cos(charIndex * 0.35 + timeSec * 3.2) * 0.15;
      break;
    }
    case 40: {
      // Spiral Vortex Funnel In
      const swirl = (1 - enterT) * Math.PI * 2;
      const radius = (1 - enterT) * 1.8;
      x = baseX + Math.cos(swirl + charIndex) * radius;
      z = baseZ + Math.sin(swirl + charIndex) * radius;
      y = baseY + (1 - enterT) * 1.6 + grooveWave * 0.035;
      break;
    }
    case 41: {
      // Ferris Wheel Vertical Orbit
      const wAngle = (1 - enterT) * Math.PI;
      y = baseY + Math.sin(wAngle) * 0.85 + grooveWave * 0.035;
      z = baseZ + (1 - Math.cos(wAngle)) * 0.65;
      break;
    }
    case 42: {
      // Dual Character Orbit Arc
      const arc = (centerOffset / Math.max(1, rowCount)) * 0.75;
      x = baseX;
      y = baseY + Math.cos(arc) * 0.24 - 0.12 + grooveWave * 0.03;
      z = baseZ - Math.cos(arc) * 0.35 + 0.2;
      break;
    }

    // 43-46: FLIP & UNFOLD STYLES
    case 43: {
      // Split-Flap Departure Board Flip
      rx = (1 - enterT) * Math.PI * 2 - exitT * Math.PI;
      y = baseY + grooveCos * 0.03;
      break;
    }
    case 44: {
      // Origami Draft Card Unfold
      ry = (1 - enterT) * (charIndex % 2 === 0 ? Math.PI : -Math.PI);
      sx = Math.max(0.05, enterT * (1 - exitT) * 0.94);
      y = baseY + grooveWave * 0.03;
      break;
    }
    case 45: {
      // Mirror Dance 180 Role Flip
      ry = (1 - enterT) * Math.PI + Math.sin(timeSec * 3 + charIndex * 0.2) * 0.08;
      y = baseY + grooveWave * 0.04;
      break;
    }
    case 46: {
      // Manuscript Page Turn Flip
      const turn = (1 - enterT) * 1.1;
      x = baseX * Math.cos(turn);
      z = baseZ + Math.sin(turn) * 1.2;
      ry = -turn;
      y = baseY + grooveWave * 0.03;
      break;
    }

    // 47-50: ARCHITECTURAL & WORLD-INTEGRATED STYLES
    case 47: {
      // City Billboard Architectural Lock
      y = baseY + 0.18 + (1 - easeOutBack(enterT)) * 1.4;
      z = -2.45;
      break;
    }
    case 48: {
      // Horizon Suspension Bridge Arch
      const archFactor = 1 - Math.pow(centerOffset / Math.max(1, rowCount / 2), 2);
      y = baseY - 0.08 + archFactor * 0.26 + grooveWave * 0.025;
      z = baseZ - archFactor * 0.35;
      break;
    }
    case 49: {
      // Vertical Skyscraper Word Stack
      y = baseY + (1 - enterT) * 2.2 + grooveWave * 0.035;
      z = baseZ - 0.2;
      break;
    }
    case 50:
    default: {
      // Rising Noon Sun Corona Arc
      const sunArc = (centerOffset / Math.max(1, rowCount)) * 0.65;
      x = baseX;
      y = baseY + Math.cos(sunArc) * 0.28 - 0.14 + grooveWave * 0.03;
      rz = -sunArc * 0.18;
      break;
    }
  }

  return {
    x,
    y,
    z,
    rx,
    ry,
    rz,
    sx: Math.max(0.01, sx * (1 - exitT * 0.85)),
    sy: Math.max(0.01, sy * (1 - exitT * 0.85)),
    sz: Math.max(0.01, sz * (1 - exitT * 0.85)),
    opacity,
  };
}
