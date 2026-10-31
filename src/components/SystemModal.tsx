import React, { useState } from 'react';
import { SystemPortal } from '../types/system';
import { SystemIcon } from './SystemIcon';
import {
  X,
  ExternalLink,
  Activity,
  CheckCircle2,
  Clock,
  Server,
  Share2,
  ShieldCheck,
  Edit3,
  Copy,
  Check
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SystemModalProps {
  system: SystemPortal | null;
  onClose: () => void;
  onEditSystem: (system: SystemPortal) => void;
  onTriggerLaunchSequence?: (system: SystemPortal) => void;
}

export const SystemModal: React.FC<SystemModalProps> = ({
  system,
  onClose,
  onEditSystem,
  onTriggerLaunchSequence
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [currentPing, setCurrentPing] = useState<number | null>(null);

  if (!system) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(system.url);
    setIsCopied(true);
    soundManager.playChime(880, 0.05);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTestPing = () => {
    setIsPinging(true);
    soundManager.playOrbitTick();
    setTimeout(() => {
      const simulated = Math.floor(system.latencyMs + (Math.random() * 8 - 4));
      setCurrentPing(Math.max(8, simulated));
      setIsPinging(false);
      soundManager.playChime(950, 0.08);
    }, 400);
  };

  const handleLaunch = () => {
    if (onTriggerLaunchSequence) {
      onClose();
      onTriggerLaunchSequence(system);
      return;
    }
    soundManager.playLaunch();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#76fbe5', '#38bdf8', '#34d399', '#ffffff']
      });
    } catch {}
    window.open(system.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02080d]/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-system-title"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl border border-[#76fbe5]/40 shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Glowing Header Banner */}
        <div className="relative p-6 pb-4 border-b border-[#71c4bd]/25 bg-gradient-to-r from-[#12363f]/80 to-[#071923]/90">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-2xl bg-[#092027] border-2 text-[#76fbe5] shadow-[0_0_20px_rgba(118,251,229,0.25)]"
                style={{ borderColor: system.accentColor }}
              >
                <SystemIcon name={system.icon} className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#8eddd3] uppercase tracking-widest block">
                  SISTEMA ORBITAL #{String(system.index).padStart(2, '0')}
                </span>
                <h2 id="modal-system-title" className="text-xl font-bold text-white">
                  {system.name}
                </h2>
                <p className="text-xs text-[#9df9e7] font-medium">
                  {system.tagline}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playHover();
                onClose();
              }}
              className="p-1.5 rounded-full bg-[#0d2831] hover:bg-[#184451] text-[#a8cbc7] hover:text-white transition-colors border border-[#71c4bd]/30"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-[#c5deda]">
          {/* Description */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#8eddd3] mb-1">
              Descripción del Sistema
            </h4>
            <p className="text-[13px] leading-relaxed text-[#e2f5f1]">
              {system.description}
            </p>
          </div>

          {/* URL Bar */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-[#8eddd3] mb-1">
              Punto de Enlace / URL
            </h4>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#07161c] border border-[#55777a]/40 font-mono text-xs">
              <span className="truncate text-[#9df9e7] mr-2 select-all">
                {system.url}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#0d2d37] hover:bg-[#164452] text-[#76fbe5] transition-colors shrink-0"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-[#34d399]" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Telemetry & Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-[#07161c] border border-[#55777a]/30">
              <span className="text-[9px] text-[#8aa8a6] uppercase block">Latencia</span>
              <span className="text-sm font-bold text-[#34d399]">
                {currentPing !== null ? `${currentPing} ms` : `${system.latencyMs} ms`}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#07161c] border border-[#55777a]/30">
              <span className="text-[9px] text-[#8aa8a6] uppercase block">Uptime</span>
              <span className="text-sm font-bold text-[#76fbe5]">{system.metrics.uptime}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#07161c] border border-[#55777a]/30">
              <span className="text-[9px] text-[#8aa8a6] uppercase block">Versión</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{system.metrics.version}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#07161c] border border-[#55777a]/30">
              <span className="text-[9px] text-[#8aa8a6] uppercase block">Región</span>
              <span className="text-xs font-bold text-[#9df9e7] mt-0.5 block truncate">{system.metrics.region}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] text-[#8eddd3] mr-1">Etiquetas:</span>
            {system.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-[#0b2028] text-[#9df9e7] border border-[#4a7275]/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-2 border-t border-[#71c4bd]/20 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleTestPing}
            disabled={isPinging}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#71c4bd]/40 bg-[#0d2a33] hover:bg-[#174654] text-[#9df9e7] font-mono text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            {isPinging ? 'Calculando...' : 'Test de Enlace'}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEditSystem(system);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#71c4bd]/40 bg-[#0d2a33] hover:bg-[#174654] text-[#9df9e7] font-mono text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Datos
          </button>

          <button
            type="button"
            onClick={handleLaunch}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-xs bg-[#76fbe5] hover:bg-[#9df9e7] text-[#05171d] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(118,251,229,0.4)] transition-all active:scale-98"
          >
            <span>Acceder al Sistema</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
