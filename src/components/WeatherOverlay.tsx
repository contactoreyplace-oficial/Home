import React, { useEffect, useRef } from 'react';
import { PlanetTheme } from '../types/system';

export type WeatherEffectMode = 'aurora' | 'stardust' | 'solar-wisps' | 'off';

interface WeatherOverlayProps {
  mode?: WeatherEffectMode;
  zenMode?: boolean;
  intensity?: number;
  theme?: PlanetTheme;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  mode = 'aurora',
  zenMode = false,
  intensity = 1.0,
  theme = 'oceanic'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'off') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    // Particle definitions for Stardust & Solar Wisps
    const particleCount = mode === 'stardust' ? 90 : 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: mode === 'solar-wisps' ? -0.3 - Math.random() * 0.6 : (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2.2 + 0.8,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.02 + Math.random() * 0.04,
      hue: theme === 'nebula' ? 280 : theme === 'aurora' ? 150 : 185
    }));

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, width, height);

      // Synchronize overall opacity with Zen Mode (more luminous in Zen Mode)
      const baseAlpha = (zenMode ? 0.75 : 0.38) * intensity;

      if (mode === 'aurora') {
        // Ethereal, undulating northern / planetary aurora ribbons
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const ribbonCount = 3;
        for (let r = 0; r < ribbonCount; r++) {
          const ribbonOffset = r * 0.9;
          const ribbonY = height * 0.28 + r * 35;

          const grad = ctx.createLinearGradient(0, ribbonY - 70, 0, ribbonY + 80);
          if (theme === 'nebula') {
            grad.addColorStop(0, 'rgba(168, 85, 247, 0)');
            grad.addColorStop(0.5, `rgba(236, 72, 153, ${0.28 * baseAlpha})`);
            grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
          } else if (theme === 'aurora' || theme === 'oceanic') {
            grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
            grad.addColorStop(0.4, `rgba(0, 240, 255, ${0.32 * baseAlpha})`);
            grad.addColorStop(0.7, `rgba(52, 211, 153, ${0.25 * baseAlpha})`);
            grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          } else {
            grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
            grad.addColorStop(0.5, `rgba(14, 165, 233, ${0.3 * baseAlpha})`);
            grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, ribbonY);

          const step = 32;
          for (let x = 0; x <= width + step; x += step) {
            const wave1 = Math.sin(x * 0.004 + elapsed * 0.6 + ribbonOffset) * 45;
            const wave2 = Math.cos(x * 0.009 - elapsed * 0.4 + ribbonOffset * 2) * 25;
            const y = ribbonY + wave1 + wave2;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height * 0.6);
          ctx.lineTo(0, height * 0.6);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (mode === 'stardust' || mode === 'solar-wisps') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += p.phaseSpeed;

          // Wrap edges
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const shimmer = Math.sin(p.phase) * 0.4 + 0.6;
          const currentAlpha = shimmer * baseAlpha;

          const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
          pGrad.addColorStop(0, `hsla(${p.hue}, 100%, 85%, ${currentAlpha})`);
          pGrad.addColorStop(0.4, `hsla(${p.hue}, 90%, 65%, ${currentAlpha * 0.6})`);
          pGrad.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);

          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [mode, zenMode, intensity, theme]);

  if (mode === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-15 transition-opacity duration-700 ${
        zenMode ? 'opacity-90' : 'opacity-60'
      }`}
    />
  );
};
