import React, { useState, useEffect, useRef } from 'react';
import { GripHorizontal, RotateCcw, Move } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DraggableWidgetProps {
  id: string;
  isDraggable: boolean;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  isDraggable,
  title = 'Widget',
  className = '',
  children
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(`reyplace_widget_pos_${id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { x: 0, y: 0 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0
  });

  // Listen for global reset positions event
  useEffect(() => {
    const handleReset = () => {
      setPosition({ x: 0, y: 0 });
      try {
        localStorage.removeItem(`reyplace_widget_pos_${id}`);
      } catch {}
    };

    window.addEventListener('reyplace-reset-widget-positions', handleReset);
    return () => window.removeEventListener('reyplace-reset-widget-positions', handleReset);
  }, [id]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    soundManager.playOrbitTick();
    setIsDragging(true);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: position.x,
      initY: position.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;

      const newPos = {
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy
      };

      setPosition(newPos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Persist to localStorage
      try {
        localStorage.setItem(`reyplace_widget_pos_${id}`, JSON.stringify(position));
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDraggable) return;
    const touch = e.touches[0];
    soundManager.playOrbitTick();
    setIsDragging(true);

    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initX: position.x,
      initY: position.y
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      const dx = currentTouch.clientX - dragStartRef.current.startX;
      const dy = currentTouch.clientY - dragStartRef.current.startY;

      setPosition({
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      try {
        localStorage.setItem(`reyplace_widget_pos_${id}`, JSON.stringify(position));
      } catch {}
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleResetSelf = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playOrbitTick();
    setPosition({ x: 0, y: 0 });
    try {
      localStorage.removeItem(`reyplace_widget_pos_${id}`);
    } catch {}
  };

  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 50;
      const y = (e.clientY - window.innerHeight / 2) / 50;
      setParallax({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // If not draggable, just render children directly in normal document flow
  if (!isDraggable) {
    return (
      <div 
        className={className}
        style={{
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`relative transition-shadow duration-200 ${
        isDragging
          ? 'z-50 shadow-[0_0_30px_rgba(0,240,255,0.4)] ring-2 ring-[#00f0ff]'
          : 'z-30 hover:ring-1 hover:ring-[#71c4bd]/40'
      } ${className}`}
      style={{
        transform: `translate3d(${position.x + parallax.x}px, ${position.y + parallax.y}px, 0)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        touchAction: 'none'
      }}
    >
      {/* Draggable Handle Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="w-full px-2.5 py-1 mb-1 rounded-t-lg bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/40 cursor-grab active:cursor-grabbing flex items-center justify-between text-[9px] font-mono text-[#00f0ff] backdrop-blur-md transition-colors select-none"
        title="Arrastra para mover este widget por la pantalla"
      >
        <div className="flex items-center gap-1 font-bold">
          <Move className="w-3 h-3 text-[#00f0ff]" />
          <span>⋮⋮ MOVER: {title.toUpperCase()}</span>
        </div>

        <button
          onClick={handleResetSelf}
          className="p-0.5 rounded hover:bg-white/20 text-[#a8cbc7] hover:text-white"
          title="Restablecer posición original"
        >
          <RotateCcw className="w-2.5 h-2.5" />
        </button>
      </div>

      {children}
    </div>
  );
};
