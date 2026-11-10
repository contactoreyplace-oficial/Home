import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
}

interface LightTrailOverlayProps {
  enabled?: boolean;
}

export const LightTrailOverlay: React.FC<LightTrailOverlayProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

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

    const particles: TrailPoint[] = [];
    const maxParticles = 60;
    const history: { x: number; y: number; time: number }[] = [];

    let lastX = -1;
    let lastY = -1;
    let lastMoveTime = 0;

    const colors = [
      'rgba(0, 240, 255, ',     // Cyan electric
      'rgba(142, 221, 211, ',   // Pale aquamarine
      'rgba(56, 189, 248, ',    // Sky blue
      'rgba(255, 255, 255, '     // Pure stardust white
    ];

    const addPoint = (x: number, y: number) => {
      const now = performance.now();
      lastMoveTime = now;

      // Add to cursor history for smooth spline interpolation
      history.push({ x, y, time: now });
      if (history.length > 12) {
        history.shift();
      }

      // Calculate speed for reactive particle emission
      const dx = lastX >= 0 ? x - lastX : 0;
      const dy = lastY >= 0 ? y - lastY : 0;
      const speed = Math.hypot(dx, dy);

      lastX = x;
      lastY = y;

      // Spawn ephemeral stardust particles
      const count = Math.min(3, Math.max(1, Math.floor(speed * 0.1)));
      for (let i = 0; i < count; i++) {
        if (particles.length >= maxParticles) {
          particles.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const pSpeed = Math.random() * 0.8 + 0.2;
        const colorBase = colors[Math.floor(Math.random() * colors.length)];

        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * pSpeed + dx * 0.05,
          vy: Math.sin(angle) * pSpeed + dy * 0.05,
          alpha: 0.65 + Math.random() * 0.35,
          decay: 0.02 + Math.random() * 0.025,
          size: 1.2 + Math.random() * 2.5,
          color: colorBase
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addPoint(x, y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        addPoint(x, y);
      }
    };

    // Attach to window so drag gestures and touches across the 3D canvas trigger trails smoothly
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Render loop
    const render = () => {
      animId = requestAnimationFrame(render);

      const now = performance.now();

      // Clear previous canvas frame
      ctx.clearRect(0, 0, width, height);

      // Clean old history items (> 350ms old)
      while (history.length > 0 && now - history[0].time > 350) {
        history.shift();
      }

      // Draw ephemeral glowing curve connecting recent cursor positions
      if (history.length > 2) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.moveTo(history[0].x, history[0].y);

        for (let i = 1; i < history.length - 1; i++) {
          const xc = (history[i].x + history[i + 1].x) / 2;
          const yc = (history[i].y + history[i + 1].y) / 2;
          ctx.quadraticCurveTo(history[i].x, history[i].y, xc, yc);
        }

        // Soft outer glow
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Focused inner core beam
        ctx.strokeStyle = 'rgba(165, 243, 235, 0.45)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();
      }

      // Update and draw floating stardust particles
      if (particles.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;

          if (p.alpha <= 0.01) {
            particles.splice(i, 1);
            continue;
          }

          ctx.fillStyle = `${p.color}${Math.max(0, p.alpha)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Subtle radial stardust halo on larger particles
          if (p.size > 2.0) {
            ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.25})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-15"
      aria-hidden="true"
    />
  );
};
