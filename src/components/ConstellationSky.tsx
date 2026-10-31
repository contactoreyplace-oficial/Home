import React, { useEffect, useState } from 'react';

interface ConstellationSkyProps {
  isNight: boolean;
  glowIntensity?: number;
}

export const ConstellationSky: React.FC<ConstellationSkyProps> = ({ isNight, glowIntensity = 1.4 }) => {
  // Real-time sidereal rotation angle based on current time
  const [siderealAngle, setSiderealAngle] = useState(0);

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    const loop = (time: number) => {
      // 1 full celestial rotation every 280 seconds (simulated sidereal speed)
      const elapsed = (time - startTime) / 1000;
      setSiderealAngle((elapsed * 1.25) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <svg
      className={`fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 z-0 ${
        isNight ? 'opacity-95' : 'opacity-65'
      }`}
      aria-hidden="true"
      viewBox="0 0 3840 2160"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Deep Space Colorful Nebula Gradients */}
        {/* Cosmic Carina Nebula: Deep Cyan & Azure */}
        <radialGradient id="nebula-azure-core" cx="24%" cy="32%" r="55%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.16 * glowIntensity} />
          <stop offset="25%" stopColor="#0284c7" stopOpacity={0.12 * glowIntensity} />
          <stop offset="55%" stopColor="#082f49" stopOpacity={0.06 * glowIntensity} />
          <stop offset="100%" stopColor="#020813" stopOpacity="0" />
        </radialGradient>

        {/* Cosmic Orion Nebula: Deep Violet, Magenta & Indigo */}
        <radialGradient id="nebula-magenta-core" cx="78%" cy="28%" r="60%">
          <stop offset="0%" stopColor="#e879f9" stopOpacity={0.14 * glowIntensity} />
          <stop offset="28%" stopColor="#a855f7" stopOpacity={0.11 * glowIntensity} />
          <stop offset="60%" stopColor="#4338ca" stopOpacity={0.07 * glowIntensity} />
          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
        </radialGradient>

        {/* Cosmic Eagle Pillars: Emerald & Golden Teal */}
        <radialGradient id="nebula-emerald-pillars" cx="45%" cy="68%" r="52%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.12 * glowIntensity} />
          <stop offset="30%" stopColor="#0f766e" stopOpacity={0.08 * glowIntensity} />
          <stop offset="65%" stopColor="#042f2e" stopOpacity={0.04 * glowIntensity} />
          <stop offset="100%" stopColor="#020813" stopOpacity="0" />
        </radialGradient>

        {/* Cosmic Sagittarius Heart: Warm Amber & Rose stellar dust */}
        <radialGradient id="nebula-stellar-dust" cx="62%" cy="82%" r="48%">
          <stop offset="0%" stopColor="#fb7185" stopOpacity={0.11 * glowIntensity} />
          <stop offset="35%" stopColor="#c026d3" stopOpacity={0.07 * glowIntensity} />
          <stop offset="70%" stopColor="#1e1b4b" stopOpacity={0.04 * glowIntensity} />
          <stop offset="100%" stopColor="#020813" stopOpacity="0" />
        </radialGradient>

        {/* Galactic Central Disk glow */}
        <linearGradient id="milky-way-band" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.02 * glowIntensity} />
          <stop offset="30%" stopColor="#818cf8" stopOpacity={0.09 * glowIntensity} />
          <stop offset="50%" stopColor="#c084fc" stopOpacity={0.12 * glowIntensity} />
          <stop offset="70%" stopColor="#38bdf8" stopOpacity={0.08 * glowIntensity} />
          <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02 * glowIntensity} />
        </linearGradient>

        {/* Star Glow & Bloom Filters */}
        <filter id="star-glow-filter" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="nebula-soften" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>

      {/* 1. Deep Space Atmospheric Cosmic Color Foundations */}
      <rect width="3840" height="2160" fill="url(#nebula-azure-core)" />
      <rect width="3840" height="2160" fill="url(#nebula-magenta-core)" />
      <rect width="3840" height="2160" fill="url(#nebula-emerald-pillars)" />
      <rect width="3840" height="2160" fill="url(#nebula-stellar-dust)" />

      {/* 2. Luminous Milky Way Interstellar Dust Lane */}
      <path
        d="M -200 400 Q 1200 800, 2400 1200 T 4200 1800"
        stroke="url(#milky-way-band)"
        strokeWidth="650"
        fill="none"
        filter="url(#nebula-soften)"
        opacity="0.85"
      />

      {/* 3. Deep Space Distant Star Clusters & Micro-Stars (Non-rotating deep field) */}
      <g opacity="0.8">
        {/* Blue spectral giants (O-type) */}
        <circle cx="340" cy="180" r="2.5" fill="#bae6fd" />
        <circle cx="720" cy="890" r="3" fill="#67e8f9" filter="url(#star-glow-filter)" />
        <circle cx="1450" cy="320" r="3.2" fill="#38bdf8" filter="url(#star-glow-filter)" />
        <circle cx="2180" cy="640" r="2.2" fill="#7dd3fc" />
        <circle cx="3120" cy="210" r="3" fill="#38bdf8" filter="url(#star-glow-filter)" />
        <circle cx="3580" cy="780" r="2.8" fill="#67e8f9" />
        <circle cx="280" cy="1740" r="3.5" fill="#38bdf8" filter="url(#star-glow-filter)" />
        <circle cx="1680" cy="1920" r="2.8" fill="#bae6fd" />
        <circle cx="2540" cy="1580" r="3.2" fill="#7dd3fc" filter="url(#star-glow-filter)" />
        <circle cx="3420" cy="1890" r="3" fill="#38bdf8" />

        {/* Warm Golden / Solar Stars (G-type) */}
        <circle cx="560" cy="420" r="3.8" fill="#fde047" filter="url(#star-glow-filter)" />
        <circle cx="1120" cy="180" r="2.5" fill="#fef08a" />
        <circle cx="1840" cy="480" r="4.2" fill="#fbbf24" filter="url(#star-glow-filter)" />
        <circle cx="2680" cy="380" r="2.8" fill="#fde047" />
        <circle cx="3340" cy="520" r="3.5" fill="#fef08a" filter="url(#star-glow-filter)" />
        <circle cx="820" cy="1540" r="4.0" fill="#fbbf24" filter="url(#star-glow-filter)" />
        <circle cx="2040" cy="1760" r="2.8" fill="#fde047" />
        <circle cx="2880" cy="1340" r="3.5" fill="#fef08a" filter="url(#star-glow-filter)" />

        {/* Red Supergiants (M-type) */}
        <circle cx="940" cy="380" r="4.5" fill="#f87171" filter="url(#star-glow-filter)" />
        <circle cx="1580" cy="780" r="3.2" fill="#fb7185" />
        <circle cx="2420" cy="240" r="4.0" fill="#f43f5e" filter="url(#star-glow-filter)" />
        <circle cx="3640" cy="1420" r="3.5" fill="#f87171" />
        <circle cx="480" cy="1980" r="4.2" fill="#fb7185" filter="url(#star-glow-filter)" />
      </g>

      {/* 4. Real-Time Rotating Celestial Vault & Constellations */}
      <g
        transform={`rotate(${siderealAngle.toFixed(3)}, 1920, 1080)`}
        style={{ transformOrigin: '1920px 1080px' }}
      >
        {/* Celestial Equatorial & Polar Radial Coordinate Rings */}
        <circle cx="1920" cy="1080" r="1620" stroke="#71c4bd" strokeWidth="1" strokeDasharray="8 8" opacity="0.09" fill="none" />
        <circle cx="1920" cy="1080" r="1140" stroke="#71c4bd" strokeWidth="1" strokeDasharray="12 12" opacity="0.07" fill="none" />
        <circle cx="1920" cy="1080" r="620" stroke="#00f0ff" strokeWidth="1" opacity="0.06" fill="none" />

        {/* Meridian lines */}
        <line x1="300" y1="1080" x2="3540" y2="1080" stroke="#71c4bd" strokeWidth="0.8" opacity="0.05" />
        <line x1="1920" y1="180" x2="1920" y2="1980" stroke="#71c4bd" strokeWidth="0.8" opacity="0.05" />

        {/* --- Constellation: ORIÓN (Alpha Hunter) --- */}
        <g opacity="0.9">
          <line x1="680" y1="520" x2="860" y2="380" stroke="#8eddd3" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.75" />
          <line x1="860" y1="380" x2="1050" y2="540" stroke="#8eddd3" strokeWidth="1.5" opacity="0.75" />
          <line x1="1050" y1="540" x2="1220" y2="350" stroke="#8eddd3" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.75" />
          {/* Orion's Belt (Tres Marías) */}
          <line x1="860" y1="380" x2="940" y2="720" stroke="#8eddd3" strokeWidth="1.2" opacity="0.5" />
          <line x1="940" y1="720" x2="1040" y2="735" stroke="#00f0ff" strokeWidth="2.5" opacity="0.95" />
          <line x1="1040" y1="735" x2="1140" y2="750" stroke="#00f0ff" strokeWidth="2.5" opacity="0.95" />
          <line x1="1140" y1="750" x2="1220" y2="350" stroke="#8eddd3" strokeWidth="1.2" opacity="0.5" />

          {/* Betelgeuse (Red Supergiant - Top Left) */}
          <circle cx="680" cy="520" r="9" fill="#f87171" filter="url(#star-glow-filter)" />
          {/* Bellatrix */}
          <circle cx="1050" cy="540" r="7.5" fill="#bae6fd" filter="url(#star-glow-filter)" />
          {/* Rigel (Blue-White Supergiant - Bottom Right) */}
          <circle cx="1220" cy="350" r="10" fill="#e0f2fe" filter="url(#star-glow-filter)" />
          {/* Saiph */}
          <circle cx="860" cy="380" r="8" fill="#ffffff" filter="url(#star-glow-filter)" />
          {/* Cinturón */}
          <circle cx="940" cy="720" r="6.5" fill="#67e8f9" filter="url(#star-glow-filter)" />
          <circle cx="1040" cy="735" r="7.5" fill="#ffffff" filter="url(#star-glow-filter)" />
          <circle cx="1140" cy="750" r="6.5" fill="#67e8f9" filter="url(#star-glow-filter)" />

          <text x="680" y="590" fill="#a9e7df" fontFamily="'Space Mono', monospace" fontSize="22" letterSpacing="0.25em">
            CONSTELACIÓN ORIÓN · RA 05h 35m
          </text>
        </g>

        {/* --- Constellation: CASIOPEA (Celestial W) --- */}
        <g opacity="0.9">
          <line x1="2840" y1="460" x2="3040" y2="310" stroke="#8eddd3" strokeWidth="1.6" opacity="0.75" />
          <line x1="3040" y1="310" x2="3260" y2="440" stroke="#8eddd3" strokeWidth="1.6" strokeDasharray="6 4" opacity="0.75" />
          <line x1="3260" y1="440" x2="3420" y2="280" stroke="#8eddd3" strokeWidth="1.6" opacity="0.75" />

          <circle cx="2840" cy="460" r="7.5" fill="#fde047" filter="url(#star-glow-filter)" />
          <circle cx="3040" cy="310" r="10" fill="#ffffff" filter="url(#star-glow-filter)" />
          <circle cx="3260" cy="440" r="8" fill="#d9ffff" filter="url(#star-glow-filter)" />
          <circle cx="3420" cy="280" r="9.5" fill="#38bdf8" filter="url(#star-glow-filter)" />

          <text x="2840" y="530" fill="#a9e7df" fontFamily="'Space Mono', monospace" fontSize="22" letterSpacing="0.25em">
            CASIOPEA · DEC +60°
          </text>
        </g>

        {/* --- Constellation: CRUZ DEL SUR --- */}
        <g opacity="0.85">
          <line x1="3000" y1="1680" x2="3000" y2="1920" stroke="#8eddd3" strokeWidth="1.6" opacity="0.7" />
          <line x1="2910" y1="1790" x2="3090" y2="1790" stroke="#8eddd3" strokeWidth="1.6" opacity="0.7" />

          <circle cx="3000" cy="1680" r="8.5" fill="#ffffff" filter="url(#star-glow-filter)" />
          <circle cx="3000" cy="1920" r="10" fill="#38bdf8" filter="url(#star-glow-filter)" />
          <circle cx="2910" cy="1790" r="7" fill="#a7f3d0" />
          <circle cx="3090" cy="1790" r="7.5" fill="#d9ffff" filter="url(#star-glow-filter)" />

          <text x="2870" y="1980" fill="#a9e7df" fontFamily="'Space Mono', monospace" fontSize="20" letterSpacing="0.22em">
            CRUX AUSTRALIS · POLAR SUR
          </text>
        </g>
      </g>
    </svg>
  );
};
