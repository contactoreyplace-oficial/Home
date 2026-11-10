import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  SystemPortal,
  ViewMode,
  PlanetTheme,
  AppGlobalConfig
} from '../types/system';
import {
  Search,
  Command,
  ArrowRight,
  Shield,
  Cpu,
  Server,
  BarChart3,
  Lock,
  GitBranch,
  CreditCard,
  Database,
  Users,
  Activity,
  Share2,
  LayoutGrid,
  Globe,
  Radio,
  Terminal,
  MapPin,
  Eye,
  Sliders,
  Sparkles,
  Contrast,
  Zap,
  Play,
  Pause,
  Compass,
  Download,
  X
} from 'lucide-react';
import { tacticalFeedback } from '../utils/tacticalFeedback';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  systems: SystemPortal[];
  onSelectSystem: (sys: SystemPortal) => void;
  onLaunchSystem: (sys: SystemPortal) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  planetTheme: PlanetTheme;
  onThemeChange: (theme: PlanetTheme) => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  config: AppGlobalConfig;
  onUpdateConfig: (config: AppGlobalConfig) => void;
  onOpenBrandModal: () => void;
  onOpenSettings: () => void;
  onInstallPWA?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Sistemas' | 'Vistas' | 'Ajustes' | 'Temas' | 'Ecosistema';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  shortcut?: string;
  action: () => void;
}

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  ShieldCheck: <Shield className="w-4 h-4 text-emerald-400" />,
  Cpu: <Cpu className="w-4 h-4 text-cyan-400" />,
  Server: <Server className="w-4 h-4 text-blue-400" />,
  BarChart3: <BarChart3 className="w-4 h-4 text-purple-400" />,
  Lock: <Lock className="w-4 h-4 text-rose-400" />,
  GitBranch: <GitBranch className="w-4 h-4 text-amber-400" />,
  CreditCard: <CreditCard className="w-4 h-4 text-teal-400" />,
  Database: <Database className="w-4 h-4 text-pink-400" />,
  Users: <Users className="w-4 h-4 text-yellow-400" />,
  Activity: <Activity className="w-4 h-4 text-indigo-400" />,
  Share2: <Share2 className="w-4 h-4 text-emerald-300" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4 text-purple-300" />
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  systems,
  onSelectSystem,
  onLaunchSystem,
  viewMode,
  onViewModeChange,
  planetTheme,
  onThemeChange,
  zenMode,
  onToggleZenMode,
  isPaused,
  onTogglePause,
  config,
  onUpdateConfig,
  onOpenBrandModal,
  onOpenSettings,
  onInstallPWA
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      tacticalFeedback.vibrate('light');
    }
  }, [isOpen]);

  // Build command catalogue
  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    // 1. Systems & Portals
    systems.forEach((sys) => {
      list.push({
        id: `sys-${sys.id}`,
        category: 'Sistemas',
        title: sys.name,
        subtitle: `${sys.category} · ${sys.tagline} (${sys.latencyMs}ms)`,
        icon: SYSTEM_ICONS[sys.icon] || <Globe className="w-4 h-4 text-cyan-400" />,
        badge: sys.status.toUpperCase(),
        badgeColor: sys.status === 'operational' ? '#10b981' : '#f59e0b',
        shortcut: `↵ Abrir #${sys.index}`,
        action: () => {
          tacticalFeedback.trigger('medium', 'subtle');
          onSelectSystem(sys);
          onClose();
        }
      });
    });

    // 2. View Modes
    const viewModes: { id: ViewMode; name: string; desc: string; icon: React.ReactNode }[] = [
      { id: 'orbit', name: 'Vista Orbital 3D', desc: 'Esfera planetaria con satélites en órbita activa', icon: <Globe className="w-4 h-4 text-cyan-400" /> },
      { id: 'matrix', name: 'Matriz Holográfica', desc: 'Cuadrícula espacial con tarjetas de telemetría', icon: <LayoutGrid className="w-4 h-4 text-purple-400" /> },
      { id: 'radar', name: 'Radar Cúbico 3D', desc: 'Escaneo polar con rastreo de nodos y frecuencias', icon: <Radio className="w-4 h-4 text-emerald-400" /> },
      { id: 'terminal', name: 'Terminal Cuántica CLI', desc: 'Consola interactiva de comandos del ecosistema', icon: <Terminal className="w-4 h-4 text-amber-400" /> },
      { id: 'map', name: 'Mapa Satelital Google Maps', desc: 'Navegación geográfica en tiempo real desde Sinaloa', icon: <MapPin className="w-4 h-4 text-rose-400" /> }
    ];

    viewModes.forEach((vm) => {
      list.push({
        id: `view-${vm.id}`,
        category: 'Vistas',
        title: vm.name,
        subtitle: vm.desc,
        icon: vm.icon,
        badge: viewMode === vm.id ? 'ACTIVO' : undefined,
        badgeColor: '#00f0ff',
        action: () => {
          tacticalFeedback.trigger('medium', 'subtle');
          onViewModeChange(vm.id);
          onClose();
        }
      });
    });

    // 3. Settings & Controls
    list.push({
      id: 'action-zen',
      category: 'Ajustes',
      title: zenMode ? 'Desactivar Modo Zen (Mostrar UI)' : 'Activar Modo Zen Inmersivo',
      subtitle: 'Oculta todos los widgets flotantes para una experiencia pura 3D',
      icon: <Eye className="w-4 h-4 text-teal-400" />,
      shortcut: 'Z',
      action: () => {
        tacticalFeedback.trigger('medium', 'subtle');
        onToggleZenMode();
        onClose();
      }
    });

    list.push({
      id: 'action-pause',
      category: 'Ajustes',
      title: isPaused ? 'Reanudar Simulación Orbital' : 'Pausar Simulación Orbital',
      subtitle: 'Detiene o reanuda la rotación del planeta y satélites',
      icon: isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />,
      shortcut: 'Espacio',
      action: () => {
        tacticalFeedback.trigger('light', 'subtle');
        onTogglePause();
        onClose();
      }
    });

    list.push({
      id: 'action-high-contrast',
      category: 'Ajustes',
      title: config.design.highContrast ? 'Desactivar Alto Contraste' : 'Activar Alto Contraste Apple-Glass',
      subtitle: 'Intensifica bordes, saturación y brillo para visibilidad con luz ambiental',
      icon: <Contrast className="w-4 h-4 text-cyan-300" />,
      action: () => {
        tacticalFeedback.trigger('heavy', 'subtle');
        onUpdateConfig({
          ...config,
          design: {
            ...config.design,
            highContrast: !config.design.highContrast
          }
        });
        onClose();
      }
    });

    list.push({
      id: 'action-data-surge',
      category: 'Ajustes',
      title: config.design.enableDataSurge ? 'Desactivar Sobretensión de Datos' : 'Activar Sobretensión de Datos',
      subtitle: 'Genera pulsos de líneas cuánticas hacia el núcleo planetario al interactuar',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      action: () => {
        tacticalFeedback.trigger('medium', 'subtle');
        onUpdateConfig({
          ...config,
          design: {
            ...config.design,
            enableDataSurge: !config.design.enableDataSurge
          }
        });
        onClose();
      }
    });

    // 4. Planet Themes
    const themes: { id: PlanetTheme; name: string; desc: string }[] = [
      { id: 'oceanic', name: 'Tema Oceánico Índigo', desc: 'Aguas cristalinas turquesas y continentes verdes' },
      { id: 'real-earth', name: 'Tema Tierra Real Fotorrealista', desc: 'Relieve continental con casquetes polares HD' },
      { id: 'cyber', name: 'Tema Cyberpunk Neón', desc: 'Océanos esmeralda y líneas de código brillantes' },
      { id: 'cyber-industrial', name: 'Tema Cyber-Industrial', desc: 'Blindaje metálico, placas hexagonales y circuitos dorados' },
      { id: 'nebula', name: 'Tema Nebulosa Púrpura', desc: 'Atmósfera mística violeta con resplandores magenta' },
      { id: 'aurora', name: 'Tema Aurora Boreal Boreal', desc: 'Resonancia esmeralda con anillos boreales activos' }
    ];

    themes.forEach((th) => {
      list.push({
        id: `theme-${th.id}`,
        category: 'Temas',
        title: th.name,
        subtitle: th.desc,
        icon: <Compass className="w-4 h-4 text-sky-400" />,
        badge: planetTheme === th.id ? 'ACTIVO' : undefined,
        badgeColor: '#00f0ff',
        action: () => {
          tacticalFeedback.trigger('medium', 'subtle');
          onThemeChange(th.id);
          onClose();
        }
      });
    });

    // 5. Brand & PWA Actions
    list.push({
      id: 'brand-identity',
      category: 'Ecosistema',
      title: 'Identidad de Marca REYPLACE.MX',
      subtitle: 'Corona 3D HD, logotipo SVG optimizado y manifiesto corporativo',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      action: () => {
        tacticalFeedback.trigger('light', 'subtle');
        onOpenBrandModal();
        onClose();
      }
    });

    list.push({
      id: 'open-settings',
      category: 'Ecosistema',
      title: 'Panel de Configuración General',
      subtitle: 'Personalizar textos, tipografía, efectos visuales y audio',
      icon: <Sliders className="w-4 h-4 text-cyan-400" />,
      shortcut: 'S',
      action: () => {
        tacticalFeedback.trigger('light', 'subtle');
        onOpenSettings();
        onClose();
      }
    });

    if (onInstallPWA) {
      list.push({
        id: 'install-pwa',
        category: 'Ecosistema',
        title: 'Instalar Reyplace Super PWA',
        subtitle: 'Instala la aplicación en tu dispositivo para acceso rápido y modo offline',
        icon: <Download className="w-4 h-4 text-emerald-400" />,
        action: () => {
          tacticalFeedback.trigger('heavy', 'medium');
          onInstallPWA();
          onClose();
        }
      });
    }

    return list;
  }, [
    systems,
    viewMode,
    planetTheme,
    zenMode,
    isPaused,
    config,
    onSelectSystem,
    onViewModeChange,
    onToggleZenMode,
    onTogglePause,
    onUpdateConfig,
    onThemeChange,
    onOpenBrandModal,
    onOpenSettings,
    onInstallPWA,
    onClose
  ]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  // Keyboard navigation within command palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        tacticalFeedback.vibrate('tick');
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        tacticalFeedback.vibrate('tick');
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Backdrop Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl rounded-2xl apple-glass border border-[#00f0ff]/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[82vh] animate-slideInDown">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.03]">
          <Search className="w-5 h-5 text-[#00f0ff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Escribe un comando, sistema (#1..#12), vista o ajuste..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-gray-400 font-sans focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-gray-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Categories / Filter summary pill */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/20 text-[10px] font-mono text-[#8ddcd1] overflow-x-auto">
          <span className="text-gray-400">FILTROS:</span>
          {['Todos', 'Sistemas', 'Vistas', 'Ajustes', 'Temas'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setQuery(filter === 'Todos' ? '' : filter);
                setSelectedIndex(0);
              }}
              className={`px-2 py-0.5 rounded-full border transition-all ${
                (filter === 'Todos' && !query) || query.toLowerCase() === filter.toLowerCase()
                  ? 'border-[#00f0ff] bg-[#00f0ff]/15 text-[#00f0ff]'
                  : 'border-white/10 text-gray-300 hover:border-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
          <span className="ml-auto text-gray-500 hidden sm:inline">
            {filteredCommands.length} resultados
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.04]"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Command className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#00f0ff]" />
              <p className="text-sm font-mono">No se encontraron resultados para "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">
                Intenta buscar por nombre de sistema, vista ("mapa", "radar"), o comando ("zen", "pausar").
              </p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#00f0ff]/20 to-[#a855f7]/15 border border-[#00f0ff]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)] text-white'
                      : 'text-gray-300 hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#00f0ff]/25 border border-[#00f0ff]/60 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate text-white">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider"
                            style={{
                              backgroundColor: `${cmd.badgeColor || '#00f0ff'}20`,
                              color: cmd.badgeColor || '#00f0ff',
                              border: `1px solid ${cmd.badgeColor || '#00f0ff'}50`
                            }}
                          >
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{cmd.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-gray-400">
                        {cmd.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight className="w-4 h-4 text-[#00f0ff]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-black/40 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-gray-300">↑↓</kbd> Navegar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-gray-300">↵</kbd> Ejecutar
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-gray-300">ESC</kbd> Cerrar
            </span>
          </div>
          <span className="text-[#00f0ff] hidden sm:inline">Reyplace Ecosistema OS</span>
        </div>
      </div>
    </div>
  );
};
