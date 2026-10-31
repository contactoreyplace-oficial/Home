import React, { useState } from 'react';
import { SystemPortal } from '../types/system';
import { SystemIcon } from './SystemIcon';
import { Radio, Activity, ExternalLink, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface RadarViewProps {
  systems: SystemPortal[];
  onSelectSystem: (system: SystemPortal) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ systems, onSelectSystem }) => {
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  const activeSystem = systems.find((s) => s.id === activeHoverId);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 z-20 relative flex flex-col lg:flex-row items-center gap-6">
      {/* Radar Display Container */}
      <div className="relative w-[340px] sm:w-[460px] md:w-[500px] aspect-square rounded-full glass-panel border border-[#71c4bd]/40 flex items-center justify-center overflow-hidden p-6 shadow-[0_0_50px_rgba(35,141,154,0.2)]">
        {/* Radar concentric distance rings */}
        <div className="absolute inset-8 rounded-full border border-[#89e0d6]/20 pointer-events-none" />
        <div className="absolute inset-20 rounded-full border border-[#89e0d6]/15 pointer-events-none" />
        <div className="absolute inset-36 rounded-full border border-[#89e0d6]/10 pointer-events-none" />

        {/* Crosshair lines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-[#89e0d6]/20 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-[#89e0d6]/20 pointer-events-none" />

        {/* Sweeping Radar Scanner Line */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, rgba(118, 251, 229, 0.25) 0deg, rgba(118, 251, 229, 0) 60deg, transparent 60deg)',
            animation: 'radarSweep 5s linear infinite'
          }}
        />

        {/* Central Core Indicator */}
        <div className="relative z-10 w-12 h-12 rounded-full bg-[#102d35] border-2 border-[#76fbe5] flex items-center justify-center shadow-[0_0_20px_rgba(118,251,229,0.5)]">
          <Radio className="w-5 h-5 text-[#76fbe5]" />
        </div>

        {/* 12 Radar System Nodes positioned radially */}
        {systems.map((sys, idx) => {
          const angle = (idx / systems.length) * Math.PI * 2;
          // Distance varies slightly based on latency or index to create cosmic distribution
          const distancePercent = 32 + (idx % 3) * 11;
          const leftPercent = 50 + Math.cos(angle) * distancePercent;
          const topPercent = 50 + Math.sin(angle) * distancePercent;

          const isHovered = activeHoverId === sys.id;

          return (
            <button
              key={sys.id}
              type="button"
              onMouseEnter={() => {
                soundManager.playHover();
                setActiveHoverId(sys.id);
              }}
              onClick={() => {
                soundManager.playSelect();
                onSelectSystem(sys);
              }}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute z-20 flex items-center justify-center rounded-full p-2 transition-all duration-200 ${
                isHovered
                  ? 'scale-125 bg-[#76fbe5] text-[#05171d] shadow-[0_0_25px_#76fbe5] border-2 border-white'
                  : 'bg-[#0d2730] text-[#9df9e7] border border-[#71c4bd]/50 hover:border-[#76fbe5]'
              }`}
              title={`${sys.name} (${sys.latencyMs}ms)`}
            >
              <SystemIcon name={sys.icon} className="w-4 h-4" />
              <span className="sr-only">{sys.name}</span>
            </button>
          );
        })}
      </div>

      {/* Side Telemetry Inspection Card */}
      <div className="w-full lg:w-[380px] glass-panel rounded-2xl p-5 border border-[#89e0d6]/30">
        <div className="flex items-center justify-between border-b border-[#89e0d6]/20 pb-3 mb-4">
          <span className="font-mono text-xs text-[#8eddd3] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#76fbe5]" />
            Radar Telemetría
          </span>
          <span className="text-[10px] font-mono text-[#34d399] px-2 py-0.5 rounded-full bg-[#064e3b]/40 border border-[#34d399]/30">
            ESCANEO ACTIVO
          </span>
        </div>

        {activeSystem ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl bg-[#081a20] border text-[#76fbe5]"
                style={{ borderColor: activeSystem.accentColor }}
              >
                <SystemIcon name={activeSystem.icon} className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#8eddd3]">
                  NODO #{String(activeSystem.index).padStart(2, '0')} · {activeSystem.category}
                </span>
                <h3 className="text-base font-bold text-white">
                  {activeSystem.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#c5deda] leading-relaxed">
              {activeSystem.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
              <div className="p-2 rounded-lg bg-[#07161c] border border-[#55777a]/30">
                <span className="text-[9px] text-[#8aa8a6] uppercase block">Latencia Enlace</span>
                <span className="text-[#34d399] font-bold">{activeSystem.latencyMs} ms</span>
              </div>
              <div className="p-2 rounded-lg bg-[#07161c] border border-[#55777a]/30">
                <span className="text-[9px] text-[#8aa8a6] uppercase block">Disponibilidad</span>
                <span className="text-[#76fbe5] font-bold">{activeSystem.metrics.uptime}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#07161c] border border-[#55777a]/30">
                <span className="text-[9px] text-[#8aa8a6] uppercase block">Región</span>
                <span className="text-white">{activeSystem.metrics.region}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#07161c] border border-[#55777a]/30">
                <span className="text-[9px] text-[#8aa8a6] uppercase block">Carga de Trabajo</span>
                <span className="text-[#f59e0b] font-bold">{activeSystem.metrics.load}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectSystem(activeSystem)}
              className="w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#76fbe5] hover:bg-[#9df9e7] text-[#05171d] flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(118,251,229,0.3)] transition-all"
            >
              Inspeccionar y Abrir Destino
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-center py-12 text-xs font-mono text-[#8aa8a6]">
            Pasa el cursor sobre un nodo del radar para inspeccionar telemetría o pulsa para seleccionarlo.
          </div>
        )}
      </div>

      <style>{`
        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
