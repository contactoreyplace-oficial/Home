import React, { useState, useEffect, useRef } from 'react';
import {
  SystemPortal,
  DEFAULT_SYSTEMS,
  PlanetTheme,
  ViewMode,
  AppGlobalConfig,
  DEFAULT_APP_CONFIG,
  AudioMode,
  MediaItem
} from './types/system';
import { Planet3D } from './components/Planet3D';
import { ConstellationSky } from './components/ConstellationSky';
import { TopNavbar } from './components/TopNavbar';
import { LocalTelemetry } from './components/LocalTelemetry';
import { OrbitModules } from './components/OrbitModules';
import { MatrixView } from './components/MatrixView';
import { RadarView } from './components/RadarView';
import { TerminalView } from './components/TerminalView';
import { ControlDock } from './components/ControlDock';
import { SystemModal } from './components/SystemModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ScanLog } from './components/ScanLog';
import { SystemLoadingVideo } from './components/SystemLoadingVideo';
import { CursorFollower } from './components/CursorFollower';
import { NewsShowcase } from './components/NewsShowcase';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { MediaStrip } from './components/MediaStrip';
import { MediaViewerModal } from './components/MediaViewerModal';
import { BrandIdentityModal } from './components/BrandIdentityModal';
import { DraggableWidget } from './components/DraggableWidget';
import { WidgetsMenu } from './components/WidgetsMenu';
import { soundManager } from './utils/audio';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  // Systems state with local persistence
  const [systems, setSystems] = useState<SystemPortal[]>(() => {
    try {
      const saved = localStorage.getItem('reyplace_ecosistema_systems');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) return parsed;
      }
    } catch {}
    return DEFAULT_SYSTEMS;
  });

  // Global Config state with local persistence
  const [config, setConfig] = useState<AppGlobalConfig>(() => {
    try {
      const saved = localStorage.getItem('reyplace_app_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.texts && parsed.design && parsed.widgets) {
          return {
            ...DEFAULT_APP_CONFIG,
            ...parsed,
            texts: { ...DEFAULT_APP_CONFIG.texts, ...parsed.texts },
            design: { ...DEFAULT_APP_CONFIG.design, ...parsed.design },
            widgets: { ...DEFAULT_APP_CONFIG.widgets, ...parsed.widgets },
            news: { ...DEFAULT_APP_CONFIG.news, ...parsed.news },
            mediaStrip: {
              ...DEFAULT_APP_CONFIG.mediaStrip,
              ...(parsed.mediaStrip || {}),
              items:
                parsed.mediaStrip && Array.isArray(parsed.mediaStrip.items) && parsed.mediaStrip.items.length > 0
                  ? parsed.mediaStrip.items
                  : DEFAULT_APP_CONFIG.mediaStrip.items
            },
            audio: { ...DEFAULT_APP_CONFIG.audio, ...parsed.audio }
          };
        }
      }
    } catch {}
    return DEFAULT_APP_CONFIG;
  });

  // Orbital simulation state
  const [orbitAngle, setOrbitAngle] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [planetTheme, setPlanetTheme] = useState<PlanetTheme>('oceanic');
  const [viewMode, setViewMode] = useState<ViewMode>('orbit');
  const [isNight, setIsNight] = useState<boolean>(true);

  // Zen Mode (Ocultar widgets para despejar la vista 3D)
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [isHeroCollapsed, setIsHeroCollapsed] = useState<boolean>(false);

  // Audio Mode state
  const [audioMode, setAudioMode] = useState<AudioMode>(config.audio.mode);

  // Active interaction states
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHoveringPlanet, setIsHoveringPlanet] = useState<boolean>(false);
  const [selectedSystem, setSelectedSystem] = useState<SystemPortal | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Brand Identity Modal state
  const [brandModalOpen, setBrandModalOpen] = useState<boolean>(false);

  // Media Viewer Modal state
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(null);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState<boolean>(false);
  const [mediaViewerSize, setMediaViewerSize] = useState<'half' | 'full'>('half');

  // Loading video sequence state
  const [loadingSystem, setLoadingSystem] = useState<SystemPortal | null>(null);
  const [isLoadingVideoOpen, setIsLoadingVideoOpen] = useState<boolean>(false);
  const [pendingLaunchUrl, setPendingLaunchUrl] = useState<string | null>(null);

  // Animation frame loop for smooth orbital drift
  const lastTimeRef = useRef<number>(performance.now());
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  useEffect(() => {
    let animId: number;

    const loop = (time: number) => {
      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      if (!isPausedRef.current && viewModeRef.current === 'orbit') {
        setOrbitAngle((prev) => (prev + delta * 0.08 * speedRef.current) % (Math.PI * 2));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Update soundscape theme when planetTheme changes
  useEffect(() => {
    soundManager.updateTheme(planetTheme);
  }, [planetTheme]);

  // Spatial audio panning when hovering modules or rotating
  useEffect(() => {
    if (hoveredIndex !== null) {
      const a = orbitAngle + (hoveredIndex / systems.length) * Math.PI * 2;
      const pan = Math.cos(a) * 0.85;
      soundManager.setSpatialPan(pan);
      soundManager.boostInteractionActivity();
    } else {
      const ambientPan = Math.sin(orbitAngle) * 0.35;
      soundManager.setSpatialPan(ambientPan);
    }
  }, [hoveredIndex, orbitAngle, systems.length]);

  // Save systems to localStorage
  const handleSaveSystems = (newSystems: SystemPortal[]) => {
    setSystems(newSystems);
    try {
      localStorage.setItem('reyplace_ecosistema_systems', JSON.stringify(newSystems));
    } catch {}
  };

  // Save config to localStorage
  const handleUpdateConfig = (newConfig: AppGlobalConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('reyplace_app_config', JSON.stringify(newConfig));
    } catch {}
  };

  // Launch transition handler
  const handleTriggerLaunch = (sys: SystemPortal) => {
    setLoadingSystem(sys);
    setPendingLaunchUrl(sys.url);
    setIsLoadingVideoOpen(true);
  };

  const handleLoadingComplete = () => {
    setIsLoadingVideoOpen(false);
    if (pendingLaunchUrl) {
      window.open(pendingLaunchUrl, '_blank', 'noopener,noreferrer');
      setPendingLaunchUrl(null);
    }
    setLoadingSystem(null);
  };

  // Media viewer open handler
  const handleOpenMediaViewer = (item: MediaItem, size: 'half' | 'full' = 'half') => {
    setActiveMediaItem(item);
    setMediaViewerSize(size);
    setIsMediaViewerOpen(true);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        soundManager.playOrbitTick();
        setIsPaused((p) => !p);
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        soundManager.playOrbitTick();
        setZenMode((z) => !z);
      } else if (e.key === 'm' || e.key === 'M') {
        soundManager.toggleMute();
      } else if (e.key === 'Escape') {
        setSelectedSystem(null);
        setSettingsOpen(false);
        setIsLoadingVideoOpen(false);
        setIsMediaViewerOpen(false);
        setBrandModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const currentlyHoveredSystem = hoveredIndex !== null ? systems[hoveredIndex] : null;

  return (
    <div className="relative w-full min-h-screen bg-[#02060c] text-[#f0faf8] overflow-hidden flex flex-col font-sans select-none">
      {/* 0. Custom Animated 3D Cyan Cursor Follower */}
      <CursorFollower
        isHoveringInteractive={hoveredIndex !== null || isHoveringPlanet}
        activeLabel={currentlyHoveredSystem ? currentlyHoveredSystem.name : isHoveringPlanet ? 'NEXUS PLANET' : null}
        enabled={config.design.enable3DCursor}
      />

      {/* 1. Deep Space Atmospheric Cosmic Color & Nebula Layers */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 45%, rgba(6, 36, 58, 0.65) 0%, rgba(4, 18, 30, 0.8) 42%, rgba(2, 8, 16, 0.96) 78%, #010408 100%),
            radial-gradient(circle at 82% 22%, rgba(168, 85, 247, 0.18) 0%, transparent 45%),
            radial-gradient(circle at 18% 72%, rgba(0, 240, 255, 0.15) 0%, transparent 42%),
            radial-gradient(circle at 62% 88%, rgba(244, 63, 94, 0.12) 0%, transparent 40%),
            #02060c
          `
        }}
      />

      {/* 2. 4K HD Real-Time SVG Deep Space Background & Constellations */}
      {config.widgets.showConstellations && (
        <ConstellationSky isNight={isNight} glowIntensity={config.design.glowIntensity} />
      )}

      {/* 3. Top Navigation Bar with Official Brand Logo & Zen Mode Button */}
      {config.widgets.showTopNav && (
        <div className={`transition-all duration-500 z-40 ${zenMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
          <TopNavbar
            brandName={config.texts.brandName}
            brandSub={config.texts.brandSub}
            brandSlogan={config.texts.brandSlogan}
            brandLocation={config.texts.brandLocation}
            badge={config.texts.badge}
            onOpenBrandModal={() => {
              soundManager.playSelect();
              setBrandModalOpen(true);
            }}
            onOpenSettings={() => {
              setEditingIndex(0);
              setSettingsOpen(true);
            }}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            draggableWidgets={config.widgets.draggableWidgets}
            onToggleDraggableWidgets={() => {
              handleUpdateConfig({
                ...config,
                widgets: {
                  ...config.widgets,
                  draggableWidgets: !config.widgets.draggableWidgets
                }
              });
            }}
            onResetWidgetPositions={() => {
              window.dispatchEvent(new CustomEvent('reyplace-reset-widget-positions'));
            }}
            zenMode={zenMode}
            onToggleZenMode={() => setZenMode(!zenMode)}
          />
        </div>
      )}

      {/* Zen Mode Floating Pill Notification */}
      {zenMode && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-fadeIn pointer-events-auto">
          <button
            onClick={() => {
              soundManager.playOrbitTick();
              setZenMode(false);
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00f0ff]/50 bg-[#030d14]/85 text-[#00f0ff] font-mono text-xs shadow-[0_0_25px_rgba(0,240,255,0.4)] backdrop-blur-xl hover:bg-[#00f0ff] hover:text-black transition-all hover:scale-105"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Modo Inmersivo Activo · Clic o tecla 'Z' para ver widgets</span>
          </button>
        </div>
      )}

      {/* 4. Upper Space: Hero Intro Header, News Showcase & Telemetry HUD */}
      <div
        className={`relative z-30 px-4 sm:px-8 mt-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pointer-events-auto transition-all duration-500 ${
          zenMode ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100'
        }`}
      >
        {/* Left: Compact Hero Intro Header with collapse option */}
        <div className="max-w-md xl:max-w-lg">
          <div className="flex items-center gap-2">
            <div className="font-mono text-[9px] tracking-[0.3em] text-[#8ddcd1] uppercase flex items-center gap-2">
              <span>{config.texts.eyebrow}</span>
              <span className="text-[#00f0ff]">•</span>
              <span className="text-[#a5e6df]/80">{config.texts.brandLocation}</span>
            </div>
            <button
              onClick={() => setIsHeroCollapsed(!isHeroCollapsed)}
              className="text-[#71c4bd] hover:text-white p-0.5 text-[9px] font-mono"
              title={isHeroCollapsed ? 'Expandir título' : 'Contraer título'}
            >
              {isHeroCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>

          {!isHeroCollapsed && (
            <>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5 mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-white via-[#a5e6df] to-[#00f0ff]">
                {config.texts.heroTitle}
              </h1>
              <p className="text-xs text-[#c7e5df] leading-relaxed line-clamp-1 sm:line-clamp-2">
                {config.texts.heroSubtitle}
              </p>
            </>
          )}
        </div>

        {/* Center: Pasarela Multimedia de Novedades (Movable/Static, Collapsed by default) */}
        {config.widgets.showNewsShowcase && config.news.enabled && (
          <DraggableWidget
            id="news"
            isDraggable={config.widgets.draggableWidgets}
            title="Novedades"
            className="w-full lg:w-auto"
          >
            <NewsShowcase
              items={config.news.items}
              autoplay={config.news.autoplay}
              intervalSec={config.news.autoplayIntervalSec}
              widgetOpacity={config.design.widgetOpacity}
            />
          </DraggableWidget>
        )}

        {/* Right: Telemetry GPS/Weather Card (Movable/Static, Compact by default) */}
        {config.widgets.showTelemetry && (
          <DraggableWidget
            id="telemetry"
            isDraggable={config.widgets.draggableWidgets}
            title="Telemetría"
            className="w-full sm:w-auto shrink-0"
          >
            <LocalTelemetry
              isNight={isNight}
              onNightChange={setIsNight}
              widgetOpacity={config.design.widgetOpacity}
            />
          </DraggableWidget>
        )}
      </div>

      {/* 5. Main Viewport Container: Pure Unobstructed 3D Photorealistic HD Planet Canvas */}
      <main className="relative flex-1 w-full flex items-center justify-center my-auto min-h-[520px]">
        {/* A. 3D WebGL Photorealistic Planet Layer */}
        <Planet3D
          theme={planetTheme}
          isPaused={isPaused || viewMode !== 'orbit'}
          orbitAngle={orbitAngle}
          activeSystemIndex={hoveredIndex}
          dataSurgeActive={config.design.enableDataSurge && hoveredIndex !== null}
          bloomStrength={config.design.bloomStrength * config.design.glowIntensity}
          enableChromaticAberration={config.design.enableChromaticAberration}
          onHoverPlanetChange={setIsHoveringPlanet}
          onRotate={(delta) => {
            soundManager.boostInteractionActivity();
            setOrbitAngle((prev) => (prev - delta) % (Math.PI * 2));
          }}
          onSelectBeacon={(idx) => {
            const sys = systems[idx];
            if (sys) {
              soundManager.playSelect();
              setSelectedSystem(sys);
            }
          }}
        />

        {/* B. Conditional View Overlays */}
        {viewMode === 'orbit' && (
          <>
            {/* Visual Orbital Guides */}
            {config.widgets.showOrbitLines && !zenMode && (
              <>
                <div
                  className="absolute w-[82vw] max-w-[980px] h-[38vh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-[50%] border border-[#89e0d6]/20 shadow-[0_0_40px_rgba(101,212,206,0.1)] pointer-events-none z-10"
                  aria-hidden="true"
                />
                <div
                  className="absolute w-[68vw] max-w-[820px] h-[30vh] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-8 rounded-[50%] border border-[#38bdf8]/15 pointer-events-none z-10 opacity-60"
                  aria-hidden="true"
                />
              </>
            )}

            {/* Orbiting Interactive System Cards with 3D Depth Parallax */}
            <OrbitModules
              systems={systems}
              orbitAngle={orbitAngle}
              hoveredIndex={hoveredIndex}
              onHoverIndex={setHoveredIndex}
              onSelectSystem={setSelectedSystem}
              cardScale={config.design.cardScale}
              widgetOpacity={config.design.widgetOpacity}
            />

            {/* Discreet Interaction Footer Instruction */}
            {!zenMode && (
              <div className="hidden sm:block absolute bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20">
                <span className="font-mono text-[9px] tracking-widest text-[#a8cbc7] uppercase px-3 py-1 rounded-full bg-[#081b22]/70 border border-[#71c4bd]/20 backdrop-blur-sm">
                  {config.texts.orbitNote}
                </span>
              </div>
            )}
          </>
        )}

        {viewMode === 'matrix' && (
          <MatrixView systems={systems} onSelectSystem={setSelectedSystem} />
        )}

        {viewMode === 'radar' && (
          <RadarView systems={systems} onSelectSystem={setSelectedSystem} />
        )}

        {viewMode === 'terminal' && (
          <TerminalView systems={systems} onSelectSystem={setSelectedSystem} />
        )}
      </main>

      {/* 6. Floating Interactive Widgets Menu (Originkit / Flutter / Apple FAB Style) */}
      {!zenMode && (
        <WidgetsMenu
          showMediaStrip={config.widgets.showMediaStrip}
          onToggleMediaStrip={() => {
            handleUpdateConfig({
              ...config,
              widgets: {
                ...config.widgets,
                showMediaStrip: !config.widgets.showMediaStrip
              }
            });
          }}
          showScanLog={config.widgets.showScanLog}
          onToggleScanLog={() => {
            handleUpdateConfig({
              ...config,
              widgets: {
                ...config.widgets,
                showScanLog: !config.widgets.showScanLog
              }
            });
          }}
          showAudioPlayer={config.widgets.showAudioPlayer}
          onToggleAudioPlayer={() => {
            handleUpdateConfig({
              ...config,
              widgets: {
                ...config.widgets,
                showAudioPlayer: !config.widgets.showAudioPlayer
              }
            });
          }}
          showTelemetry={config.widgets.showTelemetry}
          onToggleTelemetry={() => {
            handleUpdateConfig({
              ...config,
              widgets: {
                ...config.widgets,
                showTelemetry: !config.widgets.showTelemetry
              }
            });
          }}
          showNewsShowcase={config.widgets.showNewsShowcase}
          onToggleNewsShowcase={() => {
            handleUpdateConfig({
              ...config,
              widgets: {
                ...config.widgets,
                showNewsShowcase: !config.widgets.showNewsShowcase
              }
            });
          }}
          widgetOpacity={config.design.widgetOpacity}
        />
      )}

      {/* 7. Discreet Tira Multimedia Floating Pill / Dock */}
      {config.widgets.showMediaStrip && config.mediaStrip.enabled && !zenMode && (
        <div className="fixed bottom-20 right-6 z-25 transition-all duration-300">
          <MediaStrip
            items={config.mediaStrip.items}
            onOpenViewer={handleOpenMediaViewer}
            onOpenSettingsMedia={() => {
              setSettingsOpen(true);
            }}
            widgetOpacity={config.design.widgetOpacity}
          />
        </div>
      )}

      {/* 8. Persistent Monospace 'Scan Log' Window */}
      {config.widgets.showScanLog && !zenMode && (
        <div className="fixed bottom-20 left-6 z-30 transition-all duration-300">
          <ScanLog
            hoveredSystem={currentlyHoveredSystem}
            widgetOpacity={config.design.widgetOpacity}
          />
        </div>
      )}

      {/* 9. Reyplace Music Player & Soundscape Floating HUD */}
      {config.widgets.showAudioPlayer && !zenMode && (
        <div className="fixed bottom-36 left-6 z-30 transition-all duration-300">
          <AudioPlayerWidget
            currentTheme={planetTheme}
            audioMode={audioMode}
            onAudioModeChange={setAudioMode}
            widgetOpacity={config.design.widgetOpacity}
          />
        </div>
      )}

      {/* 9. Unified Collapsible Bottom Dock */}
      {config.widgets.showBottomDock && (
        <div className={`transition-all duration-500 ${zenMode ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
          <ControlDock
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            planetTheme={planetTheme}
            onThemeChange={setPlanetTheme}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            speed={speed}
            onSpeedChange={setSpeed}
            onOpenSettings={() => {
              setEditingIndex(0);
              setSettingsOpen(true);
            }}
            isDeepSpace={zenMode}
            onToggleDeepSpace={() => setZenMode(!zenMode)}
          />
        </div>
      )}

      {/* 10. System Detail & Launch Modal */}
      <SystemModal
        system={selectedSystem}
        onClose={() => setSelectedSystem(null)}
        onEditSystem={(sys) => {
          setEditingIndex(sys.index - 1);
          setSettingsOpen(true);
        }}
        onTriggerLaunchSequence={handleTriggerLaunch}
      />

      {/* 11. Multimedia Viewer Modal (Media Pantalla / Pantalla Completa & Calidad) */}
      <MediaViewerModal
        item={activeMediaItem}
        items={config.mediaStrip.items}
        isOpen={isMediaViewerOpen}
        onClose={() => {
          setIsMediaViewerOpen(false);
          setActiveMediaItem(null);
        }}
        onSelectItem={setActiveMediaItem}
        initialSize={mediaViewerSize}
      />

      {/* 12. Official Brand Identity Showcase Modal */}
      <BrandIdentityModal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
      />

      {/* 13. Video Loading Transition Sequence */}
      <SystemLoadingVideo
        system={loadingSystem}
        isOpen={isLoadingVideoOpen}
        onComplete={handleLoadingComplete}
        onCancel={() => {
          setIsLoadingVideoOpen(false);
          setLoadingSystem(null);
          setPendingLaunchUrl(null);
        }}
      />

      {/* 14. Settings Configuration Drawer */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        systems={systems}
        onSaveSystems={handleSaveSystems}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        initialEditIndex={editingIndex}
        onPreviewVideo={(sys) => {
          setLoadingSystem(sys);
          setPendingLaunchUrl(null);
          setIsLoadingVideoOpen(true);
        }}
        onPreviewMedia={(mediaItem, size) => {
          handleOpenMediaViewer(mediaItem, size);
        }}
      />
    </div>
  );
}
