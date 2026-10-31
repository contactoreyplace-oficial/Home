import React, { useState, useEffect } from 'react';
import { NewsItem } from '../types/system';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, Newspaper, ChevronUp, ChevronDown } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface NewsShowcaseProps {
  items: NewsItem[];
  autoplay?: boolean;
  intervalSec?: number;
  widgetOpacity?: number;
}

export const NewsShowcase: React.FC<NewsShowcaseProps> = ({
  items,
  autoplay = true,
  intervalSec = 6,
  widgetOpacity = 0.45
}) => {
  const activeItems = items.filter((item) => item.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Default collapsed to keep UI clean and unobstructed
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (!autoplay || isPaused || activeItems.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [autoplay, isPaused, activeItems.length, intervalSec]);

  if (activeItems.length === 0) return null;

  const current = activeItems[currentIndex] || activeItems[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playOrbitTick();
    setCurrentIndex((prev) => (prev - 1 + activeItems.length) % activeItems.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playOrbitTick();
    setCurrentIndex((prev) => (prev + 1) % activeItems.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative z-30 w-full sm:w-[320px] lg:w-[360px] pointer-events-auto transition-all duration-300"
      aria-label="Pasarela Multimedia de Novedades"
    >
      <div
        className="rounded-2xl border border-[#71c4bd]/25 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: `rgba(4, 18, 25, ${Math.max(0.25, widgetOpacity)})`
        }}
      >
        {/* Header Bar / Collapsed Strip */}
        <div
          onClick={() => {
            soundManager.playHover();
            setIsCollapsed(!isCollapsed);
          }}
          className="px-3.5 py-2 border-b border-[#71c4bd]/15 flex items-center justify-between bg-[#061822]/70 cursor-pointer select-none hover:bg-[#0c2b36]/80 transition-colors"
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#9de9df] font-bold shrink-0">
              NOVEDADES
            </span>
            {isCollapsed && (
              <span className="text-[10px] text-[#c7e5df] truncate font-sans ml-1">
                • {current.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="font-mono text-[9px] text-[#71c4bd]/70">
              {currentIndex + 1}/{activeItems.length}
            </span>
            <span className="text-[#a8cbc7] hover:text-white p-0.5">
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </span>
          </div>
        </div>

        {/* Content Body (When Expanded) */}
        {!isCollapsed && (
          <div className="p-3.5 space-y-2.5">
            {/* Tag badge & Date */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
                style={{
                  borderColor: `${current.badgeColor}60`,
                  backgroundColor: `${current.badgeColor}20`,
                  color: current.badgeColor
                }}
              >
                {current.badge}
              </span>
              <span className="font-mono text-[9px] text-[#8aa8a6]">
                {current.date}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
              {current.title}
            </h4>

            {/* Description */}
            <p className="text-[11px] text-[#c7e5df] leading-relaxed line-clamp-3">
              {current.description}
            </p>

            {/* Footer Navigation */}
            <div className="pt-2 border-t border-[#71c4bd]/15 flex items-center justify-between gap-2">
              {current.linkUrl && current.linkUrl !== '#' ? (
                <a
                  href={current.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-[#00f0ff] hover:underline flex items-center gap-1"
                >
                  <span>Conocer más</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="font-mono text-[10px] text-[#71c4bd]/70">
                  Reyplace Ecosistema
                </span>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-md text-[#a8cbc7] hover:text-white hover:bg-white/10 transition-colors"
                  title="Noticia anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-md text-[#a8cbc7] hover:text-white hover:bg-white/10 transition-colors"
                  title="Siguiente noticia"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
