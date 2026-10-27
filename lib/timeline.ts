export type SectionId =
  | 'intro'
  | 'verse1'
  | 'prechorus1'
  | 'chorus1'
  | 'break1'
  | 'verse2'
  | 'prechorus2'
  | 'chorus2'
  | 'break2'
  | 'bridge'
  | 'finalchorus'
  | 'outro';

export type CameraPresetMode =
  | 'director'
  | 'wide'
  | 'isometric'
  | 'closeup'
  | 'orbit';

export interface LyricLine {
  time: number;
  endTime: number;
  text: string;
  section: SectionId;
}

export interface ShotSpec {
  id: string;
  title: string;
  section: SectionId;
  startTime: number;
  endTime: number;
  lyric: string;
  narrativePurpose: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  fov: number;
  bgHex: string;
  floorBaseHex: string;
  accentHex: string;
  sparkAction: string;
  beatAction: string;
  hollowRingState: 'dim' | 'faint' | 'transferring' | 'lit_combo' | 'lantern' | 'glowing_amber' | 'double_pulse';
  deadlineState: 'hidden' | 'orbiting' | 'rising_sun' | 'noon_sun';
  specialOverlay:
    | 'none'
    | 'intro_title'
    | 'freeze_beat'
    | 'fourth_wall'
    | 'split_heart_flaw'
    | 'split_more_raw'
    | 'groove_tiles'
    | 'zigzag_guitar'
    | 'vinyl_wipe'
    | 'bell_questions'
    | 'color_wheel'
    | 'split_heart_flaw_v2'
    | 'split_more_raw_v2'
    | 'bell_ripples'
    | 'stage_spin_360'
    | 'cream_flash_collage'
    | 'loop_single_tile';
}

export const SONG_METADATA = {
  title: 'Find Its Groove',
  artist: 'Aarav Kharade',
  genre: 'Syncopated Dance-Pop',
  bpm: 122,
  duration: 171.5, // 2:51.5
  audioUrl: '/assets/aistudio/Find_Its_Groove_4279e765.mp3',
  lrcUrl: '/assets/aistudio/Aarav_Kharade_-_Find_Its_Groove_6d43b598.txt',
  palette: {
    indigo: '#1B1646',
    sparkAmber: '#FFB23E',
    beatTeal: '#2EC4B6',
    accentMagenta: '#E83F8C',
    highlightCream: '#FFF4E0',
    duskViolet: '#261C52',
    bridgeLavender: '#DCD2EE',
    coral: '#FF6B6B',
  },
} as const;

export const CHAPTERS: {id: SectionId; label: string; startTime: number; color: string}[] = [
  {id: 'intro', label: 'Intro', startTime: 0.0, color: '#2EC4B6'},
  {id: 'verse1', label: 'Verse 1', startTime: 2.75, color: '#FFB23E'},
  {id: 'prechorus1', label: 'Pre-Chorus 1', startTime: 16.19, color: '#E83F8C'},
  {id: 'chorus1', label: 'Chorus 1', startTime: 25.24, color: '#E83F8C'},
  {id: 'break1', label: 'Dance Break 1', startTime: 43.0, color: '#2EC4B6'},
  {id: 'verse2', label: 'Verse 2', startTime: 56.87, color: '#FFB23E'},
  {id: 'prechorus2', label: 'Pre-Chorus 2', startTime: 71.5, color: '#FF6B6B'},
  {id: 'chorus2', label: 'Chorus 2', startTime: 80.26, color: '#E83F8C'},
  {id: 'break2', label: 'Mirror Break 2', startTime: 98.0, color: '#2EC4B6'},
  {id: 'bridge', label: 'Bridge', startTime: 111.69, color: '#FFF4E0'},
  {id: 'finalchorus', label: 'Final Chorus', startTime: 128.61, color: '#FFB23E'},
  {id: 'outro', label: 'Outro', startTime: 151.1, color: '#FFF4E0'},
];

