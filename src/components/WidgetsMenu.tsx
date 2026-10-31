import React, { useState } from 'react';
import { Layers, Film, Radio, Music, CloudSun, Newspaper, X, Check, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface WidgetsMenuProps {
  showMediaStrip: boolean;
  onToggleMediaStrip: () => void;
  showScanLog: boolean;
  onToggleScanLog: () => void;
  showAudioPlayer: boolean;
  onToggleAudioPlayer: () => void;
  showTelemetry: boolean;
  onToggleTelemetry: () => void;
  showNewsShowcase: boolean;
  onToggleNewsShowcase: () => void;
  widgetOpacity?: number;
}

export const WidgetsMenu: React.FC<WidgetsMenuProps> = ({
  showMediaStrip,
  onToggleMediaStrip,
  showScanLog,
  onToggleScanLog,
  showAudioPlayer,
  onToggleAudioPlayer,
  showTelemetry,
  onToggleTelemetry,
  showNewsShowcase,
  onToggleNewsShowcase,
  widgetOpacity = 0.45
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const activeCount = [
    showMediaStrip,
    showScanLog,
    showAudioPlayer,
    showTelemetry,
    showNewsShowcase
  ].filter(Boolean).length;

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-auto">
      {/* Expanded Menu Popover (Flutter / Originkit / Apple Action Sheet style) */}
      {isOpen && (
        <div
          className="absolute bottom-16 left-0 w-72 rounded-3xl apple-glass p-4 shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[#00f0ff]/40 animate-slideInUp z-50"
          style={{
            backgroundColor: `rgba(4, 16, 24, ${Math.max(0.85, widgetOpacity)})`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#71c4bd]/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                  Centro de Widgets
                </h3>
                <span className="text-[10px] text-[#71c4bd] font-mono">
                  {activeCount} de 5 activos en pantalla
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playOrbitTick();
                setIsOpen(false);
              }}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-[#a8cbc7] hover:text-white transition-colors"
              title="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Widget Toggle Options */}
          <div className="space-y-2">
            {/* Tira Multimedia */}
            <button
              onClick={() => {
                soundManager.playSelect();
                onToggleMediaStrip();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                showMediaStrip
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff]/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 border-white/10 text-[#a8cbc7] hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Film className={`w-4 h-4 ${showMediaStrip ? 'text-[#00f0ff]' : 'text-[#71c4bd]'}`} />
                <div className="text-left">
                  <span className="text-xs font-bold block">Tira Multimedia 4K</span>
                  <span className="text-[9px] text-[#71c4bd] font-mono">SVG, Videos & Imágenes</span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  showMediaStrip ? 'bg-[#00f0ff] border-[#00f0ff] text-black' : 'border-white/20 bg-transparent'
                }`}
              >
                {showMediaStrip && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Scan Log */}
            <button
              onClick={() => {
                soundManager.playSelect();
                onToggleScanLog();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                showScanLog
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff]/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 border-white/10 text-[#a8cbc7] hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className={`w-4 h-4 ${showScanLog ? 'text-[#00f0ff]' : 'text-[#71c4bd]'}`} />
                <div className="text-left">
                  <span className="text-xs font-bold block">Scan Log Telemetría</span>
                  <span className="text-[9px] text-[#71c4bd] font-mono">Consola de red en vivo</span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  showScanLog ? 'bg-[#00f0ff] border-[#00f0ff] text-black' : 'border-white/20 bg-transparent'
                }`}
              >
                {showScanLog && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Audio Player */}
            <button
              onClick={() => {
                soundManager.playSelect();
                onToggleAudioPlayer();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                showAudioPlayer
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff]/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 border-white/10 text-[#a8cbc7] hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Music className={`w-4 h-4 ${showAudioPlayer ? 'text-[#00f0ff]' : 'text-[#71c4bd]'}`} />
                <div className="text-left">
                  <span className="text-xs font-bold block">Soundscape & Audio</span>
                  <span className="text-[9px] text-[#71c4bd] font-mono">Ambiente espacial</span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  showAudioPlayer ? 'bg-[#00f0ff] border-[#00f0ff] text-black' : 'border-white/20 bg-transparent'
                }`}
              >
                {showAudioPlayer && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Telemetría Local */}
            <button
              onClick={() => {
                soundManager.playSelect();
                onToggleTelemetry();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                showTelemetry
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff]/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 border-white/10 text-[#a8cbc7] hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CloudSun className={`w-4 h-4 ${showTelemetry ? 'text-[#00f0ff]' : 'text-[#71c4bd]'}`} />
                <div className="text-left">
                  <span className="text-xs font-bold block">Telemetría GPS & Clima</span>
                  <span className="text-[9px] text-[#71c4bd] font-mono">Ubicación y ambiente</span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  showTelemetry ? 'bg-[#00f0ff] border-[#00f0ff] text-black' : 'border-white/20 bg-transparent'
                }`}
              >
                {showTelemetry && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Pasarela Novedades */}
            <button
              onClick={() => {
                soundManager.playSelect();
                onToggleNewsShowcase();
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                showNewsShowcase
                  ? 'bg-[#00f0ff]/15 border-[#00f0ff]/50 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 border-white/10 text-[#a8cbc7] hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Newspaper className={`w-4 h-4 ${showNewsShowcase ? 'text-[#00f0ff]' : 'text-[#71c4bd]'}`} />
                <div className="text-left">
                  <span className="text-xs font-bold block">Pasarela de Novedades</span>
                  <span className="text-[9px] text-[#71c4bd] font-mono">Actualizaciones del sistema</span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  showNewsShowcase ? 'bg-[#00f0ff] border-[#00f0ff] text-black' : 'border-white/20 bg-transparent'
                }`}
              >
                {showNewsShowcase && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating Menu Trigger Button (Apple / Flutter FAB Style) */}
      <button
        onClick={() => {
          soundManager.playSelect();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full apple-button shadow-[0_10px_30px_rgba(0,240,255,0.35)] hover:scale-105 transition-all duration-200 group"
        title="Abrir menú flotante de widgets"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
        <Layers className="w-4 h-4 text-[#00f0ff] group-hover:rotate-45 transition-transform" />
        <span className="font-mono text-xs font-bold text-white tracking-wider">
          Widgets ({activeCount})
        </span>
        <span className="text-[10px] text-[#71c4bd] font-mono">
          {isOpen ? '▴' : '▾'}
        </span>
      </button>
    </div>
  );
};
