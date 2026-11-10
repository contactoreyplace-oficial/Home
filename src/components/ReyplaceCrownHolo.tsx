import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { tacticalFeedback } from '../utils/tacticalFeedback';

interface ReyplaceCrownHoloProps {
  onClick?: () => void;
  collapsed?: boolean;
}

export const ReyplaceCrownHolo: React.FC<ReyplaceCrownHoloProps> = ({
  onClick,
  collapsed = false
}) => {
  const handleClick = () => {
    soundManager.playChime(640, 0.08);
    tacticalFeedback.trigger('light', 'subtle');
    if (onClick) onClick();
  };

  if (collapsed) return null;

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer select-none pointer-events-auto transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      title="Identidad Oficial REYPLACE.MX · Clic para ver especificaciones"
    >
      {/* Outer Luminous Glow Aura */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#00f0ff]/30 via-[#d946ef]/20 to-[#f59e0b]/30 opacity-70 blur-xl group-hover:opacity-100 transition-opacity duration-500" />

      {/* Apple VisionOS Frosted Glass Container */}
      <div className="relative flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#04121a]/80 border border-[#71c4bd]/40 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] group-hover:border-[#00f0ff]/80 transition-all">
        {/* Animated Vector Insignia (From video 00:00 & 00:07) */}
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          {/* Subtle Rotating Ring */}
          <div
            className="absolute inset-0 rounded-full border border-dashed border-[#00f0ff]/40 animate-spin"
            style={{ animationDuration: '24s' }}
          />

          <svg
            viewBox="0 0 100 100"
            className="w-9 h-9 drop-shadow-[0_2px_10px_rgba(0,240,255,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Celestial wireframe halo */}
            <ellipse
              cx="50"
              cy="16"
              rx="24"
              ry="6"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              opacity="0.85"
            />

            {/* Circuit Crown Outline */}
            <path
              d="M20 34 L32 20 L50 30 L68 20 L80 34 L74 46 L26 46 Z"
              fill="url(#crownShine)"
              stroke="#e2e8f0"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Circuit Traces */}
            <line x1="38" y1="36" x2="44" y2="36" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="44" cy="36" r="1.5" fill="#fbbf24" />
            <line x1="56" y1="36" x2="62" y2="36" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="56" cy="36" r="1.5" fill="#fbbf24" />

            {/* Orbital Ring Track with 5 Colored Nodes */}
            <circle
              cx="50"
              cy="62"
              r="28"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              opacity="0.8"
            />
            <circle cx="50" cy="34" r="3" fill="#10b981" />
            <circle cx="76" cy="56" r="2.8" fill="#ec4899" />
            <circle cx="70" cy="78" r="2.6" fill="#f59e0b" />
            <circle cx="50" cy="90" r="3" fill="#00f0ff" />
            <circle cx="24" cy="62" r="2.6" fill="#a855f7" />

            {/* Center Holographic 'R' with Iridescent Rainbow Gradient */}
            <path
              d="M40 50 L52 50 C58 50 62 53 62 57 C62 61 58 64 52 64 L45 64 L45 74 L40 74 Z M45 54 L51 54 C54 54 57 55 57 57 C57 59 54 60 51 60 L45 60 Z M52 64 L63 76 L57 76 L48 64 Z"
              fill="url(#rRainbowGradHolo)"
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            <defs>
              <linearGradient id="crownShine" x1="20" y1="20" x2="80" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#cbd5e1" />
                <stop offset="0.5" stopColor="#ffffff" />
                <stop offset="1" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="rRainbowGradHolo" x1="38" y1="48" x2="65" y2="76" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f0ff" />
                <stop offset="0.25" stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="0.75" stopColor="#ec4899" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Text Details & Live Pulse */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-sm tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-white via-[#a5e6df] to-[#00f0ff] uppercase">
              REYPLACE.MX
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[#34d399] font-mono text-[8px] font-bold">
              <span className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[9px] text-[#8eddd3]/90">
            <span>ECOSISTEMA PLANETARIO</span>
            <span className="text-[#00f0ff]">•</span>
            <span className="text-[#a5e6df]/75">12 NODOS ACTIVOS</span>
          </div>
        </div>

        {/* Sparkle Highlight Icon */}
        <Sparkles className="w-3.5 h-3.5 text-[#00f0ff] opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all ml-1 shrink-0" />
      </div>
    </div>
  );
};
