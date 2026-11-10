import React, { useEffect, useState } from 'react';

interface CelestialSvgBackgroundProps {
  zenMode?: boolean;
}

export const CelestialSvgBackground: React.FC<CelestialSvgBackgroundProps> = ({
  zenMode = false
}) => {
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      // Gentle, smooth parallax factor
      setParallax({
        x: (e.clientX - cx) * 0.015,
        y: (e.clientY - cy) * 0.015
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none bg-black"
      aria-hidden="true"
    >
      {/* 4K Vector SVG Celestial Background Canvas */}
      <svg
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out"
        style={{
          transform: `scale(1.05) translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          willChange: 'transform'
        }}
        viewBox="0 0 1080 1920"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          {/* Antares Supergiant Pulsar Glow Filter */}
          <filter id="antares-red-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Solar Corona Plasma Glow Filter */}
          <filter id="solar-corona-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="coronaBlur" />
            <feMerge>
              <feMergeNode in="coronaBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Constellation Star Cyan Glint Filter */}
          <filter id="star-cyan-glint" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial Gradients for Antares & Sun Energy */}
          <radialGradient id="antaresRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="1" />
            <stop offset="35%" stopColor="#ff2a00" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#ff0055" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="sunRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8db" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffb703" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#fb8500" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffb703" stopOpacity="0" />
          </radialGradient>

          {/* Deep Space Vignette to protect Apple Dark Glass Readability */}
          <radialGradient id="vignetteGrad" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="55%" stopColor="#02080d" stopOpacity={zenMode ? '0.15' : '0.35'} />
            <stop offset="90%" stopColor="#010609" stopOpacity={zenMode ? '0.45' : '0.72'} />
            <stop offset="100%" stopColor="#000305" stopOpacity={zenMode ? '0.65' : '0.88'} />
          </radialGradient>
        </defs>

        {/* 1. Base 4K Ultra-Crisp Photographic Image Layer */}
        <image
          href="/public/assets/aistudio/429405072_1792717365542947_ac7d3034.jpg"
          x="0"
          y="0"
          width="1080"
          height="1920"
          preserveAspectRatio="xMidYMid slice"
        />

        {/* 2. Vector Dynamic Scorpius Constellation Enhancement Layer */}
        <g id="scorpius-vector-overlay" opacity={zenMode ? '0.9' : '0.75'}>
          {/* Scorpius Main Star Line Backbone */}
          <polyline
            points="
              980,1130
              970,1210
              972,1295
              872,1185
              815,1235
              760,1260
              710,1310
              675,1400
              655,1480
              640,1610
              550,1635
              435,1635
              380,1570
              408,1525
              442,1475
            "
            fill="none"
            stroke="#00f0ff"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.5"
          />

          {/* Antares Supergiant Star Node (Alpha Scorpii) Pulse Aura */}
          <circle
            cx="760"
            cy="1260"
            r="38"
            fill="url(#antaresRadial)"
            filter="url(#antares-red-glow)"
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
          <circle
            cx="760"
            cy="1260"
            r="16"
            fill="#ff3b30"
            filter="url(#antares-red-glow)"
          />
          <circle
            cx="760"
            cy="1260"
            r="6"
            fill="#ffffff"
          />

          {/* Antares Label Badge */}
          <g transform="translate(775, 1265)" opacity="0.85">
            <text
              fill="#ff453a"
              fontFamily="monospace"
              fontSize="12"
              fontWeight="bold"
              letterSpacing="2"
            >
              ANTARES · α Sco
            </text>
          </g>

          {/* Other Principal Star Nodes in Scorpius */}
          {[
            { cx: 980, cy: 1130, r: 4.5 },
            { cx: 970, cy: 1210, r: 3.5 },
            { cx: 972, cy: 1295, r: 3.8 },
            { cx: 872, cy: 1185, r: 4 },
            { cx: 815, cy: 1235, r: 3.5 },
            { cx: 710, cy: 1310, r: 3.8 },
            { cx: 675, cy: 1400, r: 4 },
            { cx: 655, cy: 1480, r: 3.5 },
            { cx: 640, cy: 1610, r: 4.2 },
            { cx: 550, cy: 1635, r: 3.8 },
            { cx: 435, cy: 1635, r: 4.5 },
            { cx: 380, cy: 1570, r: 3.5 },
            { cx: 408, cy: 1525, r: 3.8 },
            { cx: 442, cy: 1475, r: 4.5 }
          ].map((star, idx) => (
            <g key={idx}>
              <circle
                cx={star.cx}
                cy={star.cy}
                r={star.r * 2.2}
                fill="#00f0ff"
                fillOpacity="0.25"
                filter="url(#star-cyan-glint)"
              />
              <circle
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                fill="#f0fdfa"
              />
            </g>
          ))}
        </g>

        {/* 3. Golden Sun Extra Radiance Overlay */}
        <circle
          cx="820"
          cy="700"
          r="160"
          fill="url(#sunRadial)"
          filter="url(#solar-corona-glow)"
          opacity="0.35"
        />

        {/* 4. Subdued Cosmic Vignette Gradient Layer for Text Legibility */}
        <rect
          x="0"
          y="0"
          width="1080"
          height="1920"
          fill="url(#vignetteGrad)"
          className="pointer-events-none"
        />
      </svg>

      {/* Subtle Atmospheric Scanline Grid & Vignette Border */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 60%, rgba(2, 8, 14, 0.6) 100%)'
        }}
      />
    </div>
  );
};
