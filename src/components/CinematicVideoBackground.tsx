import React, { useRef, useState, useEffect } from 'react';

interface CinematicVideoBackgroundProps {
  zenMode?: boolean;
  videoSource?: 'reyplace-earth' | 'scorpius-zoom';
  playbackSpeed?: number;
}

export const CinematicVideoBackground: React.FC<CinematicVideoBackgroundProps> = ({
  zenMode = false,
  videoSource = 'reyplace-earth',
  playbackSpeed = 1.0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Video source file paths
  const videoMap = {
    'reyplace-earth': '/public/assets/aistudio/232988114_1792717067712827_fd599751.mp4',
    'scorpius-zoom': '/public/assets/aistudio/359152771_1792717389598737_7bd017e2.mp4'
  };

  const currentSrc = videoMap[videoSource];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [currentSrc]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none bg-[#01060b]"
      aria-hidden="true"
    >
      {/* 1. Ultra-HD Continuous Video Layer from User Attachment */}
      <video
        ref={videoRef}
        key={currentSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`fixed inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out transform-gpu filter brightness-[1.02] contrast-[1.06] ${
          isLoaded ? 'opacity-95' : 'opacity-0'
        }`}
      >
        <source src={currentSrc} type="video/mp4" />
      </video>

      {/* 2. Fallback 4K Celestial Gradient if video takes a second to load */}
      {(!isLoaded || hasError) && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: "url('/public/assets/aistudio/429405072_1792717365542947_ac7d3034.jpg')",
            filter: 'brightness(0.95)'
          }}
        />
      )}

      {/* 3. Deep Space Radial Vignette for Apple Neomorphic Glass Legibility */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: zenMode
            ? 'radial-gradient(circle at 50% 50%, transparent 65%, rgba(1, 6, 12, 0.55) 100%)'
            : 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(1, 6, 12, 0.45) 85%, rgba(0, 3, 7, 0.8) 100%)'
        }}
      />

      {/* 4. Fine Cinematic Film Grain & Scanline Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />
    </div>
  );
};
