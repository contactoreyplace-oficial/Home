import React, { useState, useEffect, useRef } from 'react';
import { SystemPortal } from '../types/system';
import { Radio, ChevronDown, ChevronUp } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ScanLogProps {
  hoveredSystem: SystemPortal | null;
  widgetOpacity?: number;
}

export const ScanLog: React.FC<ScanLogProps> = ({ hoveredSystem, widgetOpacity = 0.45 }) => {
  // Starts minimized to keep view unobstructed, expands on hover or click
  const [isMinimized, setIsMinimized] = useState(true);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const lineBufferRef = useRef<string[]>([]);
  const typingIndexRef = useRef<number>(0);

  // Auto-expand temporarily on system hover so telemetry is visible, collapse on leave
  useEffect(() => {
    let newLines: string[] = [];
    const timestamp = new Date().toISOString().substring(11, 19);

    if (hoveredSystem) {
      newLines = [
        `[${timestamp}] TARGET LOCK: ${hoveredSystem.name} (#${String(hoveredSystem.index).padStart(2, '0')})`,
        `[TELEM] LATENCY: ${hoveredSystem.latencyMs}ms | REGION: ${hoveredSystem.metrics.region}`,
        `[METRIC] UPTIME: ${hoveredSystem.metrics.uptime} | LOAD: ${hoveredSystem.metrics.load}`,
        `[ROUTE] ENLACE ${hoveredSystem.category.toUpperCase()} >> SURGE READY`
      ];
      setIsMinimized(false);
    } else {
      newLines = [
        `[${timestamp}] SIDEREAL CLOCK: SYNCED 100%`,
        `[AMB-FLUX] SOLAR RADIATION: 1.361 kW/m²`,
        `[SCAN-SYS] 12/12 ORBITAL BEACONS ONLINE`
      ];
      setIsMinimized(true);
    }

    lineBufferRef.current = newLines;
    typingIndexRef.current = 0;
    setDisplayedLines([]);
  }, [hoveredSystem]);

  // Typewriter effect ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (typingIndexRef.current < lineBufferRef.current.length) {
        const nextLine = lineBufferRef.current[typingIndexRef.current];
        setDisplayedLines((prev) => [...prev.slice(-3), nextLine]);
        typingIndexRef.current += 1;
      }
    }, 110);

    return () => clearInterval(interval);
  }, []);

  if (isMinimized && !hoveredSystem) {
    return (
      <button
        onClick={() => {
          soundManager.playHover();
          setIsMinimized(false);
        }}
        className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#71c4bd]/30 bg-[#030d14]/75 hover:bg-[#081e28]/90 text-[10px] font-mono text-[#a5ede4] shadow-lg backdrop-blur-md transition-all hover:border-[#00f0ff]/50"
        title="Abrir terminal de telemetría Scan Log"
      >
        <Radio className="w-3 h-3 text-[#00f0ff] animate-pulse" />
        <span>SCAN LOG: 12/12 OK</span>
        <span className="text-[9px] text-[#71c4bd]">▾</span>
      </button>
    );
  }

  return (
    <div
      className="w-[260px] sm:w-[300px] pointer-events-auto transition-all duration-300"
      aria-label="Registro de Telemetría Scan Log"
    >
      <div
        className="rounded-xl border border-[#71c4bd]/25 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden"
        style={{
          backgroundColor: `rgba(3, 10, 16, ${Math.max(0.3, widgetOpacity)})`
        }}
      >
        {/* Header */}
        <div
          onClick={() => setIsMinimized(!isMinimized)}
          className="px-3 py-1.5 border-b border-[#71c4bd]/15 flex items-center justify-between bg-[#07161c]/60 cursor-pointer select-none"
        >
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#00f0ff] animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#9de9df] font-bold">
              SCAN LOG TELEMETRÍA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="text-[#a8cbc7] hover:text-white transition-colors"
            >
              {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Typewriter Stream Body */}
        <div className="p-2.5 font-mono text-[9.5px] leading-tight space-y-1 text-[#a5ede4] bg-gradient-to-b from-transparent to-[#02070a]/60 min-h-[50px]">
          {displayedLines.map((line, idx) => (
            <div key={idx} className="truncate flex items-start gap-1">
              <span className="text-[#00f0ff]/70 select-none">&gt;</span>
              <span className="truncate">{line}</span>
            </div>
          ))}
          {displayedLines.length === 0 && (
            <div className="text-[#71c4bd]/50 italic">Esperando paquete de enlace...</div>
          )}
        </div>
      </div>
    </div>
  );
};
