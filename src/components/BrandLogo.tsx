import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  onClick
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      title="REYPLACE.MX - Ecosistema Digital"
    >
      {/* 3D Brand Insignia: Crown + Holographic Prismatic R + Orbital Track */}
      <div className={`relative ${sizeMap[size]} shrink-0 transition-transform duration-300 ${onClick ? 'group-hover:scale-105' : ''}`}>
        {/* Ambient Back Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00f0ff] via-[#d946ef] to-[#f59e0b] opacity-60 blur-md group-hover:opacity-100 transition-opacity" />

        {/* Vector High-Fidelity Crown & R Emblem */}
        <div className="relative w-full h-full rounded-xl bg-[#030d14] border border-[#71c4bd]/40 overflow-hidden shadow-xl flex items-center justify-center p-0.5">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,240,255,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Celestial wireframe halo above crown */}
            <ellipse cx="50" cy="18" rx="26" ry="7" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.9" />
            <line x1="28" y1="18" x2="50" y2="12" stroke="#fbbf24" strokeWidth="0.8" opacity="0.6" />
            <line x1="72" y1="18" x2="50" y2="12" stroke="#fbbf24" strokeWidth="0.8" opacity="0.6" />

            {/* Circuit Crown Outline */}
            <path
              d="M20 34 L32 20 L50 30 L68 20 L80 34 L74 46 L26 46 Z"
              fill="url(#crownGradient)"
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Crown circuit traces */}
            <line x1="38" y1="36" x2="44" y2="36" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="44" cy="36" r="1.5" fill="#fbbf24" />
            <line x1="56" y1="36" x2="62" y2="36" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="56" cy="36" r="1.5" fill="#fbbf24" />

            {/* Circular Orbital Glass Track */}
            <circle cx="50" cy="62" r="30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.75" />
            
            {/* Orbital Nodes (5 Spheres matching the brand image) */}
            {/* Top Node: Cloud (Green) */}
            <circle cx="50" cy="32" r="3.2" fill="#10b981" />
            {/* Right Node: Smartphone (Pink) */}
            <circle cx="78" cy="56" r="3" fill="#ec4899" />
            {/* Bottom-Right Node: Analytics (Amber) */}
            <circle cx="71" cy="78" r="2.8" fill="#f59e0b" />
            {/* Bottom Node: Desktop (Cyan) */}
            <circle cx="50" cy="92" r="3" fill="#00f0ff" />
            {/* Left Node: Users (Purple) */}
            <circle cx="22" cy="62" r="2.8" fill="#a855f7" />

            {/* Center Holographic 'R' with Rainbow Iridescent Gradient */}
            <path
              d="M40 50 L52 50 C58 50 62 53 62 57 C62 61 58 64 52 64 L45 64 L45 74 L40 74 Z M45 54 L51 54 C54 54 57 55 57 57 C57 59 54 60 51 60 L45 60 Z M52 64 L63 76 L57 76 L48 64 Z"
              fill="url(#rRainbowGradient)"
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            <defs>
              <linearGradient id="crownGradient" x1="20" y1="20" x2="80" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#94a3b8" />
                <stop offset="0.5" stopColor="#f8fafc" />
                <stop offset="1" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="rRainbowGradient" x1="38" y1="48" x2="65" y2="76" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f0ff" />
                <stop offset="0.25" stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#a855f7" />
                <stop offset="0.75" stopColor="#ec4899" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Optional typography lockup */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-white via-[#a5e6df] to-[#00f0ff] uppercase">
              REYPLACE.MX
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#064e3b]/80 border border-[#34d399]/40 text-[#34d399]">
              OFICIAL
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-wider text-[#71c4bd]">
            CONECTAMOS · INNOVAMOS · TRANSFORMAMOS
          </span>
        </div>
      )}
    </div>
  );
};
