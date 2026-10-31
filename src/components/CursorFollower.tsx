import React, { useEffect, useRef, useState } from 'react';

interface CursorFollowerProps {
  isHoveringInteractive: boolean;
  activeLabel?: string | null;
  enabled?: boolean;
}

export const CursorFollower: React.FC<CursorFollowerProps> = ({
  isHoveringInteractive,
  activeLabel,
  enabled = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if device supports hover / mouse
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let animId: number;

    const render = () => {
      // Smooth lerp interpolation (0.18 for smooth lag)
      const k = 0.18;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * k;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * k;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [enabled, isVisible]);

  if (!enabled || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Lagging outer high-tech targeting reticle */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 will-change-transform transition-size duration-200"
      >
        <div
          className={`relative rounded-full border transition-all duration-300 flex items-center justify-center ${
            isHoveringInteractive
              ? 'w-14 h-14 border-[#00f0ff] shadow-[0_0_28px_rgba(0,240,255,0.8)] scale-110'
              : 'w-8 h-8 border-[#71c4bd]/40 shadow-[0_0_12px_rgba(113,196,189,0.3)]'
          } ${isClicking ? 'scale-90 border-white' : ''}`}
        >
          {/* Rotating Sci-Fi Brackets */}
          <div
            className={`absolute inset-[-4px] rounded-full border border-dashed border-[#00f0ff]/50 ${
              isHoveringInteractive ? 'animate-spin' : 'hidden'
            }`}
            style={{ animationDuration: '6s' }}
          />

          {/* Micro crosshairs */}
          <div className="absolute top-0 w-1.5 h-0.5 bg-[#00f0ff]" />
          <div className="absolute bottom-0 w-1.5 h-0.5 bg-[#00f0ff]" />
          <div className="absolute left-0 w-0.5 h-1.5 bg-[#00f0ff]" />
          <div className="absolute right-0 w-0.5 h-1.5 bg-[#00f0ff]" />

          {/* Target acquired mini label */}
          {isHoveringInteractive && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-[#030a10]/90 border border-[#00f0ff]/50 text-[8px] font-mono tracking-widest text-[#00f0ff] uppercase shadow-lg">
              {activeLabel ? activeLabel : 'LOCK-ON'}
            </div>
          )}
        </div>
      </div>

      {/* Immediate center laser point */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full transition-all duration-150 ${
            isHoveringInteractive
              ? 'bg-[#00f0ff] scale-150 shadow-[0_0_8px_#00f0ff]'
              : 'bg-[#a6efe3]'
          }`}
        />
      </div>
    </div>
  );
};
