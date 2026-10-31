import React, { useRef, useState, useEffect } from 'react';
import { SystemPortal } from '../types/system';
import { SystemIcon } from './SystemIcon';
import { ExternalLink, Sparkles, Activity, Layers, Radio } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface OrbitModulesProps {
  systems: SystemPortal[];
  orbitAngle: number;
  hoveredIndex: number | null;
  onHoverIndex: (index: number | null) => void;
  onSelectSystem: (system: SystemPortal) => void;
  cardScale?: number;
  widgetOpacity?: number;
}

export const OrbitModules: React.FC<OrbitModulesProps> = ({
  systems,
  orbitAngle,
  hoveredIndex,
  onHoverIndex,
  onSelectSystem,
  cardScale = 1.0,
  widgetOpacity = 0.45
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 600
  });
  const [pointerOffset, setPointerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Parallax tracking
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setPointerOffset({
        x: (e.clientX - cx) * 0.5,
        y: (e.clientY - cy) * 0.5
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  // Keyboard navigation for arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        soundManager.playOrbitTick();
        const current = hoveredIndex ?? 0;
        const next =
          e.key === 'ArrowRight'
            ? (current + 1) % systems.length
            : (current - 1 + systems.length) % systems.length;
        onHoverIndex(next);
      } else if (e.key === 'Enter' && hoveredIndex !== null) {
        const sys = systems[hoveredIndex];
        if (sys) onSelectSystem(sys);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredIndex, systems, onHoverIndex, onSelectSystem]);

  // Carefully calculated orbital radiuses to guarantee zero overlap with top or bottom HUDs
  const isMobile = containerSize.width < 768;
  const rx = isMobile
    ? Math.max(140, containerSize.width * 0.44)
    : Math.max(280, Math.min(containerSize.width * 0.42, 540));
  const ry = isMobile
    ? Math.max(90, containerSize.height * 0.22)
    : Math.max(120, Math.min(containerSize.height * 0.23, 195));

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none flex flex-col justify-between"
      style={{ perspective: '1200px' }}
      aria-label="Contenedor de los 12 módulos orbitales siempre visibles"
    >
      {/* 1. 3D ORBITAL MODULES CARDS (ALWAYS VISIBLE IN 3D SPACE) */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {systems.map((system, i) => {
          const a = orbitAngle + (i / systems.length) * Math.PI * 2;
          const depth = Math.sin(a); // -1 (back of planet) to +1 (front)
          const baseScale = (isMobile ? 0.72 : 0.82 + (depth + 1) * 0.12) * cardScale;

          // Parallax depth multiplier
          const parallaxFactor = (depth + 1.2) * 0.04;
          const parallaxX = pointerOffset.x * parallaxFactor;
          const parallaxY = pointerOffset.y * parallaxFactor;

          const x = Math.cos(a) * rx + parallaxX;
          const y = Math.sin(a) * ry - Math.cos(a) * (isMobile ? 12 : 20) + parallaxY;

          const isHovered = hoveredIndex === i;
          const zIndex = isHovered ? 80 : Math.round(25 + depth * 15);
          const zTranslate = isHovered ? 60 + (depth + 1) * 20 : (depth + 1) * 14;
          // Guaranteed high visibility: even when in back of orbit, cards maintain 0.78 opacity so they are never hidden!
          const opacity = isHovered ? 1 : Math.max(0.72, 0.78 + (depth + 1) * 0.12);

          const tiltX = (pointerOffset.y / 90) * (depth + 1.1) * -1;
          const tiltY = (pointerOffset.x / 90) * (depth + 1.1);

          return (
            <button
              key={system.id}
              type="button"
              tabIndex={0}
              onMouseEnter={() => {
                soundManager.playHover();
                onHoverIndex(i);
              }}
              onMouseLeave={() => onHoverIndex(null)}
              onFocus={() => {
                soundManager.playHover();
                onHoverIndex(i);
              }}
              onBlur={() => onHoverIndex(null)}
              onClick={() => {
                soundManager.playSelect();
                onSelectSystem(system);
              }}
              style={{
                transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${zTranslate}px) scale(${
                  isHovered ? baseScale * 1.15 : baseScale
                }) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                zIndex,
                opacity,
                backgroundColor: isHovered
                  ? 'rgba(16, 52, 60, 0.95)'
                  : `rgba(6, 22, 30, ${Math.max(0.65, widgetOpacity)})`
              }}
              className={`absolute left-1/2 top-1/2 w-[128px] sm:w-[155px] p-2.5 sm:p-3 rounded-2xl text-left pointer-events-auto cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff] apple-glass-card group ${
                isHovered
                  ? 'ring-2 ring-[#00f0ff] shadow-[0_0_35px_rgba(0,240,255,0.6),0_20px_45px_rgba(0,0,0,0.85)] scale-105'
                  : ''
              }`}
              aria-label={`Acceder a ${system.name} (${system.category})`}
            >
              {/* Header row: Index & Status indicator */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[8px] sm:text-[9px] text-[#8eddd3] tracking-widest font-bold">
                  #{String(system.index).padStart(2, '0')} / 12
                </span>
                <span
                  className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                  style={{
                    backgroundColor: system.accentColor,
                    boxShadow: isHovered ? `0 0 10px ${system.accentColor}` : `0 0 4px ${system.accentColor}`
                  }}
                  title={`Estado: ${system.status}`}
                />
              </div>

              {/* System Name with Icon */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="p-1 rounded bg-[#030e13] border border-[#71c4bd]/30 text-[#00f0ff] group-hover:text-white transition-colors shrink-0">
                  <SystemIcon name={system.icon} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <h3 className="font-bold text-[11px] sm:text-[12px] text-[#f2fffc] truncate group-hover:text-[#00f0ff] transition-colors leading-tight">
                  {system.name}
                </h3>
              </div>

              {/* Category & Latency */}
              <div className="flex items-center justify-between font-mono text-[8px] sm:text-[9px] text-[#8ec8c0] pt-0.5">
                <span className="truncate">{system.category}</span>
                <span className="text-[#00f0ff] font-bold">{system.latencyMs}ms</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. PERSISTENT 12-SYSTEMS STATUS RIBBON (BARRA DE LOS 12 SISTEMAS) */}
      {/* Guarantees all 12 systems are 100% visible, orderly, and directly clickable at all times! */}
      <div className="relative z-20 w-full px-4 sm:px-8 mt-auto mb-16 sm:mb-20 pointer-events-auto flex justify-center">
        <div className="max-w-4xl w-full p-1 sm:p-1.5 rounded-2xl bg-[#04121a]/85 border border-[#71c4bd]/30 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.7)] flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
          <div className="hidden sm:flex items-center gap-1.5 px-2 text-[#00f0ff] font-mono text-[9px] font-bold uppercase tracking-wider shrink-0 border-r border-[#71c4bd]/20">
            <Radio className="w-3 h-3 text-[#10b981] animate-pulse" />
            <span>12 SISTEMAS</span>
          </div>

          <div className="flex items-center justify-between gap-1 w-full overflow-x-auto scrollbar-none py-0.5">
            {systems.map((sys, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <button
                  key={sys.id}
                  onClick={() => {
                    soundManager.playSelect();
                    onHoverIndex(idx);
                    onSelectSystem(sys);
                  }}
                  onMouseEnter={() => {
                    soundManager.playHover();
                    onHoverIndex(idx);
                  }}
                  onMouseLeave={() => onHoverIndex(null)}
                  className={`px-2 py-1 rounded-lg font-mono text-[9px] sm:text-[10px] flex items-center gap-1 transition-all shrink-0 ${
                    isHovered
                      ? 'bg-[#00f0ff] text-black font-black shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-105'
                      : 'bg-[#081e28]/70 text-[#a8cbc7] hover:text-white hover:bg-[#113140]'
                  }`}
                  title={`${sys.name} (${sys.category}) - Clic para inspeccionar`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sys.accentColor }}
                  />
                  <span className="font-bold">{String(sys.index).padStart(2, '0')}</span>
                  <span className="hidden md:inline truncate max-w-[70px]">{sys.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
