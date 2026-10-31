import React, { useState } from 'react';
import { ViewMode, PlanetTheme } from '../types/system';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Compass,
  LayoutGrid,
  Radio,
  Terminal,
  ChevronDown,
  ChevronUp,
  Settings,
  Moon,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ControlDockProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  planetTheme: PlanetTheme;
  onThemeChange: (theme: PlanetTheme) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onOpenSettings: () => void;
  isDeepSpace: boolean;
  onToggleDeepSpace: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  viewMode,
  onViewModeChange,
  planetTheme,
  onThemeChange,
  isPaused,
  onTogglePause,
  speed,
  onSpeedChange,
  onOpenSettings,
  isDeepSpace,
  onToggleDeepSpace
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  return (
    <div
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-[94vw] sm:max-w-3xl transition-transform duration-300 ease-out"
      style={{
        transform: isCollapsed ? 'translate(-50%, calc(100% - 24px))' : 'translate(-50%, 0)'
      }}
    >
      {/* Collapse Toggle Handle */}
      <div className="flex justify-center -mb-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playOrbitTick();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-xl bg-[#0c262e]/80 border-t border-x border-[#71c4bd]/30 text-[#a8cbc7] hover:text-[#76fbe5] text-[10px] font-mono shadow-md backdrop-blur-md transition-colors"
          title="Alternar visibilidad del panel de control (H)"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Mostrar Controles</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Modo Cine (Ocultar)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Ultra-Transparent Glassmorphic Dock Container */}
      <div className="bg-[#030a10]/65 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 border border-[#71c4bd]/25 shadow-[0_12px_45px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
          {/* View Modes */}
          <div className="flex items-center bg-[#05141b]/60 p-1 rounded-xl border border-[#4a7275]/25 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                soundManager.playOrbitTick();
                onViewModeChange('orbit');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'orbit'
                  ? 'bg-[#76fbe5] text-[#05171d] font-bold shadow-[0_0_12px_rgba(118,251,229,0.3)]'
                  : 'text-[#a8cbc7] hover:text-white'
              }`}
              title="Vista Órbita 3D interactiva"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Órbita 3D</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playOrbitTick();
                onViewModeChange('matrix');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'matrix'
                  ? 'bg-[#76fbe5] text-[#05171d] font-bold shadow-[0_0_12px_rgba(118,251,229,0.3)]'
                  : 'text-[#a8cbc7] hover:text-white'
              }`}
              title="Matriz de Sistemas y Búsqueda"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Matriz</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playOrbitTick();
                onViewModeChange('radar');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'radar'
                  ? 'bg-[#76fbe5] text-[#05171d] font-bold shadow-[0_0_12px_rgba(118,251,229,0.3)]'
                  : 'text-[#a8cbc7] hover:text-white'
              }`}
              title="Radar Celestial"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Radar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playOrbitTick();
                onViewModeChange('terminal');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'terminal'
                  ? 'bg-[#76fbe5] text-[#05171d] font-bold shadow-[0_0_12px_rgba(118,251,229,0.3)]'
                  : 'text-[#a8cbc7] hover:text-white'
              }`}
              title="Terminal de Comandos"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Terminal</span>
            </button>
          </div>

          {/* Quick Actions (Pause, Audio, Themes, Settings) */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Play/Pause Orbit */}
            <button
              type="button"
              onClick={() => {
                soundManager.playOrbitTick();
                onTogglePause();
              }}
              className={`p-2 rounded-xl border text-xs font-mono transition-colors ${
                isPaused
                  ? 'border-[#f59e0b]/50 bg-[#2b200b]/80 text-[#fcd34d]'
                  : 'border-[#71c4bd]/25 bg-[#05141b]/60 text-[#76fbe5] hover:bg-[#12363f]'
              }`}
              title={isPaused ? 'Reanudar rotación orbital' : 'Pausar rotación orbital'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border text-xs font-mono transition-colors ${
                isMuted
                  ? 'border-[#f43f5e]/40 bg-[#270e13]/80 text-[#fda4af]'
                  : 'border-[#71c4bd]/25 bg-[#05141b]/60 text-[#76fbe5] hover:bg-[#12363f]'
              }`}
              title={isMuted ? 'Activar efectos de audio sintetizados' : 'Silenciar audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Deep Space Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                soundManager.playSelect();
                onToggleDeepSpace();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all ${
                isDeepSpace
                  ? 'bg-[#00f0ff] text-black font-bold border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.5)]'
                  : 'border-[#71c4bd]/30 bg-[#05141b]/60 text-[#76fbe5] hover:bg-[#12363f]'
              }`}
              title={isDeepSpace ? 'Desactivar Modo Espacio Profundo (Baja Luz)' : 'Activar Modo Espacio Profundo (Alto Contraste y Oscuridad Total)'}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deep Space</span>
            </button>

            {/* Planet Themes (Including Cyber-Industrial) */}
            <div className="hidden lg:flex items-center bg-[#05141b]/60 p-1 rounded-xl border border-[#4a7275]/25 backdrop-blur-md">
              {(
                [
                  { id: 'real-earth', label: 'Tierra Real (GPS)', color: '#10b981' },
                  { id: 'oceanic', label: 'Océano', color: '#5eead4' },
                  { id: 'cyber', label: 'Cyber', color: '#00f0ff' },
                  { id: 'cyber-industrial', label: 'Industrial', color: '#f59e0b' },
                  { id: 'nebula', label: 'Nebulosa', color: '#c084fc' },
                  { id: 'aurora', label: 'Aurora', color: '#34d399' }
                ] as const
              ).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    soundManager.playOrbitTick();
                    onThemeChange(th.id);
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all flex items-center gap-1 ${
                    planetTheme === th.id
                      ? 'bg-[#153e48] text-white font-bold border border-[#76fbe5]/40'
                      : 'text-[#8aa8a6] hover:text-white'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: th.color }}
                  />
                  <span>{th.label}</span>
                </button>
              ))}
            </div>

            {/* Configure Destinations Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playSelect();
                onOpenSettings();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f2d36]/80 hover:bg-[#184552] border border-[#71c4bd]/30 text-[#9df9e7] hover:text-white text-xs font-mono transition-all backdrop-blur-md"
              title="Configurar los 12 sistemas y URLs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Configurar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
