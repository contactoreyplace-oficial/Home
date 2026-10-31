import React, { useState, useRef } from 'react';
import { MediaItem, MediaType } from '../types/system';
import {
  Film,
  Sparkles,
  Maximize2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Play,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MediaStripProps {
  items: MediaItem[];
  onOpenViewer: (item: MediaItem, size: 'half' | 'full') => void;
  onOpenSettingsMedia?: () => void;
  widgetOpacity?: number;
}

export const MediaStrip: React.FC<MediaStripProps> = ({
  items,
  onOpenViewer,
  onOpenSettingsMedia,
  widgetOpacity = 0.45
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // Starts collapsed by default so it does NOT block the 3D realistic planet
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'svg') return item.type === 'svg';
    if (selectedCategory === 'video') return item.type === 'video';
    if (selectedCategory === 'image') return item.type === 'image';
    if (selectedCategory === 'brand') return item.category.toLowerCase().includes('marca') || item.category.toLowerCase().includes('identidad');
    return true;
  });

  const handleScroll = (direction: 'left' | 'right') => {
    soundManager.playOrbitTick();
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // If collapsed, render as an ultra-compact, unobtrusive floating pill
  if (isCollapsed) {
    return (
      <div className="relative z-20 flex justify-center px-4 pointer-events-auto">
        <button
          onClick={() => {
            soundManager.playOrbitTick();
            setIsCollapsed(false);
          }}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#71c4bd]/35 bg-[#030e14]/75 hover:bg-[#072430]/90 text-xs font-mono text-[#a5e6df] hover:text-white shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#00f0ff]/60"
          title="Ver galería multimedia de videos, imágenes y SVG 4K"
        >
          <Film className="w-3.5 h-3.5 text-[#00f0ff] group-hover:rotate-12 transition-transform" />
          <span className="font-bold tracking-wider text-[11px]">TIRA MULTIMEDIA & SVG ({items.length})</span>
          <span className="text-[10px] text-[#71c4bd] bg-[#00f0ff]/10 px-2 py-0.5 rounded-full border border-[#00f0ff]/30 font-semibold">
            Desplegar ▾
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative z-20 w-full max-w-5xl mx-auto px-4 pointer-events-auto transition-all duration-300"
      aria-label="Tira Multimedia Central Reyplace"
    >
      <div
        className="rounded-2xl border border-[#71c4bd]/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: `rgba(4, 18, 25, ${Math.max(0.35, widgetOpacity)})`
        }}
      >
        {/* Strip Header */}
        <div className="px-4 py-2 border-b border-[#71c4bd]/15 flex flex-wrap items-center justify-between gap-2 bg-[#051520]/80">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]">
              <Film className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#9de9df] font-bold">
                TIRA MULTIMEDIA & SVG 4K
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] font-mono text-[#71c4bd]/80">
                Imágenes, Videos y Vectores Ultra HD
              </span>
            </div>
          </div>

          {/* Category Chips & Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="hidden xs:flex items-center gap-1 bg-[#09222c]/80 p-0.5 rounded-lg border border-[#71c4bd]/20">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'brand', label: 'Marca' },
                { id: 'svg', label: 'SVG 4K' },
                { id: 'video', label: 'Videos' },
                { id: 'image', label: 'Imágenes' }
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => {
                    soundManager.playOrbitTick();
                    setSelectedCategory(chip.id);
                  }}
                  className={`font-mono text-[9px] px-2 py-0.5 rounded-md transition-colors ${
                    selectedCategory === chip.id
                      ? 'bg-[#00f0ff] text-black font-bold'
                      : 'text-[#a8cbc7] hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Quick Add media button */}
            {onOpenSettingsMedia && (
              <button
                onClick={() => {
                  soundManager.playSelect();
                  onOpenSettingsMedia();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#00f0ff]/15 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[9px] font-bold transition-all"
                title="Subir SVG o Multimedia en Configuración"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden md:inline">Subir Contenido</span>
              </button>
            )}

            {/* Scroll navigation arrows */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-1 rounded text-[#a8cbc7] hover:text-white hover:bg-white/10 transition-colors"
                title="Desplazar a la izquierda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1 rounded text-[#a8cbc7] hover:text-white hover:bg-white/10 transition-colors"
                title="Desplazar a la derecha"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => {
                soundManager.playOrbitTick();
                setIsCollapsed(true);
              }}
              className="p-1 text-[#a8cbc7] hover:text-white transition-colors"
              title="Ocultar tira multimedia"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Content */}
        <div
          ref={scrollRef}
          className="p-3 flex items-center gap-3 overflow-x-auto custom-scrollbar scroll-smooth"
        >
          {filteredItems.map((item) => {
            const isSvg = item.type === 'svg';
            const isVideo = item.type === 'video';

            return (
              <div
                key={item.id}
                className="group relative shrink-0 w-52 sm:w-60 rounded-xl overflow-hidden border border-[#71c4bd]/25 bg-[#030d14]/90 hover:border-[#00f0ff]/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail Container */}
                <div className="relative w-full h-28 bg-[#02080d] overflow-hidden flex items-center justify-center">
                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/75 border border-[#71c4bd]/40 text-[#00f0ff] backdrop-blur-sm">
                    {isSvg ? (
                      <>
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        <span>SVG 4K</span>
                      </>
                    ) : isVideo ? (
                      <>
                        <Play className="w-2.5 h-2.5 text-amber-400" />
                        <span>VIDEO HD</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />
                        <span>IMAGEN</span>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Image or SVG */}
                  {isSvg && item.url.startsWith('<svg') ? (
                    <div
                      className="w-full h-full p-2 flex items-center justify-center scale-75 group-hover:scale-90 transition-transform duration-300"
                      dangerouslySetInnerHTML={{ __html: item.url }}
                    />
                  ) : (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {/* Hover Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => {
                        soundManager.playSelect();
                        onOpenViewer(item, 'half');
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-[#09222c] hover:bg-[#154657] border border-[#00f0ff]/60 text-white font-mono text-[9px] transition-transform hover:scale-105"
                      title="Abrir en Media Pantalla"
                    >
                      <Eye className="w-3 h-3 text-[#00f0ff]" />
                      <span>Media</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playSelect();
                        onOpenViewer(item, 'full');
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-[#00f0ff] to-[#0ea5e9] text-black font-bold font-mono text-[9px] transition-transform hover:scale-105 shadow-md"
                      title="Abrir en Pantalla Completa"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Completa</span>
                    </button>
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[8px] text-[#71c4bd] block uppercase">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover:text-[#00f0ff] transition-colors">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-[#71c4bd]/15 flex items-center justify-between text-[9px] font-mono text-[#a8cbc7]">
                    <span>{item.aspectRatio}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          soundManager.playSelect();
                          onOpenViewer(item, 'half');
                        }}
                        className="text-[#00f0ff] hover:underline"
                      >
                        Ver
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => {
                          soundManager.playSelect();
                          onOpenViewer(item, 'full');
                        }}
                        className="text-white hover:text-[#00f0ff]"
                      >
                        ⛶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
