// 16-bit Cyber-Alchemist Procedural Chiptune BGM Engine (Web Audio API)
// Generates authentic retro RPG & Workout synth music loops with zero external bandwidth or latency.

let audioCtx: AudioContext | null = null;
let masterBgmGain: GainNode | null = null;
let isBgmPlaying = false;
let currentTrackIndex = 0;
let playbackTimer: number | null = null;
let currentVolume = 0.35; // default 35% comfortable ambient volume

export interface BgmTrack {
  id: string;
  title: string;
  tempo: number; // BPM
  scale: string;
  mood: string;
}

export const BGM_TRACKS: BgmTrack[] = [
  {
    id: 'crucible',
    title: 'Crucible of Mana',
    tempo: 124,
    scale: 'D Minor Cyber-RPG',
    mood: 'Mystical Lab',
  },
  {
    id: 'cadence',
    title: 'Runner’s Cadence (180 BPM)',
    tempo: 180,
    scale: 'F# Dorian Workout',
    mood: 'High Energy',
  },
  {
    id: 'sanctuary',
    title: 'Alchemist Sanctuary',
    tempo: 96,
    scale: 'A Lydian Ambient',
    mood: 'Recovery & Chill',
  },
  {
    id: 'boss',
    title: 'VDOT Matrix Overdrive',
    tempo: 142,
    scale: 'E Minor Boss Battle',
    mood: 'Arcade Drive',
  },
];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterGain(ctx: AudioContext): GainNode {
  if (!masterBgmGain) {
    masterBgmGain = ctx.createGain();
    masterBgmGain.gain.setValueAtTime(currentVolume, ctx.currentTime);
    masterBgmGain.connect(ctx.destination);
  }
  return masterBgmGain;
}

// Frequency helper (MIDI note number to Hz)
function mToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Note sequences for each track
const TRACK_DATA: Record<
  string,
  {
    bpm: number;
    steps: number;
    chords: number[][]; // 4 bars of chords [root, third, fifth, opt octave]
    melody: (number | null)[];
    bass: number[];
  }
> = {
  crucible: {
    bpm: 120,
    steps: 32,
    // Dm - Bb - F - C
    chords: [
      [50, 53, 57, 62], // Dm
      [46, 50, 53, 58], // Bb
      [41, 45, 48, 53], // F
      [48, 52, 55, 60], // C
    ],
    melody: [
      62, null, 65, 69, 74, 72, 69, 65, 
      65, null, 62, 58, 65, 69, 65, 58,
      57, 60, 65, 69, 72, 69, 65, 60,
      60, 64, 67, 72, 76, 72, 67, 64,
    ],
    bass: [
      38, 38, 50, 38, 38, 50, 38, 50,
      34, 34, 46, 34, 34, 46, 34, 46,
      29, 29, 41, 29, 29, 41, 29, 41,
      36, 36, 48, 36, 36, 48, 36, 48,
    ],
  },
  cadence: {
    bpm: 180,
    steps: 32,
    // F#m - A - E - Bm
    chords: [
      [54, 57, 61, 66], // F#m
      [57, 61, 64, 69], // A
      [52, 56, 59, 64], // E
      [47, 50, 54, 59], // Bm
    ],
    melody: [
      66, 69, 73, 78, 73, 69, 66, 69,
      69, 73, 76, 81, 76, 73, 69, 73,
      64, 68, 71, 76, 71, 68, 64, 68,
      71, 74, 78, 83, 78, 74, 71, 74,
    ],
    bass: [
      42, 42, 42, 42, 42, 42, 42, 42,
      45, 45, 45, 45, 45, 45, 45, 45,
      40, 40, 40, 40, 40, 40, 40, 40,
      35, 35, 35, 35, 35, 35, 35, 35,
    ],
  },
  sanctuary: {
    bpm: 92,
    steps: 32,
    // Amaj7 - Dmaj7 - F#m7 - E
    chords: [
      [57, 61, 64, 68], // Amaj7
      [50, 54, 57, 61], // Dmaj7
      [54, 57, 61, 64], // F#m7
      [52, 56, 59, 64], // E
    ],
    melody: [
      69, null, 73, null, 76, 80, 76, null,
      74, null, 78, null, 81, 85, 81, null,
      73, null, 76, null, 80, 85, 80, null,
      71, null, 76, null, 79, 83, 79, null,
    ],
    bass: [
      45, null, 45, null, 57, null, 45, null,
      38, null, 38, null, 50, null, 38, null,
      42, null, 42, null, 54, null, 42, null,
      40, null, 40, null, 52, null, 40, null,
    ],
  },
  boss: {
    bpm: 144,
    steps: 32,
    // Em - C - Am - B7
    chords: [
      [52, 55, 59, 64], // Em
      [48, 52, 55, 60], // C
      [45, 48, 52, 57], // Am
      [47, 51, 54, 59], // B
    ],
    melody: [
      76, 75, 76, 79, 83, 79, 76, 71,
      72, 71, 72, 76, 79, 76, 72, 67,
      69, 68, 69, 72, 76, 72, 69, 64,
      71, 75, 78, 83, 86, 83, 78, 75,
    ],
    bass: [
      40, 40, 52, 40, 40, 52, 40, 52,
      36, 36, 48, 36, 36, 48, 36, 48,
      33, 33, 45, 33, 33, 45, 33, 45,
      35, 35, 47, 35, 35, 47, 35, 47,
    ],
  },
};

