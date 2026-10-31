/**
 * Advanced Procedural Web Audio FX & Soundscape Engine
 * Features:
 * - High-tech UI SFX (clicks, chimes, warps)
 * - Dynamic Atmospheric Soundscape with Planet Theme Adaptation
 * - Spatial Audio Panning for Orbiting Modules
 * - Reyplace Generative Music Synthesizer Player with Waveform Telemetry
 * - Authentic Real Physical Biofrequencies:
 *    1. Resonancia Schumann de la Tierra (7.83 Hz real) con portador binaural 136.1 Hz
 *    2. Frecuencia de Armonía Cósmica (432 Hz)
 *    3. Frecuencia de Tranquilidad Solfeggio (528 Hz)
 *    4. Frecuencia de Adrenalina & Motivación (Gamma 40 Hz + 144 Hz)
 */

import {
  PlanetTheme,
  AudioMode,
  HarmonicFrequencyMode,
  REYPLACE_MUSIC_PLAYLIST,
  MusicTrack
} from '../types/system';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Soundscape Nodes
  private soundscapeGain: GainNode | null = null;
  private soundscapeFilter: BiquadFilterNode | null = null;
  private soundscapePanner: StereoPannerNode | null = null;
  private soundscapeOsc1: OscillatorNode | null = null;
  private soundscapeOsc2: OscillatorNode | null = null;
  private soundscapeRunning: boolean = false;
  private currentTheme: PlanetTheme = 'real-earth';
  private soundscapeVolume: number = 0.35;

  // Music Player Nodes
  private musicGain: GainNode | null = null;
  private musicAnalyser: AnalyserNode | null = null;
  private musicMode: AudioMode = 'soundscape';
  private isMusicPlaying: boolean = false;
  private currentTrackIndex: number = 0;
  private musicTimerId: number | null = null;
  private musicStep: number = 0;

  // Harmonic Physical Frequencies Nodes
  private freqMode: HarmonicFrequencyMode = 'earth-schumann';
  private freqGain: GainNode | null = null;
  private freqOsc1: OscillatorNode | null = null;
  private freqOsc2: OscillatorNode | null = null;
  private freqSubOsc: OscillatorNode | null = null;
  private freqPulseLfo: OscillatorNode | null = null;
  private freqPulseGain: GainNode | null = null;
  private freqRunning: boolean = false;
  private freqVolume: number = 0.4;

  constructor() {
    const saved = localStorage.getItem('reyplace_sound_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
    const savedFreq = localStorage.getItem('reyplace_freq_mode');
    if (savedFreq) {
      this.freqMode = savedFreq as HarmonicFrequencyMode;
    }
  }

  public initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('reyplace_sound_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopSoundscape();
      this.pauseMusic();
      this.stopHarmonicFrequency();
    } else {
      this.playChime(640, 0.08);
      if (this.musicMode === 'soundscape') {
        this.startSoundscape(this.currentTheme);
      } else if (this.musicMode === 'frequencies') {
        this.startHarmonicFrequency(this.freqMode);
      } else {
        this.resumeMusic();
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- ATMOSPHERIC SOUNDSCAPE MANAGER ---

  public startSoundscape(theme: PlanetTheme = 'real-earth') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    if (this.soundscapeRunning) {
      this.updateTheme(theme);
      return;
    }

    try {
      this.currentTheme = theme;

      // Panner Node
      if (ctx.createStereoPanner) {
        this.soundscapePanner = ctx.createStereoPanner();
      }

      // Filter Node
      this.soundscapeFilter = ctx.createBiquadFilter();
      this.soundscapeFilter.type = 'lowpass';
      this.soundscapeFilter.frequency.setValueAtTime(140, ctx.currentTime);
      this.soundscapeFilter.Q.setValueAtTime(3.0, ctx.currentTime);

      // Gain Node
      this.soundscapeGain = ctx.createGain();
      this.soundscapeGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.soundscapeGain.gain.exponentialRampToValueAtTime(this.soundscapeVolume, ctx.currentTime + 2.0);

      // Oscillators
      this.soundscapeOsc1 = ctx.createOscillator();
      this.soundscapeOsc2 = ctx.createOscillator();

      this.applyThemeFrequencies(theme);

      // Wiring to Analyser and Master
      this.ensureAnalyser();

      if (this.soundscapePanner) {
        this.soundscapeOsc1.connect(this.soundscapeFilter);
        this.soundscapeOsc2.connect(this.soundscapeFilter);
        this.soundscapeFilter.connect(this.soundscapePanner);
        this.soundscapePanner.connect(this.soundscapeGain);
      } else {
        this.soundscapeOsc1.connect(this.soundscapeFilter);
        this.soundscapeOsc2.connect(this.soundscapeFilter);
        this.soundscapeFilter.connect(this.soundscapeGain);
      }

      if (this.musicAnalyser) {
        this.soundscapeGain.connect(this.musicAnalyser);
        this.musicAnalyser.connect(ctx.destination);
      } else {
        this.soundscapeGain.connect(ctx.destination);
      }

      this.soundscapeOsc1.start();
      this.soundscapeOsc2.start();
      this.soundscapeRunning = true;
    } catch {
      // AudioContext policy blocked before interaction
    }
  }

  public stopSoundscape() {
    if (!this.soundscapeRunning) return;
    try {
      if (this.soundscapeGain && this.ctx) {
        this.soundscapeGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        try {
          this.soundscapeOsc1?.stop();
          this.soundscapeOsc2?.stop();
          this.soundscapeOsc1?.disconnect();
          this.soundscapeOsc2?.disconnect();
        } catch {}
        this.soundscapeRunning = false;
      }, 500);
    } catch {}
  }

  public updateTheme(theme: PlanetTheme) {
    this.currentTheme = theme;
    if (this.soundscapeRunning && this.ctx) {
      this.applyThemeFrequencies(theme);
    }
  }

  private applyThemeFrequencies(theme: PlanetTheme) {
    if (!this.ctx || !this.soundscapeOsc1 || !this.soundscapeOsc2 || !this.soundscapeFilter) return;
    const now = this.ctx.currentTime;

    switch (theme) {
      case 'real-earth':
        // Earth natural tone: 136.1 Hz (Earth Year frequency) + 7.83 Hz Schumann harmonic
        this.soundscapeOsc1.type = 'sine';
        this.soundscapeOsc2.type = 'triangle';
        this.soundscapeOsc1.frequency.setTargetAtTime(136.1, now, 0.8);
        this.soundscapeOsc2.frequency.setTargetAtTime(68.05, now, 0.8);
        this.soundscapeFilter.frequency.setTargetAtTime(180, now, 0.8);
        break;
      case 'oceanic':
        this.soundscapeOsc1.type = 'sine';
        this.soundscapeOsc2.type = 'sine';
        this.soundscapeOsc1.frequency.setTargetAtTime(55, now, 0.8);
        this.soundscapeOsc2.frequency.setTargetAtTime(110.2, now, 0.8);
        this.soundscapeFilter.frequency.setTargetAtTime(120, now, 0.8);
        break;
      case 'cyber':
        this.soundscapeOsc1.type = 'sawtooth';
        this.soundscapeOsc2.type = 'sine';
        this.soundscapeOsc1.frequency.setTargetAtTime(65.4, now, 0.8);
        this.soundscapeOsc2.frequency.setTargetAtTime(130.8, now, 0.8);
        this.soundscapeFilter.frequency.setTargetAtTime(220, now, 0.8);
        break;
      case 'cyber-industrial':
        this.soundscapeOsc1.type = 'triangle';
        this.soundscapeOsc2.type = 'sawtooth';
        this.soundscapeOsc1.frequency.setTargetAtTime(43.6, now, 0.8);
        this.soundscapeOsc2.frequency.setTargetAtTime(87.3, now, 0.8);
        this.soundscapeFilter.frequency.setTargetAtTime(180, now, 0.8);
        break;
      case 'nebula':
        this.soundscapeOsc1.type = 'sine';
        this.soundscapeOsc2.type = 'triangle';
        this.soundscapeOsc1.frequency.setTargetAtTime(73.4, now, 0.8);
        this.soundscapeOsc2.frequency.setTargetAtTime(110.0, now, 0.8);
        this.soundscapeFilter.frequency.setTargetAtTime(260, now, 0.8);
        break;
      case 'aurora':
        this.soundscapeOsc1.type = 'sine';
        this.soundscapeOsc2.type = 'sine';
        this.soundscapeOsc1.frequency.setTargetAtTime(82.4, now, 0.8);
        this.soundscapeOsc2.frequency.setTargetAtTime(164.8, now, 0.8);
        this.soundscapeFilter.frequency.setTargetAtTime(340, now, 0.8);
        break;
    }
  }

  public setSpatialPan(pan: number) {
    if (!this.soundscapePanner || !this.ctx) return;
    const clamped = Math.max(-0.85, Math.min(0.85, pan));
    this.soundscapePanner.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.2);
  }

  public boostInteractionActivity() {
    if (!this.soundscapeFilter || !this.soundscapeGain || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    this.soundscapeFilter.frequency.cancelScheduledValues(now);
    this.soundscapeFilter.frequency.setValueAtTime(this.soundscapeFilter.frequency.value, now);
    this.soundscapeFilter.frequency.exponentialRampToValueAtTime(
      Math.min(1200, this.soundscapeFilter.frequency.value * 2.5),
      now + 0.15
    );
    this.soundscapeFilter.frequency.exponentialRampToValueAtTime(180, now + 1.2);
  }

  // --- AUTHENTIC HARMONIC BIOFREQUENCIES ENGINE ---

  public startHarmonicFrequency(mode: HarmonicFrequencyMode = this.freqMode) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopHarmonicFrequency();
    this.stopSoundscape();
    this.pauseMusic();

    this.freqMode = mode;
    localStorage.setItem('reyplace_freq_mode', mode);
    this.ensureAnalyser();

    try {
      const now = ctx.currentTime;
      this.freqGain = ctx.createGain();
      this.freqGain.gain.setValueAtTime(0.001, now);
      this.freqGain.gain.exponentialRampToValueAtTime(this.freqVolume, now + 1.5);

      this.freqOsc1 = ctx.createOscillator();
      this.freqOsc2 = ctx.createOscillator();
      this.freqSubOsc = ctx.createOscillator();

      switch (mode) {
        case 'earth-schumann':
          // Authentic Earth Schumann Resonance: 7.83 Hz
          // Generated with 136.1 Hz (OM/Earth orbit carrier) + 143.93 Hz (difference = 7.83 Hz binaural beat)
          // and a sub-oscillator pulsing at 7.83 Hz with 14.3 Hz harmonic
          this.freqOsc1.type = 'sine';
          this.freqOsc2.type = 'sine';
          this.freqSubOsc.type = 'sine';

          this.freqOsc1.frequency.setValueAtTime(136.1, now);
          this.freqOsc2.frequency.setValueAtTime(136.1 + 7.83, now); // 143.93 Hz
          this.freqSubOsc.frequency.setValueAtTime(68.05, now);

          // LFO pulse for 7.83 Hz rhythmic breathing
          this.freqPulseLfo = ctx.createOscillator();
          this.freqPulseLfo.frequency.setValueAtTime(7.83, now);
          this.freqPulseGain = ctx.createGain();
          this.freqPulseGain.gain.setValueAtTime(0.15, now);
          this.freqPulseLfo.connect(this.freqPulseGain.gain);
          this.freqPulseLfo.start(now);
          break;

        case 'harmony-432':
          // Natural Harmonic 432 Hz Pythagorean Universal Tuning
          this.freqOsc1.type = 'sine';
          this.freqOsc2.type = 'sine';
          this.freqSubOsc.type = 'triangle';

          this.freqOsc1.frequency.setValueAtTime(432.0, now);
          this.freqOsc2.frequency.setValueAtTime(864.0, now); // Octave harmonic
          this.freqSubOsc.frequency.setValueAtTime(216.0, now); // Sub-bass foundation
          break;

        case 'peace-528':
          // Sacred Solfeggio 528 Hz (Miracle / Cellular Calm & Tranquility)
          this.freqOsc1.type = 'sine';
          this.freqOsc2.type = 'sine';
          this.freqSubOsc.type = 'sine';

          this.freqOsc1.frequency.setValueAtTime(528.0, now);
          this.freqOsc2.frequency.setValueAtTime(264.0, now); // Half octave calm
          this.freqSubOsc.frequency.setValueAtTime(132.0, now);
          break;

        case 'adrenaline-40':
          // 40 Hz Gamma Wave Peak Flow State & High Energy Motivation
          // Binaural 200 Hz & 240 Hz (40 Hz delta) + 144 Hz carrier tone
          this.freqOsc1.type = 'sawtooth';
          this.freqOsc2.type = 'sine';
          this.freqSubOsc.type = 'sine';

          this.freqOsc1.frequency.setValueAtTime(200.0, now);
          this.freqOsc2.frequency.setValueAtTime(240.0, now); // 40 Hz Gamma beat
          this.freqSubOsc.frequency.setValueAtTime(144.0, now); // 144 Hz motivation tone
          break;
      }

      // Filter for smooth acoustic roundness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(mode === 'adrenaline-40' ? 800 : 600, now);

      this.freqOsc1.connect(filter);
      this.freqOsc2.connect(filter);
      this.freqSubOsc.connect(filter);

      filter.connect(this.freqGain);

      if (this.musicAnalyser) {
        this.freqGain.connect(this.musicAnalyser);
        this.musicAnalyser.connect(ctx.destination);
      } else {
        this.freqGain.connect(ctx.destination);
      }

      this.freqOsc1.start(now);
      this.freqOsc2.start(now);
      this.freqSubOsc.start(now);
      this.freqRunning = true;
    } catch {}
  }

  public stopHarmonicFrequency() {
    if (!this.freqRunning) return;
    try {
      if (this.freqGain && this.ctx) {
        this.freqGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      }
      setTimeout(() => {
        try {
          this.freqOsc1?.stop();
          this.freqOsc2?.stop();
          this.freqSubOsc?.stop();
          this.freqPulseLfo?.stop();
          this.freqOsc1?.disconnect();
          this.freqOsc2?.disconnect();
          this.freqSubOsc?.disconnect();
        } catch {}
        this.freqRunning = false;
      }, 350);
    } catch {}
  }

  public setHarmonicFrequencyMode(mode: HarmonicFrequencyMode) {
    this.freqMode = mode;
    localStorage.setItem('reyplace_freq_mode', mode);
    if (this.freqRunning) {
      this.startHarmonicFrequency(mode);
    }
  }

  public getHarmonicFrequencyMode(): HarmonicFrequencyMode {
    return this.freqMode;
  }

  public getIsFrequencyRunning(): boolean {
    return this.freqRunning;
  }

  // --- REYPLACE MUSIC PLAYER ENGINE ---

  private ensureAnalyser() {
    if (!this.ctx) return;
    if (!this.musicAnalyser) {
      this.musicAnalyser = this.ctx.createAnalyser();
      this.musicAnalyser.fftSize = 64;
      this.musicAnalyser.smoothingTimeConstant = 0.8;
    }
  }

  public startMusic(trackIndex = 0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopSoundscape();
    this.stopHarmonicFrequency();
    this.currentTrackIndex = (trackIndex + REYPLACE_MUSIC_PLAYLIST.length) % REYPLACE_MUSIC_PLAYLIST.length;
    this.ensureAnalyser();

    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.28, ctx.currentTime);
      if (this.musicAnalyser) {
        this.musicGain.connect(this.musicAnalyser);
        this.musicAnalyser.connect(ctx.destination);
      } else {
        this.musicGain.connect(ctx.destination);
      }
    }

    this.isMusicPlaying = true;
    this.musicStep = 0;
    this.scheduleMusicStep();
  }

  public pauseMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimerId !== null) {
      clearTimeout(this.musicTimerId);
      this.musicTimerId = null;
    }
  }

  public resumeMusic() {
    if (this.isMuted) return;
    if (!this.isMusicPlaying) {
      this.startMusic(this.currentTrackIndex);
    }
  }

  public nextTrack() {
    this.startMusic(this.currentTrackIndex + 1);
  }

  public prevTrack() {
    this.startMusic(this.currentTrackIndex - 1);
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public getCurrentTrack(): MusicTrack {
    return REYPLACE_MUSIC_PLAYLIST[this.currentTrackIndex] || REYPLACE_MUSIC_PLAYLIST[0];
  }

  public getAnalyserData(): Uint8Array | null {
    if (!this.musicAnalyser) return null;
    const array = new Uint8Array(this.musicAnalyser.frequencyBinCount);
    this.musicAnalyser.getByteFrequencyData(array);
    return array;
  }

  public setAudioMode(mode: AudioMode) {
    this.musicMode = mode;
    if (mode === 'soundscape') {
      this.pauseMusic();
      this.stopHarmonicFrequency();
      this.startSoundscape(this.currentTheme);
    } else if (mode === 'frequencies') {
      this.pauseMusic();
      this.stopSoundscape();
      this.startHarmonicFrequency(this.freqMode);
    } else {
      this.stopSoundscape();
      this.stopHarmonicFrequency();
      this.startMusic(this.currentTrackIndex);
    }
  }

  public getAudioMode(): AudioMode {
    return this.musicMode;
  }

  // Algorithmic sci-fi synth progression
  private scheduleMusicStep() {
    if (!this.isMusicPlaying || !this.ctx || this.isMuted) return;

    const track = this.getCurrentTrack();
    const intervalMs = (60 / track.bpm) * 500; // 8th notes

    this.playAlgorithmicNote(this.musicStep, track.id);
    this.musicStep = (this.musicStep + 1) % 16;

    this.musicTimerId = window.setTimeout(() => {
      this.scheduleMusicStep();
    }, intervalMs);
  }

  private playAlgorithmicNote(step: number, trackId: string) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      let root = 220; // A3
      if (trackId === 'track-02') root = 196; // G3
      if (trackId === 'track-03') root = 246.94; // B3
      if (trackId === 'track-04') root = 261.63; // C4

      // Minor pentatonic intervals: [0, 3, 5, 7, 10, 12, 15]
      const pentatonic = [0, 3, 5, 7, 10, 12, 15, 17];
      const noteIndex = (step * 3 + (step % 4)) % pentatonic.length;
      const semitones = pentatonic[noteIndex];
      const freq = root * Math.pow(2, semitones / 12);

      osc.type = step % 4 === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.38);

      // Bass drone on downbeats
      if (step % 8 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(root / 2, now);

        bassGain.gain.setValueAtTime(0.08, now);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(now);
        bassOsc.stop(now + 1.25);
      }
    } catch {}
  }

  // --- UI SCI-FI SFX METHODS ---

  public playHover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.03);

      gain.gain.setValueAtTime(0.008, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  public playOrbitTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.025);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  public playSelect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.03);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  public playChime(freq = 700, duration = 0.1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  public playLaunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }
}

export const soundManager = new SoundSynthesizer();
