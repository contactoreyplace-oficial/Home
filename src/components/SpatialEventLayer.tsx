import React, { useEffect, useState } from 'react';
import { DayNightCyclePhase, HarmonicFrequencyMode } from '../types/system';

interface SpatialEventLayerProps {
  solarPhase: DayNightCyclePhase;
  frequencyMode: HarmonicFrequencyMode;
  isAudioActive: boolean;
}

interface SpatialParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
  type: 'meteor' | 'solar-flare' | 'harmonic-pulse';
}

export const SpatialEventLayer: React.FC<SpatialEventLayerProps> = ({
  solarPhase,
  frequencyMode,
  isAudioActive
}) => {
  const [particles, setParticles] = useState<SpatialParticle[]>([]);

  useEffect(() => {
    let animId: number;
    let lastSpawn = performance.now();

    const spawnInterval = solarPhase === 'sunset' || solarPhase === 'dawn' ? 2200 : 3500;

    const loop = (time: number) => {
      // Spawn occasional meteor or solar flare
      if (time - lastSpawn > spawnInterval) {
        lastSpawn = time;
        const isFlare = solarPhase === 'day' || solarPhase === 'afternoon';
        const type = isFlare ? 'solar-flare' : Math.random() > 0.4 ? 'meteor' : 'harmonic-pulse';

        let color = '#00f0ff';
        if (type === 'solar-flare') color = solarPhase === 'sunset' ? '#f59e0b' : '#38bdf8';
        if (type === 'harmonic-pulse') {
          if (frequencyMode === 'earth-schumann') color = '#10b981';
          else if (frequencyMode === 'harmony-432') color = '#00f0ff';
          else if (frequencyMode === 'peace-528') color = '#a855f7';
          else color = '#f59e0b';
        }

        const newParticle: SpatialParticle = {
          id: Date.now() + Math.random(),
          x: Math.random() * window.innerWidth,
          y: isFlare ? Math.random() * (window.innerHeight * 0.4) : -20,
          size: type === 'meteor' ? 2 + Math.random() * 3 : 4 + Math.random() * 8,
          color,
          speedX: (Math.random() - 0.5) * (type === 'meteor' ? 6 : 1),
          speedY: type === 'meteor' ? 4 + Math.random() * 5 : 0.5 + Math.random() * 1.5,
          opacity: 0.85,
          type
        };

        setParticles((prev) => [...prev.slice(-12), newParticle]);
      }

      // Update particle positions
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.speedX,
            y: p.y + p.speedY,
            opacity: p.opacity - 0.006
          }))
          .filter((p) => p.opacity > 0 && p.y < window.innerHeight + 50)
      );

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [solarPhase, frequencyMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full transition-transform duration-75"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            opacity: p.opacity
          }}
        />
      ))}
    </div>
  );
};