let currentStep = 0;

function scheduleStep() {
  if (!isBgmPlaying) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const trackConfig = BGM_TRACKS[currentTrackIndex];
  const data = TRACK_DATA[trackConfig.id] || TRACK_DATA.crucible;
  const master = getMasterGain(ctx);

  const stepDuration = 60 / data.bpm / 4; // 16th note in seconds
  const now = ctx.currentTime;

  // 1. Play Bass Note
  const bassMidi = data.bass[currentStep % data.steps];
  if (bassMidi) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(mToFreq(bassMidi), now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + stepDuration * 1.8);
    } catch (e) {}
  }

  // 2. Play Arpeggio / Chord Layer
  const barIndex = Math.floor((currentStep % data.steps) / 8);
  const chord = data.chords[barIndex % data.chords.length];
  if (chord) {
    const chordNoteMidi = chord[currentStep % chord.length];
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(mToFreq(chordNoteMidi), now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + stepDuration * 0.9);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + stepDuration * 0.9);
    } catch (e) {}
  }

  // 3. Play Lead Melody
  const leadMidi = data.melody[currentStep % data.steps];
  if (leadMidi) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(mToFreq(leadMidi), now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.5);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + stepDuration * 1.5);
    } catch (e) {}
  }

  // 4. Retro 8-bit Noise Hi-Hat / Snare Drum
  if (currentStep % 2 === 0) {
    try {
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = currentStep % 8 === 4 ? 'bandpass' : 'highpass';
      filter.frequency.value = currentStep % 8 === 4 ? 2200 : 7000;

      const gain = ctx.createGain();
      const isSnare = currentStep % 8 === 4;
      gain.gain.setValueAtTime(isSnare ? 0.08 : 0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (isSnare ? 0.09 : 0.03));

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      whiteNoise.start(now);
      whiteNoise.stop(now + (isSnare ? 0.09 : 0.03));
    } catch (e) {}
  }

  currentStep++;
  playbackTimer = window.setTimeout(scheduleStep, stepDuration * 1000);
}

// BGM Controls
export const startBgm = (trackIdx?: number) => {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (trackIdx !== undefined) {
    currentTrackIndex = Math.max(0, Math.min(trackIdx, BGM_TRACKS.length - 1));
  }

  if (isBgmPlaying) {
    stopBgm();
  }

  isBgmPlaying = true;
  currentStep = 0;
  scheduleStep();
  return true;
};

export const stopBgm = () => {
  isBgmPlaying = false;
  if (playbackTimer !== null) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
};

export const toggleBgm = (enable?: boolean): boolean => {
  if (enable !== undefined) {
    if (enable) {
      startBgm();
    } else {
      stopBgm();
    }
  } else {
    if (isBgmPlaying) {
      stopBgm();
    } else {
      startBgm();
    }
  }
  return isBgmPlaying;
};

export const setBgmTrack = (index: number) => {
  currentTrackIndex = (index + BGM_TRACKS.length) % BGM_TRACKS.length;
  if (isBgmPlaying) {
    startBgm(currentTrackIndex);
  }
  return currentTrackIndex;
};

export const setBgmVolume = (volume0to1: number) => {
  currentVolume = Math.max(0, Math.min(1, volume0to1));
  const ctx = getAudioContext();
  if (ctx && masterBgmGain) {
    masterBgmGain.gain.setValueAtTime(currentVolume, ctx.currentTime);
  }
  return currentVolume;
};

export const getBgmState = () => ({
  isPlaying: isBgmPlaying,
  currentTrackIndex,
  currentTrack: BGM_TRACKS[currentTrackIndex],
  volume: currentVolume,
  tracks: BGM_TRACKS,
});
