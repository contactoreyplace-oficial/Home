import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, MediaQuality } from '../types/system';
import {
  X,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Info,
  Smartphone,
  Monitor
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MediaViewerModalProps {
  item: MediaItem | null;
  items: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: MediaItem) => void;
  initialSize?: 'half' | 'full';
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  item,
  items,
  isOpen,
  onClose,
  onSelectItem,
  initialSize = 'half'
}) => {
  const [viewSize, setViewSize] = useState<'half' | 'full'>(initialSize);
  const [quality, setQuality] = useState<MediaQuality>('auto');
  const [svgZoom, setSvgZoom] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoSpeed, setVideoSpeed] = useState<number>(1);
  const [showInfo, setShowInfo] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync initialSize if changed externally
  useEffect(() => {
    setViewSize(initialSize);
  }, [initialSize, item]);

  // Reset zoom and sync video speed on item change
  useEffect(() => {
    setSvgZoom(100);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
    }
  }, [item?.id, videoSpeed]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        setViewSize((prev) => (prev === 'half' ? 'full' : 'half'));
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, item, items]);

  if (!isOpen || !item) return null;

  const currentIndex = items.findIndex((i) => i.id === item.id);

  const handlePrev = () => {
    if (items.length <= 1) return;
    soundManager.playOrbitTick();
    const prevIdx = (currentIndex - 1 + items.length) % items.length;
    onSelectItem(items[prevIdx]);
  };

  const handleNext = () => {
    if (items.length <= 1) return;
    soundManager.playOrbitTick();
    const nextIdx = (currentIndex + 1) % items.length;
    onSelectItem(items[nextIdx]);
  };

  // Device auto-detection logic
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  const detectedResolution = isMobileDevice ? '1080p Móvil' : '4K Ultra HD Pantalla';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl transition-all duration-300 ${
        viewSize === 'full' ? 'p-0' : 'p-3 sm:p-6'
      }`}
    >
      <div
        className={`relative flex flex-col bg-[#030c14] border border-[#71c4bd]/40 shadow-[0_0_100px_rgba(0,240,255,0.3)] overflow-hidden transition-all duration-300 ${
          viewSize === 'full'
            ? 'w-screen h-screen rounded-none'
            : 'w-full max-w-5xl max-h-[90vh] rounded-3xl'
        }`}
      >
        {/* Top Header HUD */}
        <div className="shrink-0 px-4 py-3 bg-[#051520]/90 border-b border-[#71c4bd]/20 flex items-center justify-between gap-3 z-30">
          {/* Left: Category & Title */}
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="shrink-0 font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] font-bold">
              {item.type === 'svg' ? 'SVG 4K VECTOR' : item.type === 'video' ? 'VIDEO HD' : 'IMAGEN HD'}
            </span>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {item.title}
              </h3>
              <span className="text-[10px] font-mono text-[#71c4bd] block truncate">
                {item.category} • {item.aspectRatio}
              </span>
            </div>
          </div>

          {/* Controls: Size toggle, Quality, Fullscreen, Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quality Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-[#09222c] px-2 py-1 rounded-lg border border-[#71c4bd]/30">
              <span className="font-mono text-[9px] text-[#71c4bd] uppercase">Calidad:</span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as MediaQuality)}
                className="bg-transparent text-white font-mono text-[10px] focus:outline-none cursor-pointer"
                title="Seleccionar calidad de renderizado"
              >
                <option value="auto" className="bg-[#051520] text-white">
                  Auto ({isMobileDevice ? '720p/1080p Móvil' : '4K Desktop'})
                </option>
                <option value="4k" className="bg-[#051520] text-white">
                  4K Ultra HD (SVG Infinito)
                </option>
                <option value="1080p" className="bg-[#051520] text-white">
                  1080p Full HD
                </option>
                <option value="720p" className="bg-[#051520] text-white">
                  720p HD (Ahorro)
                </option>
              </select>
            </div>

            {/* View Size Toggle Button (Media Pantalla / Pantalla Completa) */}
            <button
              onClick={() => {
                soundManager.playOrbitTick();
                setViewSize(viewSize === 'half' ? 'full' : 'half');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09222c] hover:bg-[#123947] border border-[#71c4bd]/40 text-xs font-mono text-[#edfffb] transition-all"
              title={viewSize === 'half' ? 'Cambiar a Pantalla Completa (F)' : 'Cambiar a Media Pantalla (F)'}
            >
              {viewSize === 'half' ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span className="hidden md:inline">Pantalla Completa</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span className="hidden md:inline">Media Pantalla</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundManager.playOrbitTick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-[#09222c] hover:bg-rose-900/60 border border-[#71c4bd]/30 text-[#a8cbc7] hover:text-white transition-all"
              title="Cerrar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Stage */}
        <div className="relative flex-1 w-full bg-[#02070b] overflow-hidden flex items-center justify-center p-2 sm:p-4 select-none">
          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 z-30 p-2 sm:p-3 rounded-full bg-[#051520]/80 hover:bg-[#00f0ff]/20 border border-[#71c4bd]/30 text-white transition-all backdrop-blur-md shadow-lg"
                title="Elemento anterior (←)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-3 z-30 p-2 sm:p-3 rounded-full bg-[#051520]/80 hover:bg-[#00f0ff]/20 border border-[#71c4bd]/30 text-white transition-all backdrop-blur-md shadow-lg"
                title="Siguiente elemento (→)"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* RENDER MEDIA BY TYPE */}
          {item.type === 'video' ? (
            <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center">
              <video
                ref={videoRef}
                src={item.url}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                className="w-full h-full object-contain max-h-[85vh] rounded-xl shadow-2xl"
              />
            </div>
          ) : item.type === 'svg' ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center overflow-auto custom-scrollbar p-2">
              <div
                className="transition-transform duration-200 flex items-center justify-center max-w-full max-h-full"
                style={{
                  transform: `scale(${svgZoom / 100})`,
                  transformOrigin: 'center center'
                }}
              >
                {item.url.startsWith('data:image/svg+xml') || item.url.startsWith('<svg') ? (
                  item.url.startsWith('<svg') ? (
                    <div
                      className="w-full h-full flex items-center justify-center drop-shadow-[0_0_30px_rgba(0,240,255,0.35)]"
                      dangerouslySetInnerHTML={{ __html: item.url }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="max-w-[90vw] max-h-[75vh] object-contain drop-shadow-[0_0_30px_rgba(0,240,255,0.35)]"
                    />
                  )
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="max-w-[90vw] max-h-[75vh] object-contain drop-shadow-[0_0_30px_rgba(0,240,255,0.35)]"
                  />
                )}
              </div>
            </div>
          ) : (
            /* Standard or Brand Image */
            <div className="relative w-full h-full flex items-center justify-center overflow-auto custom-scrollbar p-2">
              <img
                src={item.url}
                alt={item.title}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl drop-shadow-[0_0_35px_rgba(0,240,255,0.2)]"
              />
            </div>
          )}

          {/* Floating Controls HUD (Zoom for SVG, Playback for video) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-[#061822]/90 border border-[#71c4bd]/40 backdrop-blur-md flex items-center gap-3 shadow-xl">
            {item.type === 'svg' && (
              <>
                <button
                  onClick={() => setSvgZoom((z) => Math.max(50, z - 25))}
                  className="p-1 rounded text-[#a8cbc7] hover:text-white hover:bg-white/10"
                  title="Reducir zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs text-[#00f0ff] min-w-[45px] text-center font-bold">
                  {svgZoom}%
                </span>
                <button
                  onClick={() => setSvgZoom((z) => Math.min(400, z + 25))}
                  className="p-1 rounded text-[#a8cbc7] hover:text-white hover:bg-white/10"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-white/20" />
                <button
                  onClick={() => setSvgZoom(100)}
                  className="p-1 rounded text-[#a8cbc7] hover:text-white hover:bg-white/10"
                  title="Restablecer zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="hidden sm:inline font-mono text-[9px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                  Nitidez Vectorial Infinita
                </span>
              </>
            )}

            {item.type === 'video' && (
              <>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                        setIsPlaying(true);
                      } else {
                        videoRef.current.pause();
                        setIsPlaying(false);
                      }
                    }
                  }}
                  className="p-1.5 rounded text-white hover:bg-white/10"
                  title={isPlaying ? 'Pausar video' : 'Reproducir video'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (videoRef.current) videoRef.current.muted = !isMuted;
                  }}
                  className="p-1.5 rounded text-white hover:bg-white/10"
                  title={isMuted ? 'Activar audio' : 'Silenciar audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="h-4 w-px bg-white/20" />

                <div className="flex items-center gap-1">
                  {[1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setVideoSpeed(spd);
                        if (videoRef.current) videoRef.current.playbackRate = spd;
                      }}
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        videoSpeed === spd
                          ? 'bg-[#00f0ff] text-black font-bold'
                          : 'text-[#a8cbc7] hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Info toggle */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-1.5 rounded transition-colors ${
                showInfo ? 'text-[#00f0ff] bg-cyan-950/60' : 'text-[#a8cbc7] hover:text-white'
              }`}
              title="Alternar panel informativo"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Description / Metadata Bar (collapsible) */}
        {showInfo && (
          <div className="shrink-0 px-4 py-3 bg-[#051520]/95 border-t border-[#71c4bd]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#c7e5df]">
            <div className="space-y-0.5 max-w-2xl">
              <p className="leading-relaxed text-[11px] sm:text-xs">
                {item.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#09222c] border border-[#71c4bd]/25 text-[#71c4bd]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] text-[#71c4bd]">
              <div className="flex items-center gap-1.5">
                {isMobileDevice ? (
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{detectedResolution}</span>
              </div>
              <span>•</span>
              <span>{currentIndex + 1} de {items.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
