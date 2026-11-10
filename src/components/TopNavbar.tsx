import React from 'react';
import { Orbit, Settings, Sparkles, Move, Lock, Layers, EyeOff, Eye, Search, Command, Film, Globe } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { tacticalFeedback } from '../utils/tacticalFeedback';

interface TopNavbarProps {
  onOpenSettings: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  brandName?: string;
  brandSub?: string;
  brandSlogan?: string;
  brandLocation?: string;
  badge?: string;
  onOpenBrandModal?: () => void;
  draggableWidgets?: boolean;
  onToggleDraggableWidgets?: () => void;
  onResetWidgetPositions?: () => void;
  zenMode?: boolean;
  onToggleZenMode?: () => void;
  onOpenCommandPalette?: () => void;
  cinematicMode?: boolean;
  onToggleCinematicMode?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenSettings,
  isPaused,
  onTogglePause,
  brandName = 'REYPLACE.MX',
  brandSub = 'ECOSISTEMA DIGITAL',
  brandSlogan = 'CONECTAMOS · INNOVAMOS · TRANSFORMAMOS',
  brandLocation = 'LOS MOCHIS, SINALOA, MÉXICO',
  badge = 'PORTAL 3D',
  onOpenBrandModal,
  draggableWidgets = false,
  onToggleDraggableWidgets,
  onResetWidgetPositions,
  zenMode = false,
  onToggleZenMode,
  onOpenCommandPalette,
  cinematicMode = true,
  onToggleCinematicMode
}) => {
  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-2.5 sm:py-3.5 pointer-events-auto border-b border-[#71c4bd]/10 bg-[#030d14]/60 backdrop-blur-md">
      {/* Brand Identity & Crown Insignia */}
      <div className="flex items-center gap-3">
        <BrandLogo size="md" onClick={onOpenBrandModal} />

        <div
          onClick={onOpenBrandModal}
          className="cursor-pointer group flex flex-col justify-center"
          title="Ver identidad de marca REYPLACE.MX"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm sm:text-base tracking-[0.24em] bg-clip-text text-transparent bg-gradient-to-r from-white via-[#a5e6df] to-[#00f0ff] uppercase group-hover:brightness-125 transition-all">
              {brandName}
            </span>
            <span className="hidden xs:inline-block font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#064e3b]/80 border border-[#34d399]/40 text-[#34d399] font-bold">
              {badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#71c4bd] tracking-wider font-semibold">
              {brandSub}
            </span>
            <span className="hidden md:inline-block font-mono text-[9px] text-[#a5e6df]/70">
              • {brandSlogan}
            </span>
          </div>
        </div>
      </div>

      {/* Top right quick actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Command Palette Quick Search Button */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={() => {
              tacticalFeedback.trigger('light', 'subtle');
              onOpenCommandPalette();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[#0c2a33]/80 hover:bg-[#123e4b] text-[#edfffb] font-mono text-xs transition-all shadow-sm hover:border-[#00f0ff]/70 hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            title="Abrir Command Palette (Ctrl+K o Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden md:inline text-xs text-gray-300">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-300 border border-white/10">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        )}

        {/* Cinematic Video vs 3D Interactive Planet Mode */}
        {onToggleCinematicMode && (
          <button
            type="button"
            onClick={() => {
              soundManager.playSelect();
              tacticalFeedback.trigger('medium', 'subtle');
              onToggleCinematicMode();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all shadow-md border ${
              cinematicMode
                ? 'bg-[#00f0ff] text-black font-extrabold border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                : 'bg-[#071d27]/90 text-[#a5e6df] border-[#71c4bd]/40 hover:text-white hover:border-[#00f0ff]/60'
            }`}
            title="Cambiar entre Video Cinemático 4K y 3D Interactivo"
          >
            {cinematicMode ? (
              <>
                <Film className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modo Video</span>
                <span className="sm:hidden">Video</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modo 3D</span>
                <span className="sm:hidden">3D</span>
              </>
            )}
          </button>
        )}

        {/* Super PWA Install Button */}
        <PWAInstallButton />

        {/* Zen Mode / Ocultar Widgets Toggle */}
        {onToggleZenMode && (
          <button
            type="button"
            onClick={() => {
              soundManager.playOrbitTick();
              onToggleZenMode();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs transition-all backdrop-blur-md shadow-md ${
              zenMode
                ? 'bg-[#00f0ff] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'border border-[#71c4bd]/40 bg-[#10272c]/80 text-[#edfffb] hover:bg-[#1a444c]'
            }`}
            title="Ocultar todos los widgets para despejar el espacio 3D y el planeta (Tecla Z)"
          >
            {zenMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Widgets</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span className="hidden sm:inline">Ocultar Widgets</span>
                <span className="sm:hidden">Ocultar</span>
              </>
            )}
          </button>
        )}

        {/* Widgets Movibles / Fijos Toggle */}
        {onToggleDraggableWidgets && !zenMode && (
          <div className="hidden sm:flex items-center gap-1 bg-[#09222c]/90 p-1 rounded-full border border-[#71c4bd]/30">
            <button
              type="button"
              onClick={() => {
                soundManager.playSelect();
                onToggleDraggableWidgets();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs transition-all ${
                draggableWidgets
                  ? 'bg-[#00f0ff] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-[#edfffb] hover:bg-[#153b45]'
              }`}
              title={
                draggableWidgets
                  ? 'Modo widgets movibles activo (puedes arrastrarlos libremente)'
                  : 'Widgets fijos en su posición estática'
              }
            >
              {draggableWidgets ? (
                <>
                  <Move className="w-3.5 h-3.5" />
                  <span>Móviles</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#71c4bd]" />
                  <span>Fijos</span>
                </>
              )}
            </button>

            {draggableWidgets && onResetWidgetPositions && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playOrbitTick();
                  onResetWidgetPositions();
                }}
                className="px-2 py-0.5 rounded-full font-mono text-[10px] text-[#00f0ff] hover:bg-white/10"
                title="Restablecer posición inicial de todos los widgets"
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Orbit Pause/Play Toggle */}
        <button
          type="button"
          onClick={() => {
            soundManager.playOrbitTick();
            onTogglePause();
          }}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#648986]/40 bg-[#10272c]/80 text-[#edfffb] font-mono text-xs hover:bg-[#23504f] transition-all backdrop-blur-md"
        >
          <Orbit className={`w-3.5 h-3.5 text-[#00f0ff] ${isPaused ? '' : 'animate-spin'}`} style={{ animationDuration: '12s' }} />
          <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
        </button>

        {/* Full Settings Drawer Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playSelect();
            onOpenSettings();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#00f0ff]/40 bg-[#0c2a33] text-[#edfffb] font-mono text-xs hover:bg-[#184654] transition-all backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]"
        >
          <Settings className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span className="font-semibold hidden sm:inline">Configuración</span>
        </button>
      </div>
    </header>
  );
};