export const SHOTS: ShotSpec[] = [
  // INTRO (0:00 - 0:02.75)
  {
    id: 'shot_01_intro',
    title: 'Single Tile Ignition & Falling Title',
    section: 'intro',
    startTime: 0.0,
    endTime: 2.75,
    lyric: 'FIND ITS GROOVE',
    narrativePurpose: 'One tile lights teal with a thump. Camera tilts up to reveal the empty 16-column stage as falling tiles assemble the title.',
    cameraPos: [0, 3.2, 11.5],
    cameraTarget: [0, 0.8, 0],
    fov: 45,
    bgHex: '#0D0A24',
    floorBaseHex: '#1B1646',
    accentHex: '#2EC4B6',
    sparkAction: 'waiting_offstage_left',
    beatAction: 'hidden_below',
    hollowRingState: 'dim',
    deadlineState: 'hidden',
    specialOverlay: 'intro_title',
  },
  // VERSE 1 (0:02.75 - 0:16.19)
  {
    id: 'shot_02_v1_crooked_rhyme',
    title: 'Crooked Little Rhyme Squiggle',
    section: 'verse1',
    startTime: 2.75,
    endTime: 5.36,
    lyric: 'You bring a tune with a crooked little rhyme,',
    narrativePurpose: 'Spark bounces in from the left on an off-beat, dragging a crooked wobbly squiggle behind it like a leash.',
    cameraPos: [-2.2, 3.0, 9.2],
    cameraTarget: [-1.0, 1.2, 0],
    fov: 42,
    bgHex: '#1B1646',
    floorBaseHex: '#241E59',
    accentHex: '#FFB23E',
    sparkAction: 'bounce_enter_leash',
    beatAction: 'hidden_right',
    hollowRingState: 'dim',
    deadlineState: 'hidden',
    specialOverlay: 'none',
  },
  {
    id: 'shot_03_v1_pocket_deadline',
    title: 'Belly Pocket Wishes & Deadline Ring',
    section: 'verse1',
    startTime: 5.36,
    endTime: 9.04,
    lyric: 'A pocket full of wishes and a deadline for the time.',
    narrativePurpose: 'Spark belly pocket flips open spilling floating star dots; countdown ring with shrinking red wedge orbits Spark head.',
    cameraPos: [-1.2, 2.6, 7.6],
    cameraTarget: [-0.8, 1.4, 0],
    fov: 40,
    bgHex: '#1B1646',
    floorBaseHex: '#241E59',
    accentHex: '#FFB23E',
    sparkAction: 'open_pocket_wishes',
    beatAction: 'slide_peek_right',
    hollowRingState: 'dim',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_04_v1_sharper_shoes',
    title: 'Tender Notes to Sharp Sneakers',
    section: 'verse1',
    startTime: 9.04,
    endTime: 12.57,
    lyric: 'You tell me, “Make it tender,” then “Give it sharper shoes,”',
    narrativePurpose: 'Beat slides in. Notes go soft and pillowy, then snap into tiny pointed sneakers tapping in time.',
    cameraPos: [0.4, 2.7, 8.8],
    cameraTarget: [0, 1.1, 0.4],
    fov: 44,
    bgHex: '#1B1646',
    floorBaseHex: '#251F5E',
    accentHex: '#2EC4B6',
    sparkAction: 'gesture_notes',
    beatAction: 'slide_in_snap',
    hollowRingState: 'dim',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_05_v1_gather_pieces',
    title: 'Beat Splits into Sorting Tiles',
    section: 'verse1',
    startTime: 12.57,
    endTime: 16.19,
    lyric: 'I gather up the pieces and decide what they could do.',
    narrativePurpose: 'Beat splits into 9 modular tiles that scoop up notes and stars and arrange them on a tray sorted by color.',
    cameraPos: [1.5, 3.4, 8.2],
    cameraTarget: [0.3, 1.2, 0],
    fov: 42,
    bgHex: '#1B1646',
    floorBaseHex: '#262060',
    accentHex: '#2EC4B6',
    sparkAction: 'watch_over_shoulder',
    beatAction: 'split_tiles_sort_tray',
    hollowRingState: 'dim',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  // PRE-CHORUS 1 (0:16.19 - 0:25.24)
  {
    id: 'shot_06_pc1_colors_pace',
    title: 'Flood Colors & Metronome Tap',
    section: 'prechorus1',
    startTime: 16.19,
    endTime: 19.12,
    lyric: 'You name the colors, pick the pace,',
    narrativePurpose: 'Spark points and floor tiles flood magenta then amber; metronome arm appears at right and Spark taps it faster.',
    cameraPos: [0.0, 3.8, 10.2],
    cameraTarget: [0.5, 1.2, 0],
    fov: 46,
    bgHex: '#241854',
    floorBaseHex: '#E83F8C',
    accentHex: '#FFB23E',
    sparkAction: 'tap_metronome',
    beatAction: 'clipped_groove',
    hollowRingState: 'faint',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_07_pc1_open_space',
    title: 'Connect-the-Dots Path & Riser Freeze',
    section: 'prechorus1',
    startTime: 19.12,
    endTime: 25.24,
    lyric: 'I find a path through the open space.',
    narrativePurpose: 'Beat chest ring draws a dotted path across the stage; riser lights left-to-right and freezes at 0:24.9.',
    cameraPos: [0.0, 2.9, 7.2],
    cameraTarget: [0, 1.2, 0],
    fov: 40,
    bgHex: '#2B195C',
    floorBaseHex: '#33246E',
    accentHex: '#2EC4B6',
    sparkAction: 'follow_path_riser',
    beatAction: 'roll_dotted_path',
    hollowRingState: 'faint',
    deadlineState: 'orbiting',
    specialOverlay: 'freeze_beat',
  },
  // CHORUS 1 (0:25.24 - 0:43.0)
  {
    id: 'shot_08_c1_bring_spark',
    title: 'Spark Particle & Rainbow Equalizer',
    section: 'chorus1',
    startTime: 25.24,
    endTime: 27.11,
    lyric: 'You bring the spark, I shape the sound,',
    narrativePurpose: 'Stage lights slam on. Chorus Tiles pop up in 3 tiers. Spark flicks a particle into Beat ring; EQ bars shoot up.',
    cameraPos: [0, 3.0, 9.8],
    cameraTarget: [0, 1.5, -1.0],
    fov: 48,
    bgHex: '#3B1554',
    floorBaseHex: '#E83F8C',
    accentHex: '#FFB23E',
    sparkAction: 'flick_spark',
    beatAction: 'pulse_eq_shape',
    hollowRingState: 'faint',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_09_c1_pass_melody',
    title: 'Figure-Eight Melody Orb',
    section: 'chorus1',
    startTime: 27.11,
    endTime: 29.09,
    lyric: 'We pass the melody around.',
    narrativePurpose: 'Glowing note-orb passes Spark to Beat to a Chorus Tile and back in a figure-eight light trail.',
    cameraPos: [-1.8, 3.6, 8.8],
    cameraTarget: [0, 1.6, -0.5],
    fov: 45,
    bgHex: '#42165B',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFF4E0',
    sparkAction: 'pass_orb_left',
    beatAction: 'pass_orb_right',
    hollowRingState: 'faint',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_10_c1_make_it_new',
    title: 'Near-Miss Orb Morphs to Star',
    section: 'chorus1',
    startTime: 29.09,
    endTime: 30.74,
    lyric: 'You say, “That’s close—now make it new,”',
    narrativePurpose: 'Spark squishes off-circle orb, target ring registers near miss, shakes it, and it morphs into a star.',
    cameraPos: [-0.8, 2.2, 6.2],
    cameraTarget: [-0.4, 1.5, 0],
    fov: 38,
    bgHex: '#3B1554',
    floorBaseHex: '#FFB23E',
    accentHex: '#E83F8C',
    sparkAction: 'squish_shake_star',
    beatAction: 'snap_support',
    hollowRingState: 'faint',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_11_c1_with_you',
    title: 'Fourth-Wall Point & Edge Ripple',
    section: 'chorus1',
    startTime: 30.74,
    endTime: 32.75,
    lyric: 'A song is something we make with you.',
    narrativePurpose: 'Wide shot. Everyone turns and points directly at the camera as screen edges ripple outward.',
    cameraPos: [0, 2.8, 10.6],
    cameraTarget: [0, 1.4, 0],
    fov: 50,
    bgHex: '#4A1964',
    floorBaseHex: '#E83F8C',
    accentHex: '#FFF4E0',
    sparkAction: 'point_at_camera',
    beatAction: 'point_at_camera',
    hollowRingState: 'faint',
    deadlineState: 'orbiting',
    specialOverlay: 'fourth_wall',
  },
  {
    id: 'shot_12_c1_heartbeat_flaw',
    title: 'Split Screen: Heartbeat vs. Cracked Note',
    section: 'chorus1',
    startTime: 32.75,
    endTime: 34.55,
    lyric: 'Some hear a heartbeat, some hear a flaw,',
    narrativePurpose: 'Split screen: Left panel shows a thumping heart; Right panel shows a cracked note under a magnifying glass.',
    cameraPos: [0, 2.5, 8.5],
    cameraTarget: [0, 1.3, 0],
    fov: 42,
    bgHex: '#2F154D',
    floorBaseHex: '#2EC4B6',
    accentHex: '#E83F8C',
    sparkAction: 'pulse_heart_left',
    beatAction: 'inspect_flaw_right',
    hollowRingState: 'dim',
    deadlineState: 'orbiting',
    specialOverlay: 'split_heart_flaw',
  },
  {
    id: 'shot_13_c1_more_raw',
    title: 'Split Screen: Glitter Pile vs. Bare Wireframe',
    section: 'chorus1',
    startTime: 34.55,
    endTime: 36.34,
    lyric: 'Some want a little more, some want it raw.',
    narrativePurpose: 'Left panel piles glitter onto the note (more); Right panel strips the note down to a bare outline (raw).',
    cameraPos: [0, 2.5, 8.5],
    cameraTarget: [0, 1.3, 0],
    fov: 42,
    bgHex: '#351755',
    floorBaseHex: '#FFB23E',
    accentHex: '#FFF4E0',
    sparkAction: 'glitter_more',
    beatAction: 'strip_raw',
    hollowRingState: 'dim',
    deadlineState: 'orbiting',
    specialOverlay: 'split_more_raw',
  },
  {
    id: 'shot_14_c1_hollow_ring_1',
    title: 'Close-Up: Beat Empty Hollow Chest Ring (Motif #1)',
    section: 'chorus1',
    startTime: 36.34,
    endTime: 39.9,
    lyric: 'I don’t have a heart like yours to prove—',
    narrativePurpose: 'Music pulls back. Close-up of Beat looking down at the empty hollow ring in its chest, then Spark heart pulsing.',
    cameraPos: [0.9, 1.75, 4.3],
    cameraTarget: [0.6, 1.35, 0],
    fov: 32,
    bgHex: '#151136',
    floorBaseHex: '#1B1646',
    accentHex: '#2EC4B6',
    sparkAction: 'warm_heart_pulse',
    beatAction: 'look_down_hollow_ring',
    hollowRingState: 'dim',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_15_c1_find_its_groove',
    title: 'Heartbeat Ring Transfer & GROOVE Tile Flash',
    section: 'chorus1',
    startTime: 39.9,
    endTime: 43.0,
    lyric: 'But I can help your feeling find its groove.',
    narrativePurpose: 'Spark heartbeat travels as a glowing ring into Beat hollow chest ring, lighting it teal and amber; floor flashes GROOVE.',
    cameraPos: [0, 3.5, 9.6],
    cameraTarget: [0, 1.3, 0],
    fov: 46,
    bgHex: '#3D1658',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFB23E',
    sparkAction: 'send_heartbeat_ring',
    beatAction: 'receive_groove_burst',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'groove_tiles',
  },
  // DANCE BREAK 1 (0:43.0 - 0:56.87)
  {
    id: 'shot_16_db1_syncopated_drop',
    title: 'Dance Break 1: Off-Beat Clipped Groove & Sneaker Tap',
    section: 'break1',
    startTime: 43.0,
    endTime: 48.0,
    lyric: '[Dance Break — Bass Drop & Sharp-Shoed Notes Tap]',
    narrativePurpose: 'Beat performs clipped off-beat hold-snap-hold moves while Spark bounces; sharp-shoed notes tap-dance across the 16-column grid.',
    cameraPos: [-2.4, 2.8, 8.6],
    cameraTarget: [0, 1.1, 0],
    fov: 45,
    bgHex: '#22154C',
    floorBaseHex: '#2EC4B6',
    accentHex: '#E83F8C',
    sparkAction: 'dance_break_bounce',
    beatAction: 'dance_break_clipped',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_17_db1_guitar_zigzags',
    title: 'Guitar Zig-Zag Wipes & Keyboard Star Pings',
    section: 'break1',
    startTime: 48.0,
    endTime: 53.0,
    lyric: '[Guitar Stabs & Keyboard Star Pings]',
    narrativePurpose: 'Guitar stabs slice diagonal zig-zag wipes across the frame; keyboard accents pop as cream star pings.',
    cameraPos: [2.5, 3.2, 8.4],
    cameraTarget: [0, 1.2, 0],
    fov: 45,
    bgHex: '#2D1659',
    floorBaseHex: '#E83F8C',
    accentHex: '#FFF4E0',
    sparkAction: 'syncopated_spin',
    beatAction: 'tile_shuffle_step',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'zigzag_guitar',
  },
  {
    id: 'shot_18_db1_vinyl_flip',
    title: 'Spinning Vinyl Floor Flip & Record-Scratch Wipe',
    section: 'break1',
    startTime: 53.0,
    endTime: 56.87,
    lyric: '[Vinyl Floor Flip into Verse 2]',
    narrativePurpose: 'Floor tiles flip like a spinning vinyl record and a record-scratch wipe lands cleanly on Verse 2.',
    cameraPos: [0, 6.8, 7.5],
    cameraTarget: [0, 0.5, 0],
    fov: 48,
    bgHex: '#241B4B',
    floorBaseHex: '#FFB23E',
    accentHex: '#2EC4B6',
    sparkAction: 'vinyl_ride',
    beatAction: 'vinyl_spin_pose',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'vinyl_wipe',
  },
  // VERSE 2 (0:56.87 - 1:11.50)
  {
    id: 'shot_19_v2_custom_style',
    title: 'Workshop Wall: Custom Stripes & Rubber Note Bend',
    section: 'verse2',
    startTime: 56.87,
    endTime: 60.14,
    lyric: 'A custom style, a line to keep, a note you want to bend,',
    narrativePurpose: 'Wall of sliders slides in. Spark paints stripes on Beat, pins a ribbon bookmark to a note, and stretches a rubber note.',
    cameraPos: [-1.4, 2.6, 8.6],
    cameraTarget: [0, 1.5, -0.8],
    fov: 42,
    bgHex: '#261C52',
    floorBaseHex: '#1F3A52',
    accentHex: '#FFB23E',
    sparkAction: 'paint_stripes_bend_note',
    beatAction: 'wear_custom_stripes',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_20_v2_tower_bridge',
    title: 'Rising Note Tower & Endless Tile Bridge',
    section: 'verse2',
    startTime: 60.14,
    endTime: 64.15,
    lyric: 'A chorus that should lift you up, a bridge that shouldn’t end.',
    narrativePurpose: 'Notes stack into a tower lifting Spark up; a bridge of tile segments extends across a gap past the horizon.',
    cameraPos: [2.8, 4.2, 10.8],
    cameraTarget: [0, 2.0, -2.5],
    fov: 46,
    bgHex: '#261C52',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFB23E',
    sparkAction: 'ride_note_tower',
    beatAction: 'extend_horizon_bridge',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_21_v2_words_ring_true',
    title: 'Tuning Bell, Question Marks & Wobbling Note',
    section: 'verse2',
    startTime: 64.15,
    endTime: 67.21,
    lyric: 'You wonder if the words ring true, if every note belongs,',
    narrativePurpose: 'Spark taps a small bell and holds it to its ear as question marks pop up; one note wobbles outside the staff.',
    cameraPos: [-1.0, 2.4, 7.2],
    cameraTarget: [-0.3, 1.4, 0],
    fov: 38,
    bgHex: '#231D4F',
    floorBaseHex: '#29235C',
    accentHex: '#FFF4E0',
    sparkAction: 'listen_bell_wonder',
    beatAction: 'spot_wobbling_note',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'bell_questions',
  },
  {
    id: 'shot_22_v2_starting_point',
    title: 'Chalk START Line & Melody Ribbon Lift-Off',
    section: 'verse2',
    startTime: 67.21,
    endTime: 71.5,
    lyric: 'I’m here to meet your starting point and help it turn to song.',
    narrativePurpose: 'Beat scoots the wobbling note into place and meets Spark at the chalk START line; dots lift off as a melody ribbon.',
    cameraPos: [0, 2.8, 8.8],
    cameraTarget: [0, 1.3, 0.5],
    fov: 42,
    bgHex: '#261C52',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFB23E',
    sparkAction: 'meet_at_start_line',
    beatAction: 'scoot_note_meet_start',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  // PRE-CHORUS 2 (1:11.50 - 1:20.26)
  {
    id: 'shot_23_pc2_color_wheel',
    title: 'Spinning Color Wheel: Teal & Coral',
    section: 'prechorus2',
    startTime: 71.5,
    endTime: 74.39,
    lyric: 'You name the colors, pick the pace,',
    narrativePurpose: 'A color wheel spins and Spark picks teal and coral, bathing the floor in fresh duotone light.',
    cameraPos: [-1.5, 3.2, 8.6],
    cameraTarget: [0, 1.5, 0],
    fov: 44,
    bgHex: '#291D58',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FF6B6B',
    sparkAction: 'pick_color_wheel',
    beatAction: 'pace_snap_duotone',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'color_wheel',
  },
  {
    id: 'shot_24_pc2_staircase_riser',
    title: 'Rising Staircase to Grand Stage & Freeze',
    section: 'prechorus2',
    startTime: 74.39,
    endTime: 80.26,
    lyric: 'I find a path through the open space.',
    narrativePurpose: 'The path becomes a rising staircase of glowing tiles carrying Spark and Beat up to a bigger stage; 1-beat freeze at end.',
    cameraPos: [2.2, 3.8, 9.5],
    cameraTarget: [0, 2.0, -1.0],
    fov: 45,
    bgHex: '#311D62',
    floorBaseHex: '#FF6B6B',
    accentHex: '#2EC4B6',
    sparkAction: 'climb_staircase',
    beatAction: 'build_staircase',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'freeze_beat',
  },
  // CHORUS 2 (1:20.26 - 1:38.0)
  {
    id: 'shot_25_c2_fireworks_spark',
    title: 'Chorus 2 Upgrade: Fireworks Burst & Confetti',
    section: 'chorus2',
    startTime: 80.26,
    endTime: 82.3,
    lyric: 'You bring the spark, I shape the sound,',
    narrativePurpose: 'Bigger stage with full Chorus Tile crowd, confetti, and fireworks bursting from Beat chest ring.',
    cameraPos: [0, 3.6, 10.8],
    cameraTarget: [0, 1.8, -1.0],
    fov: 50,
    bgHex: '#43165E',
    floorBaseHex: '#E83F8C',
    accentHex: '#FFB23E',
    sparkAction: 'launch_fireworks',
    beatAction: 'grand_eq_conduct',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_26_c2_crowd_orb_loop',
    title: 'Melody Orb Crowd Loop',
    section: 'chorus2',
    startTime: 82.3,
    endTime: 84.29,
    lyric: 'We pass the melody around.',
    narrativePurpose: 'The melody orb flies out across the entire 3-tier crowd of Chorus Tiles in a sweeping grand loop.',
    cameraPos: [3.2, 4.0, 9.6],
    cameraTarget: [0, 1.8, -1.2],
    fov: 46,
    bgHex: '#4A1866',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFF4E0',
    sparkAction: 'conduct_orb_loop',
    beatAction: 'conduct_orb_loop',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_27_c2_triple_morph',
    title: 'Triple Shape Morph (Circle -> Cube -> Star)',
    section: 'chorus2',
    startTime: 84.29,
    endTime: 85.91,
    lyric: 'You say, “That’s close—now make it new,”',
    narrativePurpose: 'The orb morphs rapidly through three distinct geometric shapes in quick succession.',
    cameraPos: [-1.2, 2.5, 6.8],
    cameraTarget: [0, 1.8, 0],
    fov: 40,
    bgHex: '#3E1559',
    floorBaseHex: '#FFB23E',
    accentHex: '#E83F8C',
    sparkAction: 'triple_shape_morph',
    beatAction: 'frame_morph_snap',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_28_c2_spotlight_you',
    title: 'Fourth-Wall Spotlight on Viewer',
    section: 'chorus2',
    startTime: 85.91,
    endTime: 87.76,
    lyric: 'A song is something we make with you.',
    narrativePurpose: 'Everyone points at the camera as a bright spotlight circle lands directly on the viewer.',
    cameraPos: [0, 2.6, 9.8],
    cameraTarget: [0, 1.5, 0],
    fov: 48,
    bgHex: '#4F1A6B',
    floorBaseHex: '#E83F8C',
    accentHex: '#FFF4E0',
    sparkAction: 'point_at_camera',
    beatAction: 'point_at_camera',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'fourth_wall',
  },
  {
    id: 'shot_29_c2_flawed_heart',
    title: 'Upgraded Split: Cracked Beating Heart & Glowing Flaw',
    section: 'chorus2',
    startTime: 87.76,
    endTime: 89.59,
    lyric: 'Some hear a heartbeat, some hear a flaw,',
    narrativePurpose: 'The heart is slightly cracked but still beating; the cracked note now has a tiny heart glowing inside the crack.',
    cameraPos: [0, 2.5, 8.4],
    cameraTarget: [0, 1.4, 0],
    fov: 42,
    bgHex: '#341654',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFB23E',
    sparkAction: 'embrace_flaw',
    beatAction: 'glow_inner_flaw',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'split_heart_flaw_v2',
  },
  {
    id: 'shot_30_c2_more_raw_equal',
    title: 'Glitter Note & Bare Outline Side by Side',
    section: 'chorus2',
    startTime: 89.59,
    endTime: 91.56,
    lyric: 'Some want a little more, some want it raw.',
    narrativePurpose: 'The glittery note and the bare outline sit side by side in unity, both lit with warm equal light.',
    cameraPos: [0, 2.5, 8.4],
    cameraTarget: [0, 1.4, 0],
    fov: 42,
    bgHex: '#3A185C',
    floorBaseHex: '#FFB23E',
    accentHex: '#FFF4E0',
    sparkAction: 'unify_notes',
    beatAction: 'unify_notes',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'split_more_raw_v2',
  },
  {
    id: 'shot_31_c2_hollow_ring_2',
    title: 'Close-Up: Borrowed Amber Lantern in Hollow Ring (Motif #2)',
    section: 'chorus2',
    startTime: 91.56,
    endTime: 95.01,
    lyric: 'I don’t have a heart like yours to prove—',
    narrativePurpose: 'Push-in on Beat chest ring: a small amber light now sits inside the hollow ring like a warm lantern.',
    cameraPos: [0.85, 1.75, 4.1],
    cameraTarget: [0.6, 1.35, 0],
    fov: 30,
    bgHex: '#1C1442',
    floorBaseHex: '#241B52',
    accentHex: '#FFB23E',
    sparkAction: 'tender_gaze',
    beatAction: 'hold_amber_lantern',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_32_c2_groove_stage_ripple',
    title: 'Grand Stage Ripple Burst',
    section: 'chorus2',
    startTime: 95.01,
    endTime: 98.0,
    lyric: 'But I can help your feeling find its groove.',
    narrativePurpose: 'Bigger burst than Chorus 1: the entire expanded stage ripples with concentric waves of teal, amber, and magenta.',
    cameraPos: [0, 4.2, 11.2],
    cameraTarget: [0, 1.4, 0],
    fov: 48,
    bgHex: '#461864',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFB23E',
    sparkAction: 'joy_leap_burst',
    beatAction: 'omni_tile_ripple',
    hollowRingState: 'lit_combo',
    deadlineState: 'orbiting',
    specialOverlay: 'groove_tiles',
  },
  // BREAK 2 (1:38.0 - 1:51.69)
  {
    id: 'shot_33_b2_mirror_dance',
    title: 'Break 2: Role-Swap Mirror Dance & Quiet Wind-Down',
    section: 'break2',
    startTime: 98.0,
    endTime: 111.69,
    lyric: '[Mirror Dance — Role Swap & Quiet Flicker Wind-Down]',
    narrativePurpose: 'Spark leads clipped off-beat moves while Beat copies with a twist; then tiles go dark one by one until they stand breathing.',
    cameraPos: [0, 3.0, 9.0],
    cameraTarget: [0, 1.2, 0],
    fov: 42,
    bgHex: '#1E1846',
    floorBaseHex: '#1B1646',
    accentHex: '#2EC4B6',
    sparkAction: 'mirror_clipped_lead',
    beatAction: 'mirror_bouncy_twist',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  // BRIDGE (1:51.69 - 2:08.61)
  {
    id: 'shot_34_br_draft_cards',
    title: 'Bridge: Pale Lavender Floating Draft Cards & Eraser',
    section: 'bridge',
    startTime: 111.69,
    endTime: 115.38,
    lyric: 'Maybe you’ll love it, maybe you’ll change a line,',
    narrativePurpose: 'Quiet pale cream-lavender space. Paper draft cards float; Spark stamps a heart on one and erases/redraws another.',
    cameraPos: [-1.2, 2.3, 7.4],
    cameraTarget: [0, 1.4, 0],
    fov: 38,
    bgHex: '#D8CEEC',
    floorBaseHex: '#E8E0F5',
    accentHex: '#E83F8C',
    sparkAction: 'erase_redraw_card',
    beatAction: 'hold_draft_cards',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_35_br_polish_stone',
    title: 'Polishing the Rough Stone Note to Shine',
    section: 'bridge',
    startTime: 115.38,
    endTime: 119.21,
    lyric: 'Maybe the first take just helps you find the shine.',
    narrativePurpose: 'First-take card holds a rough gray stone note; Spark polishes it until a bright specular shine glints on a keyboard ping.',
    cameraPos: [1.0, 2.2, 6.8],
    cameraTarget: [0, 1.4, 0],
    fov: 38,
    bgHex: '#DED5F0',
    floorBaseHex: '#EFE8FA',
    accentHex: '#FFB23E',
    sparkAction: 'polish_stone_note',
    beatAction: 'gentle_nod',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_36_br_three_pedestals',
    title: 'Three Pedestal Versions & Selector Ring',
    section: 'bridge',
    startTime: 119.21,
    endTime: 122.82,
    lyric: 'The choice stays yours when the last note’s through:',
    narrativePurpose: 'Beat steps back and offers three finished versions on pedestals; Spark walks along holding a glowing selector ring.',
    cameraPos: [0, 2.9, 8.6],
    cameraTarget: [0, 1.3, 0],
    fov: 42,
    bgHex: '#E4DCF5',
    floorBaseHex: '#F3EDFC',
    accentHex: '#2EC4B6',
    sparkAction: 'choose_pedestal_version',
    beatAction: 'present_three_pedestals',
    hollowRingState: 'lantern',
    deadlineState: 'orbiting',
    specialOverlay: 'none',
  },
  {
    id: 'shot_37_br_meaning_from_you',
    title: 'Pouring Amber Heartlight into the Dotted Draft',
    section: 'bridge',
    startTime: 122.82,
    endTime: 128.61,
    lyric: 'I make the first draft; the meaning comes from you.',
    narrativePurpose: 'Beat draft is a dotted outline; Spark pours warm amber light from its own heart into it, filling the outline with color.',
    cameraPos: [0, 2.4, 7.0],
    cameraTarget: [0, 1.4, 0],
    fov: 38,
    bgHex: '#EAE2F8',
    floorBaseHex: '#FFF4E0',
    accentHex: '#FFB23E',
    sparkAction: 'pour_heart_meaning',
    beatAction: 'hold_dotted_draft',
    hollowRingState: 'glowing_amber',
    deadlineState: 'rising_sun',
    specialOverlay: 'none',
  },
  // FINAL CHORUS (2:08.61 - 2:31.10)
  {
    id: 'shot_38_fc_deadline_becomes_sun',
    title: 'Final Chorus Lift-Off: Deadline Ring Swells into Golden Sun',
    section: 'finalchorus',
    startTime: 128.61,
    endTime: 131.88,
    lyric: 'You bring the spark, I shape the sound, / We pass the melody around.',
    narrativePurpose: 'All callbacks return! Countdown ring swells into a warm golden Sun overhead as camera lifts off.',
    cameraPos: [0, 4.2, 11.4],
    cameraTarget: [0, 2.0, -1.0],
    fov: 50,
    bgHex: '#3A195E',
    floorBaseHex: '#FFB23E',
    accentHex: '#E83F8C',
    sparkAction: 'sun_ascend_dance',
    beatAction: 'full_ensemble_shape',
    hollowRingState: 'glowing_amber',
    deadlineState: 'rising_sun',
    specialOverlay: 'none',
  },
  {
    id: 'shot_39_fc_full_cast_you',
    title: 'Full-Cast Fourth-Wall Point',
    section: 'finalchorus',
    startTime: 131.88,
    endTime: 135.53,
    lyric: 'You say, “That’s close—now make it new,” / A song is something we make with you.',
    narrativePurpose: 'Spark, Beat, Sharp-Shoed Notes, and all 3 tiers of Chorus Tiles point directly at the viewer.',
    cameraPos: [0, 3.0, 10.2],
    cameraTarget: [0, 1.5, 0],
    fov: 48,
    bgHex: '#481A68',
    floorBaseHex: '#E83F8C',
    accentHex: '#FFF4E0',
    sparkAction: 'point_at_camera',
    beatAction: 'point_at_camera',
    hollowRingState: 'glowing_amber',
    deadlineState: 'rising_sun',
    specialOverlay: 'fourth_wall',
  },
  {
    id: 'shot_40_fc_ears_ring_true',
    title: 'Chorus Bells & Floor Ripples',
    section: 'finalchorus',
    startTime: 135.53,
    endTime: 137.35,
    lyric: 'Your ears decide what rings as true,',
    narrativePurpose: 'Every Chorus Tile holds a golden bell and ringing concentric ripples spread across the 16-column floor.',
    cameraPos: [-2.2, 3.8, 9.4],
    cameraTarget: [0, 1.5, -0.5],
    fov: 45,
    bgHex: '#3F1B63',
    floorBaseHex: '#2EC4B6',
    accentHex: '#FFB23E',
    sparkAction: 'ring_chorus_bells',
    beatAction: 'ripple_floor_sync',
    hollowRingState: 'glowing_amber',
    deadlineState: 'rising_sun',
    specialOverlay: 'bell_ripples',
  },
  {
    id: 'shot_41_fc_spin_stage_360',
    title: 'Giant Dial Spins Entire Stage 360°',
    section: 'finalchorus',
    startTime: 137.35,
    endTime: 139.11,
    lyric: 'Your hands can turn the whole thing through.',
    narrativePurpose: 'Spark grabs a giant studio dial and spins the entire stage 360 degrees like a vinyl platter.',
    cameraPos: [0, 5.2, 10.5],
    cameraTarget: [0, 1.2, 0],
    fov: 48,
    bgHex: '#4B1C6D',
    floorBaseHex: '#FFB23E',
    accentHex: '#2EC4B6',
    sparkAction: 'spin_giant_dial',
    beatAction: 'turntable_spin_360',
    hollowRingState: 'glowing_amber',
    deadlineState: 'rising_sun',
    specialOverlay: 'stage_spin_360',
  },
  {
    id: 'shot_42_fc_hollow_ring_3',
    title: 'Close-Up: Hollow Ring Already Glowing Amber (Motif #3 Payoff)',
    section: 'finalchorus',
    startTime: 139.11,
    endTime: 143.2,
    lyric: 'I don’t have a heart like yours to prove—',
    narrativePurpose: 'Final close-up of Beat hollow chest ring: it is already glowing radiant warm amber from within.',
    cameraPos: [0.8, 1.75, 4.0],
    cameraTarget: [0.55, 1.35, 0],
    fov: 30,
    bgHex: '#2A184D',
    floorBaseHex: '#FFB23E',
    accentHex: '#FFF4E0',
    sparkAction: 'stand_beside_proud',
    beatAction: 'radiant_amber_chest',
    hollowRingState: 'glowing_amber',
    deadlineState: 'rising_sun',
    specialOverlay: 'none',
  },
  {
    id: 'shot_43_fc_double_heartbeat_climax',
    title: 'Double Heartbeat Pulse, Cream Flash & Memory Collage',
    section: 'finalchorus',
    startTime: 143.2,
    endTime: 151.1,
    lyric: 'But I can help your feeling find its groove.',
    narrativePurpose: 'Spark heart and Beat ring pulse together in a double beat; cream flash and collage of every moment settles to calm.',
    cameraPos: [0, 3.4, 9.6],
    cameraTarget: [0, 1.4, 0],
    fov: 46,
    bgHex: '#4E1F6E',
    floorBaseHex: '#FFF4E0',
    accentHex: '#FFB23E',
    sparkAction: 'double_pulse_climax',
    beatAction: 'double_pulse_climax',
    hollowRingState: 'double_pulse',
    deadlineState: 'noon_sun',
    specialOverlay: 'cream_flash_collage',
  },
  // OUTRO (2:31.10 - 2:51.5)
  {
    id: 'shot_44_outro_new_thought',
    title: 'Outro: Cream Horizon & New Drifting Squiggle Idea',
    section: 'outro',
    startTime: 151.1,
    endTime: 155.23,
    lyric: 'Bring me a thought, a phrase, a tune—',
    narrativePurpose: 'Quiet cream stage, sun low on horizon. Beat sits with softly lit ring as a new squiggle drifts in from the right.',
    cameraPos: [0, 2.5, 8.8],
    cameraTarget: [0.4, 1.3, 0],
    fov: 40,
    bgHex: '#F5E8D3',
    floorBaseHex: '#E6D5B8',
    accentHex: '#2EC4B6',
    sparkAction: 'look_up_new_squiggle',
    beatAction: 'sit_softly_lit_wait',
    hollowRingState: 'glowing_amber',
    deadlineState: 'noon_sun',
    specialOverlay: 'none',
  },
  {
    id: 'shot_45_outro_by_noon',
    title: 'Sun Rises to Noon & New Groove Ignites',
    section: 'outro',
    startTime: 155.23,
    endTime: 168.0,
    lyric: 'We’ll see what it can be by noon.',
    narrativePurpose: 'The sun rises to the top of the frame (noon). The new squiggle lands and tiles light one by one into a fresh groove.',
    cameraPos: [0, 3.0, 9.8],
    cameraTarget: [0, 1.6, 0],
    fov: 44,
    bgHex: '#FFF4E0',
    floorBaseHex: '#F2DEC0',
    accentHex: '#FFB23E',
    sparkAction: 'welcome_new_groove',
    beatAction: 'gentle_groove_nod',
    hollowRingState: 'glowing_amber',
    deadlineState: 'noon_sun',
    specialOverlay: 'none',
  },
  {
    id: 'shot_46_outro_loop_tile',
    title: 'Clean Loop: Cut to Black & Single Teal Tile',
    section: 'outro',
    startTime: 168.0,
    endTime: 171.5,
    lyric: '[Single Teal Tile — Clean Loop to Opening]',
    narrativePurpose: 'On the last chord, cut to black with a single center tile lighting teal, matching 0:00 so the video loops cleanly.',
    cameraPos: [0, 3.2, 11.5],
    cameraTarget: [0, 0.8, 0],
    fov: 45,
    bgHex: '#0D0A24',
    floorBaseHex: '#1B1646',
    accentHex: '#2EC4B6',
    sparkAction: 'waiting_offstage_left',
    beatAction: 'hidden_below',
    hollowRingState: 'dim',
    deadlineState: 'hidden',
    specialOverlay: 'loop_single_tile',
  },
];

/**
 * Parses standard LRC format strings into structured timestamps and lyrics.
 */
export function parseLrc(lrcText: string): {time: number; text: string}[] {
  const lines = lrcText.split(/\r?\n/);
  const result: {time: number; text: string}[] = [];
  const timeRegex = /^\[(\d{2}):(\d{2}\.\d{2,3})\](.*)$/;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    const match = trimmed.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const text = match[3].trim();
      const totalSeconds = Number((minutes * 60 + seconds).toFixed(3));
      result.push({time: totalSeconds, text});
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * Returns the active ShotSpec for any timestamp t in [0, duration].
 */
export function getShotAtTime(timeSec: number): ShotSpec {
  const clamped = Math.max(0, Math.min(SONG_METADATA.duration - 0.001, timeSec));
  for (let i = 0; i < SHOTS.length; i++) {
    const shot = SHOTS[i];
    if (clamped >= shot.startTime && clamped < shot.endTime) {
      return shot;
    }
  }
  return SHOTS[SHOTS.length - 1];
}

/**
 * Computes deterministic beat and off-beat phase values for a given time in seconds.
 */
export function getBeatMetrics(timeSec: number, bpm: number = SONG_METADATA.bpm) {
  const beatDuration = 60 / bpm; // ~0.4918s
  const totalBeats = timeSec / beatDuration;
  const beatIndex = Math.floor(totalBeats);
  const beatPhase = totalBeats - beatIndex; // [0, 1)
  // Off-beat phase peaks at 0.5 through each beat
  const offBeatPhase = (beatPhase + 0.5) % 1;
  const isFreezeWindow =
    (timeSec >= 24.75 && timeSec <= 25.22) ||
    (timeSec >= 79.75 && timeSec <= 80.24);

  // Clipped snap curve for Beat ("hold, snap, hold")
  const snapProgress = isFreezeWindow
    ? 0
    : offBeatPhase < 0.72
      ? 0
      : Math.min(1, (offBeatPhase - 0.72) / 0.18);

  // Bouncy ahead-of-beat curve for Spark
  const sparkBounce = isFreezeWindow
    ? 0
    : Math.abs(Math.sin((totalBeats + 0.18) * Math.PI));

  return {
    beatDuration,
    totalBeats,
    beatIndex,
    beatPhase,
    offBeatPhase,
    isFreezeWindow,
    snapProgress,
    sparkBounce,
  };
}

/**
 * Computes deterministic intensity [0..1] for a tile at (col: 0..15, row: 0..7) at timeSec.
 */
export function getTileIntensity(
  col: number,
  row: number,
  timeSec: number,
  audioBassEnergy: number = 0.5
): number {
  const shot = getShotAtTime(timeSec);
  const {beatIndex, beatPhase, isFreezeWindow} = getBeatMetrics(timeSec);

  // Opening and closing single-tile shots: only center tile (7, 3) lights up
  if (shot.specialOverlay === 'intro_title' || shot.specialOverlay === 'loop_single_tile') {
    if (col === 7 && row === 3) {
      const pulse = 0.75 + 0.25 * Math.sin(timeSec * 8);
      return pulse;
    }
    return 0.02;
  }

  // Riser freeze moment
  if (isFreezeWindow) {
    return col < 14 ? 0.85 : 0.1;
  }

  // Riser left-to-right sweep (0:22-0:24.9 and 1:17-1:19.8)
  if ((timeSec >= 21.8 && timeSec < 24.75) || (timeSec >= 76.8 && timeSec < 79.75)) {
    const start = timeSec >= 70 ? 76.8 : 21.8;
    const progress = (timeSec - start) / 2.95; // 0..1
    const activeCol = Math.floor(progress * 16);
    return col <= activeCol ? 0.9 : 0.08;
  }

  // Break 2 wind-down (1:45 - 1:51.69): tiles go dark one by one except one flickering tile
  if (timeSec >= 105.0 && timeSec < 111.69) {
    if (col === 8 && row === 4) {
      return 0.4 + 0.45 * Math.sin(timeSec * 18);
    }
    const fadeProgress = (timeSec - 105.0) / 6.69;
    const threshold = (col + row * 2) / 30;
    return threshold > fadeProgress ? 0.35 : 0.03;
  }

  // Bridge: soft, calm lavender-cream glow
  if (shot.section === 'bridge') {
    const dist = Math.hypot(col - 7.5, row - 3.5);
    const wave = 0.5 + 0.5 * Math.sin(dist * 0.8 - timeSec * 2.2);
    return 0.18 + 0.25 * wave;
  }

  // Outro: almost no tiles lit until 2:35.2, then tiles light one by one into a new groove
  if (shot.section === 'outro') {
    if (timeSec < 155.23) {
      return col === 8 && row === 3 ? 0.55 : 0.04;
    }
    const elapsed = timeSec - 155.23;
    const litCount = Math.floor(elapsed * 8);
    const tileOrder = col + row * 16;
    return tileOrder <= litCount ? 0.65 + 0.2 * Math.sin(timeSec * 4 + col) : 0.04;
  }

  // Standard groove / chorus ripple pattern
  const centerDist = Math.hypot(col - 7.5, row - 3.5);
  const ripple = Math.sin(centerDist * 0.9 - (beatIndex + beatPhase) * 2.0);
  const checker = (col + row + beatIndex) % 2 === 0 ? 0.25 : 0.0;
  const bassBoost = audioBassEnergy * 0.35 * (1 - beatPhase);
  return Math.max(0.06, Math.min(1.0, 0.32 + 0.35 * Math.max(0, ripple) + checker + bassBoost));
}

/**
 * Formats seconds into M:SS.d tabular timestamp string.
 */
export function formatTimestamp(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const tenths = Math.floor((safe % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
}
