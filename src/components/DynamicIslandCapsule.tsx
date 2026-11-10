import React, { useState, useEffect } from 'react';
import { SystemPortal } from '../types/system';
import { MapPin, Activity, Radio, Sparkles, ChevronRight, Compass } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { tacticalFeedback } from '../utils/tacticalFeedback';

interface DynamicIslandCapsuleProps {
  hoveredSystem: SystemPortal | null;
  onOpenTelemetry?: () => void;
  onOpenNews?: () => void;
  onSelectSystem?: (system: SystemPortal) => void;
}

export const DynamicIslandCapsule: React.FC<DynamicIslandCapsuleProps> = ({
  hoveredSystem,
  onOpenTelemetry,
  onOpenNews,
  onSelectSystem
}) => {
  const [tickerIndex, setTickerIndex] = useState<number>(0);

  const tickerItems = [
    {
      icon: <Radio className="w-3 h-3 text-[#10b981] animate-pulse" />,
      text: '12 Sistemas en Línea · Latencia Global: 24ms',
      badge: '99.98% UPTIME',
      badgeColor: 'text-[#10b981] border-[#10b981]/40 bg-[#10b981]/15',
      action: onOpenTelemetry
    },
    {
      icon: <MapPin className="w-3 h-3 text-[#00f0ff]" />,
      text: 'Los Mochis, Sinaloa, MX · 24°C Despejado',
      badge: 'GPS ACTIVO',
      badgeColor: 'text-[#00f0ff] border-[#00f0ff]/40 bg-[#00f0ff]/15',
      action: onOpenTelemetry
    },
    {
      icon: <Sparkles className="w-3 h-3 text-[#fbbf24]" />,
      text: 'Ecosistema 4K HD · Planeta Cinemático Activo',
      badge: 'NEXUS v5.2',
      badgeColor: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/15',
      action: onOpenNews
    },
    {
      icon: <Compass className="w-3 h-3 text-[#38bdf8]" />,
      text: 'Órbita Sincrónica 360° · Arrastra para girar',
      badge: '3D VIEW',
      badgeColor: 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#38bdf8]/15',
      action: undefined
    }
  ];

  useEffect(() => {
    if (hoveredSystem) return; // Freeze ticker while inspecting a system
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [hoveredSystem, tickerItems.length]);

  const currentItem = tickerItems[tickerIndex];

  return (
    <div className="pointer-events-auto flex justify-center z-30 transition-all duration-300">
      <div
        onClick={() => {
          if (hoveredSystem && onSelectSystem) {
            soundManager.playSelect();
            tacticalFeedback.trigger('medium', 'subtle');
            onSelectSystem(hoveredSystem);
          } else if (currentItem.action) {
            soundManager.playHover();
            tacticalFeedback.vibrate('tick');
            currentItem.action();
          }
        }}
        role="button"
        tabIndex={0}
        className={`group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] cursor-pointer select-none ${
          hoveredSystem
            ? 'bg-[#08222b]/95 border-[#00f0ff] ring-2 ring-[#00f0ff]/30 shadow-[0_0_25px_rgba(0,240,255,0.4)] scale-105'
            : 'bg-[#030d14]/75 border-[#71c4bd]/30 hover:border-[#00f0ff]/60 hover:bg-[#061b24]/90'
        }`}
      >
        {hoveredSystem ? (
          // Hovered System Live Focus State
          <>
            <span
              className="w-2 h-2 rounded-full shrink-0 animate-ping"
              style={{ backgroundColor: hoveredSystem.accentColor }}
            />
            <span className="font-mono text-[10px] text-[#8eddd3] font-bold tracking-wider uppercase">
              #{String(hoveredSystem.index).padStart(2, '0')}
            </span>
            <span className="font-bold text-xs text-white truncate max-w-[150px] sm:max-w-[220px]">
              {hoveredSystem.name}
            </span>
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full font-mono text-[8px] font-bold uppercase border"
              style={{
                backgroundColor: hoveredSystem.categoryTag?.bgColor || 'rgba(0,240,255,0.15)',
                color: hoveredSystem.categoryTag?.color || '#00f0ff',
                borderColor: hoveredSystem.categoryTag?.borderColor || 'rgba(0,240,255,0.4)'
              }}
            >
              {hoveredSystem.categoryTag?.shortLabel || hoveredSystem.category}
            </span>
            <span className="font-mono text-[10px] text-[#00f0ff] font-bold">
              {hoveredSystem.latencyMs}ms
            </span>
            <ChevronRight className="w-3 h-3 text-[#00f0ff] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </>
        ) : (
          // Idle Ambient Capsule Ticker
          <>
            <div className="shrink-0">{currentItem.icon}</div>
            <span className="font-mono text-[10px] sm:text-[11px] text-[#e0f7f4] tracking-tight truncate max-w-[220px] sm:max-w-[340px]">
              {currentItem.text}
            </span>
            <span
              className={`hidden sm:inline-flex items-center px-1.5 py-0.2 rounded-full font-mono text-[8px] font-bold uppercase border tracking-widest ${currentItem.badgeColor}`}
            >
              {currentItem.badge}
            </span>
            {currentItem.action && (
              <ChevronRight className="w-3 h-3 text-[#71c4bd] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            )}
          </>
        )}
      </div>
    </div>
  );
};
