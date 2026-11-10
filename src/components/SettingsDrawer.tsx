import React, { useState } from 'react';
import {
  SystemPortal,
  SystemCategory,
  LoadingVideoStyle,
  AppGlobalConfig,
  NewsItem,
  MediaItem,
  MediaType,
  DEFAULT_SYSTEMS,
  DEFAULT_APP_CONFIG,
  DEFAULT_MEDIA_ITEMS
} from '../types/system';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  Sparkles,
  Type,
  Palette,
  Layout,
  Video,
  Play,
  Film,
  Newspaper,
  Plus,
  Trash2,
  ExternalLink,
  Sliders,
  Music,
  Radio,
  Image as ImageIcon,
  Eye,
  FileCode,
  Move,
  Lock,
  CloudSun,
  Smartphone,
  Vibrate,
  ShieldCheck
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { tacticalFeedback } from '../utils/tacticalFeedback';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  systems: SystemPortal[];
  onSaveSystems: (newSystems: SystemPortal[]) => void;
  config: AppGlobalConfig;
  onUpdateConfig: (newConfig: AppGlobalConfig) => void;
  initialEditIndex?: number | null;
  onPreviewVideo?: (system: SystemPortal) => void;
  onPreviewMedia?: (mediaItem: MediaItem, size: 'half' | 'full') => void;
}

const CATEGORIES: SystemCategory[] = [
  'Core',
  'AI & Data',
  'Infraestructura',
  'Seguridad',
  'Operaciones',
  'Negocio'
];

