import React, { useState, useEffect } from 'react';
import {
  AudioMode,
  PlanetTheme,
  HarmonicFrequencyMode,
  HARMONIC_FREQUENCIES,
  REYPLACE_MUSIC_PLAYLIST
} from '../types/system';
import { soundManager } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Sparkles,
  Globe,
  Waves
} from 'lucide-react';

interface AudioPlayerWidgetProps {
  currentTheme: PlanetTheme;
  audioMode: AudioMode;
  onAudioModeChange: (mode: AudioMode) => void;
  widgetOpacity?: number;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  currentTheme,
  audioMode,
  onAudioModeChange,
  widgetOpacity = 0.45
}) => {
  const [isPlaying, setIsPlaying] = useState(soundManager.getIsMusicPlaying());
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [track, setTrack] = useState(soundManager.getCurrentTrack());
  const [freqMode, setFreqMode] = useState<HarmonicFrequencyMode>(soundManager.getHarmonicFrequencyMode());
  const [isExpanded, setIsExpanded] = useState(true);
  const [waveHeights, setWaveHeights] = useState<number[]>([40, 65, 30, 85, 50, 75, 45, 90]);

  const activeFreqInfo = HARMONIC_FREQUENCIES.find((f) => f.id === freqMode) || HARMONIC_FREQUENCIES[0];

  // Live visualizer simulation / frequency data
  useEffect(() => {
    let animId: number;

    const updateWave = () => {
      const data = soundManager.getAnalyserData();
      if (data && !isMuted) {
        const heights = [
          Math.min(100, Math.max(15, (data[0] || 40) / 2.5)),
          Math.min(100, Math.max(15, (data[2] || 65) / 2.5)),
          Math.min(100, Math.max(15, (data[4] || 30) / 2.5)),
          Math.min(100, Math.max(15, (data[6] || 85) / 2.5)),
          Math.min(100, Math.max(15, (data[8] || 50) / 2.5)),
          Math.min(100, Math.max(15, (data[10] || 75) / 2.5)),
          Math.min(100, Math.max(15, (data[12] || 45) / 2.5)),
          Math.min(100, Math.max(15, (data[14] || 90) / 2.5))
        ];
        setWaveHeights(heights);
      } else if (!isMuted) {
        const t = performance.now() * 0.004;
        setWaveHeights([
          25 + Math.sin(t) * 15,
          45 + Math.cos(t * 1.3) * 20,
          20 + Math.sin(t * 0.9) * 12,
          65 + Math.sin(t * 1.6) * 25,
          35 + Math.cos(t * 1.1) * 18,
          50 + Math.sin(t * 1.2) * 22,
          30 + Math.cos(t * 1.5) * 15,
          40 + Math.sin(t * 0.8) * 18
        ]);
      } else {
        setWaveHeights([8, 8, 8, 8, 8, 8, 8, 8]);
      }
      animId = requestAnimationFrame(updateWave);
    };

    animId = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isMuted, audioMode]);

  const handleTogglePlay = () => {
    soundManager.initContext();
    if (audioMode === 'music-player') {
      if (isPlaying) {
        soundManager.pauseMusic();
        setIsPlaying(false);
      } else {
        soundManager.resumeMusic();
        setIsPlaying(true);
      }
    } else if (audioMode === 'frequencies') {
      if (soundManager.getIsFrequencyRunning()) {
        soundManager.stopHarmonicFrequency();
      } else {
        soundManager.startHarmonicFrequency(freqMode);
      }
    } else {
      if (isMuted) {
        soundManager.toggleMute();
        setIsMuted(false);
      } else {
        soundManager.boostInteractionActivity();
      }
    }
  };

  const handleSelectFrequency = (mode: HarmonicFrequencyMode) => {
    soundManager.playOrbitTick();
    setFreqMode(mode);
    onAudioModeChange('frequencies');
    soundManager.setAudioMode('frequencies');
    soundManager.startHarmonicFrequency(mode);
    setIsMuted(false);
  };

  const handleToggleMute = () => {
    const nextMute = soundManager.toggleMute();
    setIsMuted(nextMute);
  };

  return (
    <div
      className="w-[280px] sm:w-[320px] pointer-events-auto select-none"
      aria-label="Paisaje Sonoro y Frecuencias Reales de la Tierra"
    >
      <div
        className="rounded-2xl border border-[#71c4bd]/30 shadow-[0_8px_32px_rgba(0,0,0,0.65)] backdrop-blur-xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: `rgba(4, 16, 24, ${Math.max(0.4, widgetOpacity)})`
        }}
      >
        {/* Header Bar */}
        <div className="px-3.5 py-2 border-b border-[#71c4bd]/20 flex items-center justify-between bg-[#061822]/80">
          <div className="flex items-center gap-1.5">
            {audioMode === 'frequencies' ? (
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : audioMode === 'music-player' ? (
              <Music className="w-3.5 h-3.5 text-[#00f0ff]" />
            ) : (
              <Waves className="w-3.5 h-3.5 text-[#38bdf8]" />
            )}
            <span className="font-mono text-[9px] uppercase tracking-widest text-white font-bold">
              {audioMode === 'frequencies'
                ? 'FRECUENCIAS REALES'
                : audioMode === 'music-player'
                ? 'MÚSICA REYPLACE'
                : 'PAISAJE SONORO 3D'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#a8cbc7] hover:text-white transition-colors p-0.5"
              title={isExpanded ? 'Contraer reproductor' : 'Expandir reproductor'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#71c4bd]/15 bg-[#05131b] p-1 font-mono text-[9px] gap-1">
          <button
            onClick={() => {
              soundManager.playOrbitTick();
              onAudioModeChange('frequencies');
              soundManager.setAudioMode('frequencies');
              soundManager.startHarmonicFrequency(freqMode);
              setIsMuted(false);
            }}
            className={`flex-1 py-1 rounded-md text-center transition-all ${
              audioMode === 'frequencies'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-[#8aa8a6] hover:text-white'
            }`}
          >
            Frecuencias
          </button>

          <button
            onClick={() => {
              soundManager.playOrbitTick();
              onAudioModeChange('soundscape');
              soundManager.setAudioMode('soundscape');
            }}
            className={`flex-1 py-1 rounded-md text-center transition-all ${
              audioMode === 'soundscape'
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 font-bold'
                : 'text-[#8aa8a6] hover:text-white'
            }`}
          >
            Espacial 3D
          </button>

          <button
            onClick={() => {
              soundManager.playOrbitTick();
              onAudioModeChange('music-player');
              soundManager.setAudioMode('music-player');
              setIsPlaying(true);
            }}
            className={`flex-1 py-1 rounded-md text-center transition-all ${
              audioMode === 'music-player'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-[#8aa8a6] hover:text-white'
            }`}
          >
            Música
          </button>
        </div>

        {/* Content Body */}
        {isExpanded && (
          <div className="p-3 space-y-2.5">
            {/* 1. FREQUENCIES MODE */}
            {audioMode === 'frequencies' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-black text-white">
                      {activeFreqInfo.frequencyHz} Hz
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                      EN VIVO
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-[#71c4bd]">
                    {activeFreqInfo.effect}
                  </span>
                </div>

                {/* 4 Real Physical Frequencies Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {HARMONIC_FREQUENCIES.map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => handleSelectFrequency(freq.id)}
                      className={`p-1.5 rounded-xl border text-left transition-all ${
                        freqMode === freq.id
                          ? 'border-[#00f0ff] bg-[#00f0ff]/15 shadow-[0_0_12px_rgba(0,240,255,0.3)] text-white'
                          : 'border-[#71c4bd]/20 bg-[#06161f] text-[#8aa8a6] hover:border-[#71c4bd]/50'
                      }`}
                      title={freq.description}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] font-bold">
                        <span style={{ color: freq.color }}>{freq.frequencyHz} Hz</span>
                        {freqMode === freq.id && <Sparkles className="w-2.5 h-2.5 text-[#00f0ff]" />}
                      </div>
                      <span className="text-[9px] block text-white/90 truncate font-semibold">
                        {freq.name}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-[#c7e5df] leading-tight pt-1 border-t border-[#71c4bd]/15">
                  {activeFreqInfo.description}
                </p>
              </div>
            )}

            {/* 2. SPATIAL SOUNDSCAPE MODE */}
            {audioMode === 'soundscape' && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[9px] text-[#38bdf8] uppercase tracking-wider">
                    PLANETA: {currentTheme.toUpperCase()}
                  </span>
                  <span className="font-mono text-[9px] text-emerald-400 font-bold">
                    PANNING 3D ACTIVO
                  </span>
                </div>
                <p className="text-[11px] text-[#e2f5f1] leading-tight">
                  Paisaje atmosférico con resonancia acústica dependiente de la posición orbital y tema planetario.
                </p>
              </div>
            )}

            {/* 3. MUSIC PLAYER MODE */}
            {audioMode === 'music-player' && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[9px] text-[#00f0ff] uppercase tracking-wider truncate">
                    {track.genre}
                  </span>
                  <span className="font-mono text-[9px] text-[#8aa8a6]">
                    {track.bpm} BPM
                  </span>
                </div>
                <h5 className="font-bold text-xs text-white truncate">{track.title}</h5>
                <p className="font-mono text-[10px] text-[#71c4bd] truncate">{track.artist}</p>
              </div>
            )}

            {/* Live Interactive Oscilloscope Waveform Display */}
            <div className="h-6 flex items-center justify-between gap-1 px-1.5 bg-[#030d14] rounded-lg border border-[#71c4bd]/20">
              {waveHeights.map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${h}%`,
                    backgroundColor:
                      audioMode === 'frequencies' ? activeFreqInfo.color : audioMode === 'music-player' ? '#a855f7' : '#00f0ff'
                  }}
                />
              ))}
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleToggleMute}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isMuted
                    ? 'border-[#f43f5e]/40 bg-[#270e13] text-[#fda4af]'
                    : 'border-[#71c4bd]/30 bg-[#071922] text-[#00f0ff] hover:bg-[#12363f]'
                }`}
                title={isMuted ? 'Activar audio' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {audioMode === 'music-player' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      soundManager.playOrbitTick();
                      soundManager.prevTrack();
                      setTrack(soundManager.getCurrentTrack());
                      setIsPlaying(true);
                    }}
                    className="p-1 rounded-lg hover:bg-[#12363f] text-[#a8cbc7] hover:text-white transition-colors"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="p-1.5 rounded-xl bg-[#00f0ff] hover:bg-[#76fbe5] text-[#041117] transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playOrbitTick();
                      soundManager.nextTrack();
                      setTrack(soundManager.getCurrentTrack());
                      setIsPlaying(true);
                    }}
                    className="p-1 rounded-lg hover:bg-[#12363f] text-[#a8cbc7] hover:text-white transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {audioMode === 'frequencies' && (
                <button
                  onClick={handleTogglePlay}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold font-mono text-[10px] shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:brightness-110 transition-all"
                >
                  Sintonizar {activeFreqInfo.frequencyHz} Hz
                </button>
              )}

              {audioMode === 'soundscape' && (
                <button
                  onClick={handleTogglePlay}
                  className="px-2.5 py-1 rounded-lg bg-[#0d2a33] hover:bg-[#164352] border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] transition-colors"
                >
                  Pulsar Resonancia
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