const LOADING_STYLES: { id: LoadingVideoStyle; label: string; desc: string }[] = [
  { id: 'warp-drive', label: 'Salto Hiperespacial', desc: 'Efecto de velocidad luz con haces cuánticos' },
  { id: 'quantum-matrix', label: 'Cascada Digital Matrix', desc: 'Lluvia de caracteres binarios y criptográficos' },
  { id: 'orbital-grid', label: 'Malla de Radar 3D', desc: 'Topografía vectorial con barrido de frecuencia' },
  { id: 'neural-synapse', label: 'Red Neuronal Sináptica', desc: 'Nodos de inteligencia artificial con pulsos violetas' },
  { id: 'hazard-core', label: 'Núcleo de Advertencia', desc: 'Diafragma industrial de seguridad y alta energía' },
  { id: 'hologram-forge', label: 'Forja Holográfica', desc: 'Ensamblado geométrico tridimensional' },
  { id: 'custom-media', label: 'Video / Archivo Personalizado', desc: 'Reproduce archivo MP4/WebM o URL subida' }
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  systems,
  onSaveSystems,
  config,
  onUpdateConfig,
  initialEditIndex,
  onPreviewVideo,
  onPreviewMedia
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'systems' | 'media' | 'news' | 'texts' | 'design' | 'widgets'>('systems');
  const [selectedSystemIndex, setSelectedSystemIndex] = useState<number>(initialEditIndex ?? 0);
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Media strip creation form state
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState('Identidad de Marca');
  const [newMediaType, setNewMediaType] = useState<MediaType>('svg');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaDesc, setNewMediaDesc] = useState('');
  const [newMediaRatio, setNewMediaRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16'>('16:9');
  const [newMediaTags, setNewMediaTags] = useState('SVG 4K, Vectorial');
  const [rawSvgInput, setRawSvgInput] = useState('');

  if (!isOpen) return null;

  const currentSys = systems[selectedSystemIndex] || systems[0];

  const handleUpdateSystemField = (field: keyof SystemPortal, value: unknown) => {
    const updated = [...systems];
    updated[selectedSystemIndex] = {
      ...updated[selectedSystemIndex],
      [field]: value
    };
    onSaveSystems(updated);
  };

  const handleUpdateText = (field: keyof AppGlobalConfig['texts'], value: string) => {
    onUpdateConfig({
      ...config,
      texts: {
        ...config.texts,
        [field]: value
      }
    });
  };

  const handleUpdateDesign = (field: keyof AppGlobalConfig['design'], value: unknown) => {
    onUpdateConfig({
      ...config,
      design: {
        ...config.design,
        [field]: value
      }
    });
  };

  const handleUpdateWeather = (field: keyof AppGlobalConfig['weather'], value: unknown) => {
    onUpdateConfig({
      ...config,
      weather: {
        ...(config.weather || { mode: 'aurora', intensity: 1.0 }),
        [field]: value
      }
    });
  };

  const handleUpdateWidget = (field: keyof AppGlobalConfig['widgets'], value: boolean) => {
    onUpdateConfig({
      ...config,
      widgets: {
        ...config.widgets,
        [field]: value
      }
    });
  };

  // News Items handlers
  const handleUpdateNewsItem = (index: number, field: keyof NewsItem, value: unknown) => {
    const updatedItems = [...config.news.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    onUpdateConfig({
      ...config,
      news: {
        ...config.news,
        items: updatedItems
      }
    });
  };

  const handleAddNewsItem = () => {
    soundManager.playOrbitTick();
    const newItem: NewsItem = {
      id: `news-${Date.now()}`,
      title: 'Nueva Noticia del Ecosistema',
      badge: 'NOVEDAD',
      badgeColor: '#00f0ff',
      description: 'Breve descripción de la actualización o avance implementado en la plataforma.',
      date: 'HOY',
      linkUrl: '#',
      mediaType: 'pulse',
      active: true
    };
    onUpdateConfig({
      ...config,
      news: {
        ...config.news,
        items: [newItem, ...config.news.items]
      }
    });
  };

  const handleDeleteNewsItem = (index: number) => {
    soundManager.playOrbitTick();
    const updatedItems = config.news.items.filter((_, idx) => idx !== index);
    onUpdateConfig({
      ...config,
      news: {
        ...config.news,
        items: updatedItems
      }
    });
  };

  // Media Items Handlers
  const handleAddMediaItem = () => {
    const urlToUse = rawSvgInput.trim() ? rawSvgInput.trim() : newMediaUrl.trim();
    if (!newMediaTitle.trim() || !urlToUse) {
      alert('Por favor ingresa un título y un archivo/código/URL multimedia.');
      return;
    }

    soundManager.playSelect();
    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: newMediaTitle.trim(),
      category: newMediaCategory.trim() || 'General',
      type: newMediaType,
      url: urlToUse,
      thumbnailUrl: newMediaType === 'svg' ? urlToUse : (newMediaUrl || urlToUse),
      description: newMediaDesc.trim() || 'Elemento multimedia de alta calidad para el portal Reyplace.',
      aspectRatio: newMediaRatio,
      dateAdded: 'HOY',
      tags: newMediaTags.split(',').map((t) => t.trim()).filter(Boolean)
    };

    onUpdateConfig({
      ...config,
      mediaStrip: {
        ...config.mediaStrip,
        items: [newItem, ...config.mediaStrip.items]
      }
    });

    // Reset inputs
    setNewMediaTitle('');
    setNewMediaUrl('');
    setNewMediaDesc('');
    setRawSvgInput('');
    setSuccessMsg('¡Elemento multimedia agregado con éxito a la tira central!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDeleteMediaItem = (index: number) => {
    soundManager.playOrbitTick();
    const updated = config.mediaStrip.items.filter((_, i) => i !== index);
    onUpdateConfig({
      ...config,
      mediaStrip: {
        ...config.mediaStrip,
        items: updated
      }
    });
  };

  const handleRestoreMediaItems = () => {
    soundManager.playSelect();
    onUpdateConfig({
      ...config,
      mediaStrip: {
        ...config.mediaStrip,
        items: DEFAULT_MEDIA_ITEMS
      }
    });
    setSuccessMsg('Galería multimedia restaurada a elementos oficiales de Reyplace.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Media file upload handler (SVG text or media data URI)
  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert('El archivo no debe exceder los 30MB.');
      return;
    }

    if (!newMediaTitle) {
      setNewMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const isSvg = file.name.endsWith('.svg') || file.type.includes('svg');
    const isVid = file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.type.includes('video');

    if (isSvg) {
      setNewMediaType('svg');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const svgContent = ev.target?.result as string;
        setRawSvgInput(svgContent);
        setNewMediaUrl(svgContent);
        setSuccessMsg(`¡Archivo SVG "${file.name}" cargado en máxima resolución vectorial!`);
        setTimeout(() => setSuccessMsg(''), 2500);
      };
      reader.readAsText(file);
    } else {
      setNewMediaType(isVid ? 'video' : 'image');
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setNewMediaUrl(dataUrl);
        setSuccessMsg(`¡Archivo "${file.name}" listo para reproducir!`);
        setTimeout(() => setSuccessMsg(''), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  // System custom video file upload
  const handleSystemFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('El archivo no debe exceder los 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleUpdateSystemField('customVideoUrl', result);
      handleUpdateSystemField('loadingStyle', 'custom-media');
      soundManager.playChime(880, 0.08);
      setSuccessMsg(`¡Video "${file.name}" cargado para el sistema #${currentSys.index}!`);
      setTimeout(() => setSuccessMsg(''), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleResetAll = () => {
    if (window.confirm('¿Deseas restaurar toda la interfaz y los 12 sistemas a la configuración original de fábrica?')) {
      onSaveSystems(DEFAULT_SYSTEMS);
      onUpdateConfig(DEFAULT_APP_CONFIG);
      setSuccessMsg('Configuración completa restaurada a valores de fábrica.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  const handleExportJson = () => {
    const fullPayload = {
      systems,
      config,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(fullPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reyplace-ecosistema-completo.json';
    a.click();
    URL.revokeObjectURL(url);
    soundManager.playChime(880, 0.08);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.systems && Array.isArray(parsed.systems)) {
          onSaveSystems(parsed.systems);
        } else if (Array.isArray(parsed)) {
          onSaveSystems(parsed);
        }
        if (parsed.config) {
          onUpdateConfig(parsed.config);
        }
        setSuccessMsg('¡Configuración completa importada y aplicada en vivo!');
        setTimeout(() => setSuccessMsg(''), 2500);
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-[#02090c]/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
    >
      <div
        className="w-full max-w-2xl h-full bg-[#04121a] border-l border-[#315258] shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col z-50 text-[#d8f3ee]"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#315258] flex items-center justify-between bg-[#061822]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#0ea5e9] text-black">
              <Sparkles className="w-4 h-4 font-bold" />
            </div>
            <div>
              <h2 id="settings-heading" className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Centro de Configuración Total
              </h2>
              <span className="text-xs text-[#71c4bd] block font-mono">
                Actualización en Vivo • Reyplace Ecosistema
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playOrbitTick();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-[#1a3842] text-[#a8cbc7] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Configuration Tabs */}
        <div className="flex border-b border-[#315258] bg-[#081e28] px-3 font-mono text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveMainTab('systems')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMainTab === 'systems'
                ? 'border-[#00f0ff] text-[#00f0ff] font-bold'
                : 'border-transparent text-[#a8cbc7] hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Sistemas</span>
          </button>

          <button
            onClick={() => setActiveMainTab('media')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMainTab === 'media'
                ? 'border-[#00f0ff] text-[#00f0ff] font-bold'
                : 'border-transparent text-[#a8cbc7] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Tira Multimedia & SVG</span>
          </button>

          <button
            onClick={() => setActiveMainTab('news')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMainTab === 'news'
                ? 'border-[#00f0ff] text-[#00f0ff] font-bold'
                : 'border-transparent text-[#a8cbc7] hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Novedades</span>
          </button>

          <button
            onClick={() => setActiveMainTab('texts')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMainTab === 'texts'
                ? 'border-[#00f0ff] text-[#00f0ff] font-bold'
                : 'border-transparent text-[#a8cbc7] hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Textos & Marca</span>
          </button>

          <button
            onClick={() => setActiveMainTab('design')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMainTab === 'design'
                ? 'border-[#00f0ff] text-[#00f0ff] font-bold'
                : 'border-transparent text-[#a8cbc7] hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Diseño & Cursor</span>
          </button>

          <button
            onClick={() => setActiveMainTab('widgets')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeMainTab === 'widgets'
                ? 'border-[#00f0ff] text-[#00f0ff] font-bold'
                : 'border-transparent text-[#a8cbc7] hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Widgets & Movibles</span>
          </button>
        </div>

        {/* TAB 1: SISTEMAS & VIDEO DE CARGA */}
        {activeMainTab === 'systems' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-1.5 overflow-x-auto p-2.5 bg-[#061821] border-b border-[#315258] custom-scrollbar">
              {systems.map((sys, idx) => (
                <button
                  key={sys.id}
                  onClick={() => {
                    soundManager.playOrbitTick();
                    setSelectedSystemIndex(idx);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedSystemIndex === idx
                      ? 'bg-[#00f0ff] text-[#05171d] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'bg-[#0e2730] text-[#a8cbc7] hover:bg-[#153b45]'
                  }`}
                >
                  <span className="opacity-70">#{sys.index}</span>
                  <span>{sys.name}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs custom-scrollbar">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                      Nombre del Sistema
                    </label>
                    <input
                      type="text"
                      value={currentSys.name}
                      onChange={(e) => handleUpdateSystemField('name', e.target.value)}
                      className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                      Categoría
                    </label>
                    <select
                      value={currentSys.category}
                      onChange={(e) => handleUpdateSystemField('category', e.target.value as SystemCategory)}
                      className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    URL de Destino (HTTPS)
                  </label>
                  <input
                    type="url"
                    value={currentSys.url}
                    onChange={(e) => handleUpdateSystemField('url', e.target.value)}
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    Lema / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={currentSys.tagline}
                    onChange={(e) => handleUpdateSystemField('tagline', e.target.value)}
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    Descripción Completa
                  </label>
                  <textarea
                    rows={2}
                    value={currentSys.description}
                    onChange={(e) => handleUpdateSystemField('description', e.target.value)}
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                {/* Video Loading Animation Configuration */}
                <div className="pt-4 border-t border-[#315258] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-mono text-xs text-[#00f0ff] uppercase tracking-wider font-bold">
                        Animación de Video Carga
                      </h4>
                      <span className="text-[10px] text-[#8aa8a6]">
                        Transición visual antes de abrir el enlace del sistema
                      </span>
                    </div>

                    {onPreviewVideo && (
                      <button
                        type="button"
                        onClick={() => onPreviewVideo(currentSys)}
                        className="px-2.5 py-1 rounded-lg bg-[#00f0ff]/15 hover:bg-[#00f0ff]/30 border border-[#00f0ff]/40 text-[#00f0ff] font-mono text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3" /> Previsualizar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LOADING_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          soundManager.playOrbitTick();
                          handleUpdateSystemField('loadingStyle', style.id);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          currentSys.loadingStyle === style.id
                            ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'bg-[#07161b] border-[#55777a]/50 text-[#8aa8a6] hover:border-[#a8cbc7]'
                        }`}
                      >
                        <div className="font-mono text-[11px] font-bold text-white flex items-center justify-between">
                          <span>{style.label}</span>
                          {currentSys.loadingStyle === style.id && (
                            <Check className="w-3.5 h-3.5 text-[#00f0ff]" />
                          )}
                        </div>
                        <p className="text-[10px] mt-0.5 leading-tight">{style.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Custom video upload */}
                  <div className="p-3 rounded-xl bg-[#07161b] border border-[#55777a] space-y-2">
                    <span className="font-mono text-[10px] text-[#a9e7df] uppercase block">
                      Cargar Archivo de Video Personalizado (MP4 / WebM)
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,image/*"
                      onChange={handleSystemFileUpload}
                      className="text-xs text-[#a8cbc7] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#00f0ff] file:text-[#05171d] file:font-bold hover:file:bg-[#76fbe5] cursor-pointer"
                    />
                    {currentSys.customVideoUrl && (
                      <span className="text-[10px] text-emerald-400 font-mono block">
                        ✓ Archivo personalizado asignado a este sistema.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIRA MULTIMEDIA & SVG 4K */}
        {activeMainTab === 'media' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-[#315258]">
              <div>
                <h3 className="font-mono text-xs text-[#00f0ff] font-bold uppercase tracking-wider">
                  Gestor de Contenido Multimedia & SVG 4K
                </h3>
                <span className="text-[10px] text-[#8aa8a6]">
                  Sube vectores SVG en máxima resolución, imágenes y videos para la tira central
                </span>
              </div>

              <button
                type="button"
                onClick={handleRestoreMediaItems}
                className="px-2.5 py-1 rounded-lg bg-[#0e2730] hover:bg-[#1a3d4a] text-[#a8cbc7] hover:text-white font-mono text-[10px] border border-[#315258]"
                title="Restaurar a elementos multimedia oficiales de Reyplace"
              >
                Restaurar Oficiales
              </button>
            </div>

            {/* Toggle show MediaStrip */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#06151c] border border-[#315258] cursor-pointer">
              <div>
                <span className="font-mono text-xs text-white block">Mostrar Tira Multimedia en el Centro</span>
                <span className="text-[10px] text-[#8aa8a6]">
                  Habilita la galería horizontal en el espacio visual central.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.widgets.showMediaStrip}
                onChange={(e) => handleUpdateWidget('showMediaStrip', e.target.checked)}
                className="w-4 h-4 accent-[#00f0ff]"
              />
            </label>

            {/* Form to add new Media Item */}
            <div className="p-4 rounded-2xl bg-[#061822] border border-[#00f0ff]/40 space-y-3.5 shadow-md">
              <div className="flex items-center gap-2 font-mono text-xs text-[#00f0ff] font-bold">
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Contenido Multimedia</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    placeholder="Ej. Matriz de Conexiones 4K"
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={newMediaCategory}
                    onChange={(e) => setNewMediaCategory(e.target.value)}
                    placeholder="Ej. Infraestructura, Branding..."
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    Tipo de Formato
                  </label>
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value as MediaType)}
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="svg">SVG Vectorial (Nitidez Infinita 4K/8K)</option>
                    <option value="video">Video (MP4 / WebM)</option>
                    <option value="image">Imagen (JPG, PNG, WebP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    Relación de Aspecto
                  </label>
                  <select
                    value={newMediaRatio}
                    onChange={(e) => setNewMediaRatio(e.target.value as '16:9' | '4:3' | '1:1' | '9:16')}
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="16:9">16:9 Panorámico (Recomendado)</option>
                    <option value="4:3">4:3 Clásico</option>
                    <option value="1:1">1:1 Cuadrado</option>
                    <option value="9:16">9:16 Vertical (Poster / Móvil)</option>
                  </select>
                </div>
              </div>

              {/* File upload input */}
              <div className="p-3 rounded-xl bg-[#07161b] border border-[#55777a]/70 space-y-1.5">
                <span className="font-mono text-[10px] text-[#00f0ff] uppercase block font-bold">
                  Subir Archivo Local ({newMediaType.toUpperCase()})
                </span>
                <input
                  type="file"
                  accept={
                    newMediaType === 'svg'
                      ? '.svg,image/svg+xml'
                      : newMediaType === 'video'
                      ? 'video/mp4,video/webm'
                      : 'image/*'
                  }
                  onChange={handleMediaFileUpload}
                  className="text-xs text-[#a8cbc7] file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#00f0ff] file:text-[#05171d] file:font-bold hover:file:bg-[#76fbe5] cursor-pointer"
                />
              </div>

              {/* Raw SVG code paste option for pure vector 4k precision */}
              {newMediaType === 'svg' && (
                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1 flex items-center justify-between">
                    <span>Código SVG Nativo (Opcional - Pegar &lt;svg&gt;...&lt;/svg&gt;)</span>
                    <FileCode className="w-3.5 h-3.5 text-[#00f0ff]" />
                  </label>
                  <textarea
                    rows={3}
                    value={rawSvgInput}
                    onChange={(e) => setRawSvgInput(e.target.value)}
                    placeholder="<svg viewBox='0 0 100 100'>...</svg>"
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl p-2 font-mono text-[10px] text-[#00f0ff] focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              )}

              {/* URL input fallback */}
              {newMediaType !== 'svg' && (
                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    O URL Directa HTTPS
                  </label>
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://ejemplo.com/media.mp4"
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={newMediaDesc}
                  onChange={(e) => setNewMediaDesc(e.target.value)}
                  placeholder="Detalles técnicos, resolución y características del contenido..."
                  className="w-full bg-[#07161b] border border-[#55777a] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddMediaItem}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0ea5e9] text-black font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Contenido a la Tira Multimedia</span>
              </button>
            </div>

            {/* List of existing media items */}
            <div className="space-y-3">
              <span className="font-mono text-[10px] text-[#a9e7df] uppercase tracking-wider block font-bold">
                Elementos Actuales en la Tira ({config.mediaStrip.items.length})
              </span>

              {config.mediaStrip.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#06151c] border border-[#315258] hover:border-[#71c4bd]/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-10 rounded-lg bg-[#02080d] border border-[#71c4bd]/20 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.type === 'svg' && item.url.startsWith('<svg') ? (
                        <div
                          className="w-full h-full p-1 scale-50"
                          dangerouslySetInnerHTML={{ __html: item.url }}
                        />
                      ) : (
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[8px] uppercase px-1.5 py-0.5 rounded bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]">
                          {item.type.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      </div>
                      <span className="text-[10px] text-[#71c4bd] block truncate font-mono">
                        {item.category} • {item.aspectRatio}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onPreviewMedia && (
                      <button
                        type="button"
                        onClick={() => onPreviewMedia(item, 'half')}
                        className="p-1.5 rounded-lg bg-[#0e2730] hover:bg-[#1a3d4a] text-[#00f0ff]"
                        title="Ver en pantalla media"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteMediaItem(idx)}
                      className="p-1.5 rounded-lg bg-[#0e2730] hover:bg-rose-900/60 text-[#a8cbc7] hover:text-white"
                      title="Eliminar elemento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PASARELA DE NOVEDADES */}
        {activeMainTab === 'news' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-[#315258]">
              <div>
                <h3 className="font-mono text-xs text-[#00f0ff] font-bold uppercase tracking-wider">
                  Configuración de la Pasarela
                </h3>
                <span className="text-[10px] text-[#8aa8a6]">
                  Añade o edita noticias para la marquesina central
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddNewsItem}
                className="px-2.5 py-1 rounded-lg bg-[#00f0ff] text-black font-mono text-[10px] font-bold flex items-center gap-1 hover:bg-[#76fbe5]"
              >
                <Plus className="w-3 h-3" /> Añadir Noticia
              </button>
            </div>

            {config.news.items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#06151c] border border-[#315258] space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#00f0ff] font-bold">
                    NOTICIA #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNewsItem(idx)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                    title="Eliminar noticia"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateNewsItem(idx, 'title', e.target.value)}
                      className="w-full bg-[#07161b] border border-[#55777a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                      Etiqueta / Badge
                    </label>
                    <input
                      type="text"
                      value={item.badge}
                      onChange={(e) => handleUpdateNewsItem(idx, 'badge', e.target.value)}
                      className="w-full bg-[#07161b] border border-[#55777a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleUpdateNewsItem(idx, 'description', e.target.value)}
                    className="w-full bg-[#07161b] border border-[#55777a] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: TEXTOS & MARCA */}
        {activeMainTab === 'texts' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
            <h3 className="font-mono text-xs text-[#00f0ff] font-bold uppercase tracking-wider mb-2">
              Identidad de Marca y Textos Reyplace
            </h3>

            <div>
              <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                Nombre de la Marca
              </label>
              <input
                type="text"
                value={config.texts.brandName}
                onChange={(e) => handleUpdateText('brandName', e.target.value)}
                className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                Subtítulo de la Marca
              </label>
              <input
                type="text"
                value={config.texts.brandSub}
                onChange={(e) => handleUpdateText('brandSub', e.target.value)}
                className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                Slogan de la Marca (Oficial)
              </label>
              <input
                type="text"
                value={config.texts.brandSlogan}
                onChange={(e) => handleUpdateText('brandSlogan', e.target.value)}
                className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                Ubicación de Origen
              </label>
              <input
                type="text"
                value={config.texts.brandLocation}
                onChange={(e) => handleUpdateText('brandLocation', e.target.value)}
                className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                Título Principal Hero
              </label>
              <input
                type="text"
                value={config.texts.heroTitle}
                onChange={(e) => handleUpdateText('heroTitle', e.target.value)}
                className="w-full bg-[#07161b] border border-[#55777a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div>
              <label className="block text-[#a9e7df] font-mono text-[10px] uppercase mb-1">
                Subtítulo Descriptivo Hero
              </label>
              <textarea
                rows={2}
                value={config.texts.heroSubtitle}
                onChange={(e) => handleUpdateText('heroSubtitle', e.target.value)}
                className="w-full bg-[#07161b] border border-[#55777a] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
              />
            </div>
          </div>
        )}

        {/* TAB 5: DISEÑO & CURSOR */}
        {activeMainTab === 'design' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs custom-scrollbar">
            <h3 className="font-mono text-xs text-[#00f0ff] font-bold uppercase tracking-wider mb-2">
              Renderizado, 3D Cursor & Shaders
            </h3>

            {/* Custom 3D Cursor Toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#06151c] border border-[#00f0ff]/40 cursor-pointer shadow-sm">
              <div>
                <span className="font-mono text-xs text-white font-bold block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                  Cursor 3D Animado Cian Reactivo
                </span>
                <span className="text-[10px] text-[#8aa8a6]">
                  Aura de seguimiento con retícula holográfica al interactuar.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.design.enable3DCursor}
                onChange={(e) => handleUpdateDesign('enable3DCursor', e.target.checked)}
                className="w-4 h-4 accent-[#00f0ff]"
              />
            </label>

            {/* Widget Transparency */}
            <div className="p-3.5 rounded-2xl bg-[#06151c] border border-[#315258]">
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="text-[#a9e7df]">Transparencia Glassmorphism de Widgets</span>
                <span className="text-[#00f0ff] font-bold">{Math.round(config.design.widgetOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={config.design.widgetOpacity}
                onChange={(e) => handleUpdateDesign('widgetOpacity', parseFloat(e.target.value))}
                className="w-full accent-[#00f0ff]"
              />
            </div>

            {/* Bloom / Glow Intensity */}
            <div className="p-3.5 rounded-2xl bg-[#06151c] border border-[#315258]">
              <div className="flex justify-between font-mono text-xs mb-1">
                <span className="text-[#a9e7df]">Intensidad del Brillo Atmosférico (Bloom)</span>
                <span className="text-[#00f0ff] font-bold">{config.design.glowIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={config.design.glowIntensity}
                onChange={(e) => handleUpdateDesign('glowIntensity', parseFloat(e.target.value))}
                className="w-full accent-[#00f0ff]"
              />
            </div>
            
            {/* High Contrast Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#06151c] border border-[#315258]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-mono text-xs text-white font-bold block flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                    Modo Alto Contraste
                  </span>
                  <span className="text-[10px] text-[#a8cbc7]">
                    Mejora la legibilidad de elementos 'apple-glass' con más brillo y bordes marcados.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.design.highContrast}
                  onChange={(e) => handleUpdateDesign('highContrast', e.target.checked)}
                  className="w-5 h-5 accent-[#00f0ff]"
                />
              </label>
            </div>

            {/* Modo Ahorro (Battery Saver) Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#06151c] border border-[#315258]">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-mono text-xs text-white font-bold block flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Modo Ahorro de Batería
                  </span>
                  <span className="text-[10px] text-[#a8cbc7]">
                    Reduce la tasa de refresco 3D, limita FPS y desactiva efectos post-procesado intensivos en móviles.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.design.batterySaver}
                  onChange={(e) => handleUpdateDesign('batterySaver', e.target.checked)}
                  className="w-5 h-5 accent-[#10b981]"
                />
              </label>
            </div>

            {/* Weather Overlay Controls */}
            <div className="p-3.5 rounded-2xl bg-[#06151c] border border-[#315258] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-white font-bold block flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-[#00f0ff]" />
                    Efectos Atmosféricos (WeatherOverlay)
                  </span>
                  <span className="text-[10px] text-[#a8cbc7]">
                    Partículas y auroras sincronizadas con el Modo Zen
                  </span>
                </div>
              </div>

              {/* Mode Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                {(
                  [
                    { id: 'aurora', label: 'Aurora Boreal' },
                    { id: 'stardust', label: 'Polvo Estelar' },
                    { id: 'solar-wisps', label: 'Wisps Solares' },
                    { id: 'off', label: 'Desactivado' }
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleUpdateWeather('mode', m.id)}
                    className={`py-1.5 px-2 rounded-xl font-mono text-[11px] border transition-all ${
                      (config.weather?.mode || 'aurora') === m.id
                        ? 'border-[#00f0ff] bg-[#00f0ff]/20 text-white font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                        : 'border-[#315258] bg-[#071922] text-gray-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {(config.weather?.mode || 'aurora') !== 'off' && (
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between font-mono text-[10px] mb-1">
                    <span className="text-[#a9e7df]">Intensidad de Partículas</span>
                    <span className="text-[#00f0ff] font-bold">{(config.weather?.intensity || 1.0).toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.1"
                    value={config.weather?.intensity || 1.0}
                    onChange={(e) => handleUpdateWeather('intensity', parseFloat(e.target.value))}
                    className="w-full accent-[#00f0ff]"
                  />
                </div>
              )}
            </div>

            {/* Tactical Feedback & Browser Vibration Controls */}
            <div className="p-3.5 rounded-2xl bg-[#06151c] border border-[#315258] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-white font-bold block flex items-center gap-1.5">
                    <Vibrate className="w-4 h-4 text-emerald-400" />
                    Respuesta Táctica & Vibración Háptica
                  </span>
                  <span className="text-[10px] text-[#a8cbc7]">
                    Feedback háptico en móviles y retroceso táctico de pantalla
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] text-gray-300">Vibración Háptica en Móvil (Browser API)</span>
                  <input
                    type="checkbox"
                    defaultChecked={tacticalFeedback.isHapticsEnabled()}
                    onChange={(e) => tacticalFeedback.setHapticsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#10b981]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px] text-gray-300">Micro-retroceso / Temblor sutil de pantalla</span>
                  <input
                    type="checkbox"
                    defaultChecked={tacticalFeedback.isShakeEnabled()}
                    onChange={(e) => tacticalFeedback.setShakeEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#10b981]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  tacticalFeedback.trigger('launch', 'impact');
                  setSuccessMsg('¡Pulso táctico ejecutado con éxito!');
                  setTimeout(() => setSuccessMsg(''), 2000);
                }}
                className="w-full mt-1 py-1.5 px-3 rounded-xl apple-button text-[11px] font-mono text-[#00f0ff] hover:text-white"
              >
                Probar Respuesta Táctica y Háptica
              </button>
            </div>

            {/* Super PWA & Offline Engine */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c2635] to-[#04121a] border border-[#00f0ff]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-white font-bold block">
                      Super Progressive Web App (PWA)
                    </span>
                    <span className="text-[10px] text-[#8ddcd1]">
                      Soporte de caché offline y motor instalable
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                Esta aplicación está configurada con Service Workers activos para precachear el entorno 3D, mapas vectoriales, audio y recursos en tu dispositivo.
              </p>
              <PWAInstallButton variant="full" className="w-full justify-center" />
            </div>
          </div>
        )}

        {/* TAB 6: WIDGETS & MOVIBLES */}
        {activeMainTab === 'widgets' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
            <h3 className="font-mono text-xs text-[#00f0ff] font-bold uppercase tracking-wider mb-2">
              Modo de Widgets: Fijos vs. Movibles
            </h3>

            {/* Draggable Toggle */}
            <div className="p-4 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-mono text-xs text-white font-bold block flex items-center gap-1.5">
                    <Move className="w-4 h-4 text-[#00f0ff]" />
                    Habilitar Widgets Movibles (Arrastrar y Soltar)
                  </span>
                  <span className="text-[10px] text-[#a8cbc7]">
                    Permite arrastrar telemetría, reproductor, novedades y registro por toda la pantalla.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.widgets.draggableWidgets}
                  onChange={(e) => handleUpdateWidget('draggableWidgets', e.target.checked)}
                  className="w-5 h-5 accent-[#00f0ff]"
                />
              </label>

              {config.widgets.draggableWidgets && (
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('reyplace-reset-widget-positions'));
                    setSuccessMsg('¡Posiciones de todos los widgets restablecidas!');
                    setTimeout(() => setSuccessMsg(''), 2500);
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-[#0e2730] hover:bg-[#1a3d4a] text-[#00f0ff] font-mono text-[10px] flex items-center gap-1.5 border border-[#00f0ff]/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer posiciones originales</span>
                </button>
              )}
            </div>

            <h4 className="font-mono text-xs text-[#a9e7df] font-bold uppercase tracking-wider pt-2">
              Visibilidad de Módulos
            </h4>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#06151c] border border-[#315258] cursor-pointer">
              <div>
                <span className="font-mono text-xs text-white block">Tira Multimedia Central</span>
                <span className="text-[10px] text-[#8aa8a6]">Galería de imágenes, videos y SVG en el espacio vacío.</span>
              </div>
              <input
                type="checkbox"
                checked={config.widgets.showMediaStrip}
                onChange={(e) => handleUpdateWidget('showMediaStrip', e.target.checked)}
                className="w-4 h-4 accent-[#00f0ff]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#06151c] border border-[#315258] cursor-pointer">
              <div>
                <span className="font-mono text-xs text-white block">Pasarela Multimedia de Novedades</span>
                <span className="text-[10px] text-[#8aa8a6]">Marquesina informativa superior.</span>
              </div>
              <input
                type="checkbox"
                checked={config.widgets.showNewsShowcase}
                onChange={(e) => handleUpdateWidget('showNewsShowcase', e.target.checked)}
                className="w-4 h-4 accent-[#00f0ff]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#06151c] border border-[#315258] cursor-pointer">
              <div>
                <span className="font-mono text-xs text-white block">Telemetría Local (GPS & Clima)</span>
                <span className="text-[10px] text-[#8aa8a6]">Fecha, hora y clima de la estación.</span>
              </div>
              <input
                type="checkbox"
                checked={config.widgets.showTelemetry}
                onChange={(e) => handleUpdateWidget('showTelemetry', e.target.checked)}
                className="w-4 h-4 accent-[#00f0ff]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#06151c] border border-[#315258] cursor-pointer">
              <div>
                <span className="font-mono text-xs text-white block">Ventana 'Scan Log' en Vivo</span>
                <span className="text-[10px] text-[#8aa8a6]">Terminal de telemetría orbital en la esquina inferior izquierda.</span>
              </div>
              <input
                type="checkbox"
                checked={config.widgets.showScanLog}
                onChange={(e) => handleUpdateWidget('showScanLog', e.target.checked)}
                className="w-4 h-4 accent-[#00f0ff]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#06151c] border border-[#315258] cursor-pointer">
              <div>
                <span className="font-mono text-xs text-white block">Bóveda Celeste 4K SVG en Tiempo Real</span>
                <span className="text-[10px] text-[#8aa8a6]">Constelaciones vectoriales y fondo estelar continuo.</span>
              </div>
              <input
                type="checkbox"
                checked={config.widgets.showConstellations}
                onChange={(e) => handleUpdateWidget('showConstellations', e.target.checked)}
                className="w-4 h-4 accent-[#00f0ff]"
              />
            </label>
          </div>
        )}

        {/* Global Footer Actions */}
        <div className="p-4 bg-[#06141a] border-t border-[#315258] space-y-3">
          {successMsg && (
            <div className="p-2 rounded-lg bg-[#064e3b] text-[#34d399] font-mono text-xs flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4" />
              {successMsg}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-lg bg-[#0f2d36] hover:bg-[#184552] text-[#a8cbc7] hover:text-white font-mono text-[11px] flex items-center gap-1 border border-[#4a7275]/40"
                title="Exportar configuración completa a JSON"
              >
                <Download className="w-3.5 h-3.5" /> Exportar
              </button>

              <label
                className="px-2.5 py-1.5 rounded-lg bg-[#0f2d36] hover:bg-[#184552] text-[#a8cbc7] hover:text-white font-mono text-[11px] flex items-center gap-1 border border-[#4a7275]/40 cursor-pointer"
                title="Importar configuración JSON"
              >
                <Upload className="w-3.5 h-3.5" /> Importar
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1.5 rounded-lg bg-[#0f2d36] hover:bg-[#2b171c] text-[#f43f5e] font-mono text-[11px] flex items-center gap-1 border border-[#f43f5e]/30"
                title="Restaurar toda la interfaz a valores de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playSelect();
                onClose();
              }}
              className="px-5 py-2 rounded-xl font-bold font-mono text-xs bg-[#00f0ff] hover:bg-[#76fbe5] text-[#05171d] flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Listo / Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
