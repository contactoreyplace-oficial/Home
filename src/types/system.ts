export type SystemCategory = 'Core' | 'AI & Data' | 'Infraestructura' | 'Seguridad' | 'Operaciones' | 'Negocio';

export type SystemStatus = 'operational' | 'upgrading' | 'beta' | 'standby';

export type LoadingVideoStyle =
  | 'warp-drive'
  | 'quantum-matrix'
  | 'orbital-grid'
  | 'neural-synapse'
  | 'hazard-core'
  | 'hologram-forge'
  | 'custom-media';

export interface SystemPortal {
  id: string;
  index: number; // 1 to 12
  name: string;
  tagline: string;
  category: SystemCategory;
  url: string;
  description: string;
  status: SystemStatus;
  latencyMs: number;
  accentColor: string;
  icon: string;
  loadingStyle: LoadingVideoStyle;
  customVideoUrl?: string; // custom media URL or data URI
  loadingDurationMs?: number;
  metrics: {
    uptime: string;
    version: string;
    region: string;
    load: string;
  };
  tags: string[];
}

export type PlanetTheme = 'real-earth' | 'oceanic' | 'cyber' | 'cyber-industrial' | 'nebula' | 'aurora';

export type ViewMode = 'orbit' | 'matrix' | 'radar' | 'terminal' | 'map';

export type AudioMode = 'soundscape' | 'music-player' | 'frequencies';

export type HarmonicFrequencyMode =
  | 'earth-schumann' // 7.83 Hz Resonancia de la Tierra
  | 'harmony-432'    // 432 Hz Armonía Universal
  | 'peace-528'      // 528 Hz Tranquilidad y Calma
  | 'adrenaline-40'; // 40 Hz Gamma + 144 Hz Adrenalina y Motivación

export type DayNightCyclePhase = 'dawn' | 'day' | 'afternoon' | 'sunset' | 'night';

export interface UserGPSLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  accuracyMeters?: number;
  timestamp?: number;
}

export interface HarmonicFrequencyInfo {
  id: HarmonicFrequencyMode;
  name: string;
  frequencyHz: number;
  category: string;
  effect: string;
  description: string;
  color: string;
}

export const HARMONIC_FREQUENCIES: HarmonicFrequencyInfo[] = [
  {
    id: 'earth-schumann',
    name: 'Resonancia Schumann (Tierra)',
    frequencyHz: 7.83,
    category: 'Biofrecuencia Planetaria',
    effect: 'Conexión Electromagnética Terrestre',
    description: 'Frecuencia fundamental de la cavidad electromagnética Tierra-ionosfera descubierta por Winfried Otto Schumann. Sincroniza ritmos circadianos y ondas cerebrales theta.',
    color: '#10b981'
  },
  {
    id: 'harmony-432',
    name: 'Frecuencia de Armonía',
    frequencyHz: 432,
    category: 'Afinación Natural Cósmica',
    effect: 'Coherencia Cardiaca y Equilibrio',
    description: 'Afinación pitagórica matemática alineada con la proporción áurea del universo. Reduce la frecuencia cardiaca y la tensión arterial, creando una sensación de resonancia pacífica.',
    color: '#00f0ff'
  },
  {
    id: 'peace-528',
    name: 'Frecuencia de Tranquilidad',
    frequencyHz: 528,
    category: 'Escala Solfeggio Sagrada',
    effect: 'Serenidad Profunda y Reducción de Cortisol',
    description: 'La célebre frecuencia "Milagro" (Mi) de la escala Solfeggio. Estimula el sistema nervioso parasimpático, disipando la ansiedad y favoreciendo la relajación meditativa.',
    color: '#a855f7'
  },
  {
    id: 'adrenaline-40',
    name: 'Adrenalina & Motivación',
    frequencyHz: 40,
    category: 'Ondas Gamma & Flow State',
    effect: 'Enfoque Láser y Activación Dopaminérgica',
    description: 'Ritmo neuroeléctrico Gamma de 40 Hz combinado con un portador de 144 Hz. Induce el estado de flujo (flow state), agudeza perceptiva, alta motivación y máximo rendimiento cognitivo.',
    color: '#f59e0b'
  }
];

export interface NewsItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  date: string;
  linkUrl: string;
  mediaType: 'image' | 'video' | 'pulse';
  mediaUrl?: string;
  active: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  bpm: number;
}

export type MediaType = 'image' | 'video' | 'svg';
export type MediaQuality = 'auto' | '4k' | '1080p' | '720p';

export interface MediaItem {
  id: string;
  title: string;
  category: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  description: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  dateAdded: string;
  tags: string[];
}

export const REYPLACE_MUSIC_PLAYLIST: MusicTrack[] = [
  {
    id: 'track-01',
    title: 'Neon Odyssey (Synthwave Horizon)',
    artist: 'Reyplace Sound Lab',
    genre: 'Cyber Lo-Fi Space',
    duration: '3:45',
    bpm: 86
  },
  {
    id: 'track-02',
    title: 'Quantum Drift & Stellar Currents',
    artist: 'Reyplace Audio Engine',
    genre: 'Ambient Cosmic Drone',
    duration: '4:12',
    bpm: 72
  },
  {
    id: 'track-03',
    title: 'Orbital Sunset over Sector 7',
    artist: 'Reyplace Studio',
    genre: 'Retro Futuristic Chill',
    duration: '3:30',
    bpm: 92
  },
  {
    id: 'track-04',
    title: 'Cyber-Industrial Nexus Pulse',
    artist: 'Reyplace Core Beats',
    genre: 'Glitch Synthwave',
    duration: '3:55',
    bpm: 110
  }
];

export interface AppGlobalConfig {
  texts: {
    brandName: string;
    brandSub: string;
    brandSlogan: string;
    brandLocation: string;
    badge: string;
    eyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    orbitNote: string;
  };
  design: {
    widgetOpacity: number; // 0.1 to 0.95
    glowIntensity: number; // 0.5 to 2.5
    accentColor: string;
    cardScale: number; // 0.85 to 1.25
    enableChromaticAberration: boolean;
    bloomStrength: number; // 0.2 to 2.0
    enable3DCursor: boolean;
    highContrast: boolean;
    enableDataSurge: boolean;
  };
  widgets: {
    showTelemetry: boolean;
    showConstellations: boolean;
    showScanLog: boolean;
    showTopNav: boolean;
    showBottomDock: boolean;
    showOrbitLines: boolean;
    showNewsShowcase: boolean;
    showMediaStrip: boolean;
    showAudioPlayer: boolean;
    draggableWidgets: boolean;
    enableSoundByDefault: boolean;
  };
  news: {
    enabled: boolean;
    autoplay: boolean;
    autoplayIntervalSec: number;
    items: NewsItem[];
  };
  mediaStrip: {
    enabled: boolean;
    title: string;
    subtitle: string;
    items: MediaItem[];
  };
  audio: {
    mode: AudioMode;
    soundscapeVolume: number; // 0 to 1
    musicVolume: number; // 0 to 1
    spatialPanningEnabled: boolean;
    currentTrackIndex: number;
  };
}

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-01',
    title: 'Lanzamiento de Reyplace AI Studio v4.8',
    badge: 'NUEVA VERSIÓN',
    badgeColor: '#00f0ff',
    description: 'Integración de modelos neuronales de baja latencia con procesamiento en el edge y telemetría cuántica.',
    date: 'OCT 2026',
    linkUrl: 'https://gemini.google.com',
    mediaType: 'pulse',
    active: true
  },
  {
    id: 'news-02',
    title: 'Infraestructura Cloud Mesh con Enlace Anycast',
    badge: 'ACTUALIZACIÓN',
    badgeColor: '#10b981',
    description: 'Rendimiento mejorado en un 42% en tiempos de respuesta de nodos orbitales con protocolo Zero-Trust.',
    date: 'OCT 2026',
    linkUrl: 'https://cloud.google.com',
    mediaType: 'pulse',
    active: true
  },
  {
    id: 'news-03',
    title: 'Despliegue del Sistema de Cifrado Kyber-1024',
    badge: 'SEGURIDAD',
    badgeColor: '#f43f5e',
    description: 'Protección poscuántica activa para todos los túneles y pasarelas de pago del ecosistema Reyplace.',
    date: 'OCT 2026',
    linkUrl: 'https://security.google.com',
    mediaType: 'pulse',
    active: true
  },
  {
    id: 'news-04',
    title: 'Nuevo Tema Celestial Cyber-Industrial',
    badge: 'DISEÑO 3D',
    badgeColor: '#f59e0b',
    description: 'Generación procedural de mapas de textura en alta definición con iluminación reactiva en tiempo real.',
    date: 'HOY',
    linkUrl: '#',
    mediaType: 'pulse',
    active: true
  }
];

export const DEFAULT_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-01',
    title: 'Emblema Oficial REYPLACE.MX',
    category: 'Identidad de Marca',
    type: 'image',
    url: '/public/assets/aistudio/559044693_1792620683899863_eafaddda.jpg',
    thumbnailUrl: '/public/assets/aistudio/559044693_1792620683899863_eafaddda.jpg',
    description: 'Corona metálica con circuitos electrónicos dorados, isotipo "R" cromático y constelación orbital en Los Mochis, Sinaloa, México.',
    aspectRatio: '9:16',
    dateAdded: 'OCT 2026',
    tags: ['Branding', 'Corona 3D', 'Alta Definición']
  },
  {
    id: 'media-02',
    title: 'Matriz Cuántica SVG Vectorial 4K',
    category: 'Infraestructura',
    type: 'svg',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%"><rect width="1920" height="1080" fill="%2305101a"/><circle cx="960" cy="540" r="420" stroke="%2300f0ff" stroke-width="3" fill="none" opacity="0.8"/><circle cx="960" cy="540" r="280" stroke="%23f43f5e" stroke-width="2" fill="none" stroke-dasharray="12 12"/><text x="960" y="520" text-anchor="middle" font-family="monospace" font-size="64" font-weight="bold" fill="%2300f0ff" letter-spacing="12">REYPLACE.MX</text><text x="960" y="580" text-anchor="middle" font-family="monospace" font-size="28" fill="%23a5e6df" letter-spacing="6">CONECTAMOS · INNOVAMOS · TRANSFORMAMOS</text></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340"><rect width="600" height="340" fill="%2305101a"/><circle cx="300" cy="170" r="100" stroke="%2300f0ff" stroke-width="2" fill="none"/><text x="300" y="175" text-anchor="middle" font-family="monospace" font-size="22" font-weight="bold" fill="%2300f0ff">REYPLACE.MX</text></svg>',
    description: 'Infografía en resolución vectorial 4K nativa que detalla los 12 canales neuronales del ecosistema digital.',
    aspectRatio: '16:9',
    dateAdded: 'OCT 2026',
    tags: ['SVG 4K', 'Vectorial', 'Ultra HD']
  },
  {
    id: 'media-03',
    title: 'Cápsula de Innovación Tecnológica',
    category: 'Ecosistema Digital',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    description: 'Video de demostración de microservicios distribuidos y tecnología de alta velocidad en la nube.',
    aspectRatio: '16:9',
    dateAdded: 'OCT 2026',
    tags: ['Video HD', 'Cloud', 'Sistemas']
  },
  {
    id: 'media-04',
    title: 'Bóveda de Seguridad & Cifrado Cuántico',
    category: 'Seguridad Zero-Trust',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    description: 'Monitoreo de perímetro y protección biométrica con protocolos criptográficos de siguiente generación.',
    aspectRatio: '16:9',
    dateAdded: 'OCT 2026',
    tags: ['Seguridad', 'Cripto', 'Escudo']
  }
];

export const DEFAULT_APP_CONFIG: AppGlobalConfig = {
  texts: {
    brandName: 'REYPLACE.MX',
    brandSub: 'ECOSISTEMA DIGITAL',
    brandSlogan: 'CONECTAMOS · INNOVAMOS · TRANSFORMAMOS',
    brandLocation: 'LOS MOCHIS, SINALOA, MÉXICO',
    badge: 'ECOSISTEMA DIGITAL',
    eyebrow: 'UNA CONSTELACIÓN DE POSIBILIDADES',
    heroTitle: 'Explora nuevos mundos.',
    heroSubtitle: 'Doce puertas, doce sistemas. Elige un destino y descubre lo que hay al otro lado.',
    orbitNote: 'ARRASTRA PARA ROTAR · FLECHAS ← → PARA NAVEGAR · REYPLACEMX'
  },
  design: {
    widgetOpacity: 0.45,
    glowIntensity: 1.4,
    accentColor: '#00f0ff',
    cardScale: 1.0,
    enableDataSurge: true,
    enableChromaticAberration: true,
    bloomStrength: 1.2,
    enable3DCursor: true,
    highContrast: false
  },
  widgets: {
    showTelemetry: false,
    showConstellations: true,
    showScanLog: false,
    showTopNav: true,
    showBottomDock: true,
    showOrbitLines: true,
    showNewsShowcase: false,
    showMediaStrip: false,
    showAudioPlayer: false,
    draggableWidgets: false, // Default static, togglable to movable
    enableSoundByDefault: true
  },
  news: {
    enabled: true,
    autoplay: true,
    autoplayIntervalSec: 6,
    items: DEFAULT_NEWS_ITEMS
  },
  mediaStrip: {
    enabled: true,
    title: 'Tira Multimedia del Ecosistema',
    subtitle: 'Galería de alta resolución en SVG, imágenes y videos',
    items: DEFAULT_MEDIA_ITEMS
  },
  audio: {
    mode: 'soundscape',
    soundscapeVolume: 0.35,
    musicVolume: 0.45,
    spatialPanningEnabled: true,
    currentTrackIndex: 0
  }
};

export const DEFAULT_SYSTEMS: SystemPortal[] = [
  {
    id: 'sys-01',
    index: 1,
    name: 'Reyplace Core',
    tagline: 'Centro neurálgico del ecosistema',
    category: 'Core',
    url: 'https://reyplace.com',
    description: 'Plataforma central unificada para administración de identidades, permisos corporativos y control maestro de aplicaciones.',
    status: 'operational',
    latencyMs: 18,
    accentColor: '#10b981',
    icon: 'ShieldCheck',
    loadingStyle: 'warp-drive',
    loadingDurationMs: 2200,
    metrics: { uptime: '99.98%', version: 'v4.8.2', region: 'us-east-1', load: '32%' },
    tags: ['Maestro', 'SSO', 'Identidad']
  },
  {
    id: 'sys-02',
    index: 2,
    name: 'AI Neural Studio',
    tagline: 'Inteligencia artificial generativa',
    category: 'AI & Data',
    url: 'https://gemini.google.com',
    description: 'Ambiente interactivo para experimentación con modelos multimodales, embeddings vectoriales y procesamiento cognitivo.',
    status: 'operational',
    latencyMs: 34,
    accentColor: '#06b6d4',
    icon: 'Cpu',
    loadingStyle: 'neural-synapse',
    loadingDurationMs: 2500,
    metrics: { uptime: '99.94%', version: 'v3.2.0', region: 'us-central1', load: '68%' },
    tags: ['LLM', 'Inferencia', 'Pipelines']
  },
  {
    id: 'sys-03',
    index: 3,
    name: 'Cloud Mesh Fabric',
    tagline: 'Infraestructura elástica global',
    category: 'Infraestructura',
    url: 'https://cloud.google.com',
    description: 'Orquestación de microservicios con escalado automático, balanceo de carga geo-distribuido y redes de baja latencia.',
    status: 'operational',
    latencyMs: 22,
    accentColor: '#3b82f6',
    icon: 'Server',
    loadingStyle: 'orbital-grid',
    loadingDurationMs: 2000,
    metrics: { uptime: '100%', version: 'v5.1.0', region: 'global-mesh', load: '45%' },
    tags: ['Kubernetes', 'CDN', 'Edge']
  },
  {
    id: 'sys-04',
    index: 4,
    name: 'Quantum Analytics',
    tagline: 'Minería y telemetría en tiempo real',
    category: 'AI & Data',
    url: 'https://analytics.google.com',
    description: 'Procesamiento masivo de flujos de datos en tiempo real, tableros predictivos y análisis de comportamiento de usuarios.',
    status: 'operational',
    latencyMs: 29,
    accentColor: '#8b5cf6',
    icon: 'BarChart3',
    loadingStyle: 'quantum-matrix',
    loadingDurationMs: 2200,
    metrics: { uptime: '99.92%', version: 'v2.9.1', region: 'us-west-2', load: '52%' },
    tags: ['BigData', 'BI', 'Métricas']
  },
  {
    id: 'sys-05',
    index: 5,
    name: 'Security Sentinel',
    tagline: 'Monitoreo Zero-Trust & WAF',
    category: 'Seguridad',
    url: 'https://security.google.com',
    description: 'Escudo perimetral autónomo con detección de anomalías, protección criptográfica y auditoría continua de cumplimiento.',
    status: 'operational',
    latencyMs: 14,
    accentColor: '#f43f5e',
    icon: 'Lock',
    loadingStyle: 'hazard-core',
    loadingDurationMs: 2400,
    metrics: { uptime: '99.99%', version: 'v6.0.4', region: 'edge-anycast', load: '21%' },
    tags: ['ZeroTrust', 'Firewall', 'Cifrado']
  },
  {
    id: 'sys-06',
    index: 6,
    name: 'DevOps Continuum',
    tagline: 'Integración y despliegue veloz',
    category: 'Operaciones',
    url: 'https://github.com',
    description: 'Tuberías automatizadas de CI/CD, pruebas de estrés, verificación de seguridad y despliegues sin tiempo de inactividad.',
    status: 'operational',
    latencyMs: 41,
    accentColor: '#f59e0b',
    icon: 'GitBranch',
    loadingStyle: 'hologram-forge',
    loadingDurationMs: 2300,
    metrics: { uptime: '99.89%', version: 'v4.0.0', region: 'us-east-2', load: '74%' },
    tags: ['CI/CD', 'GitOps', 'Docker']
  },
  {
    id: 'sys-07',
    index: 7,
    name: 'Commerce Gateway',
    tagline: 'Pasarela transaccional omnicanal',
    category: 'Negocio',
    url: 'https://stripe.com',
    description: 'Motor de pagos internacionales de alta resiliencia con soporte multidivisa, suscripciones y liquidación instantánea.',
    status: 'operational',
    latencyMs: 27,
    accentColor: '#14b8a6',
    icon: 'CreditCard',
    loadingStyle: 'warp-drive',
    loadingDurationMs: 2100,
    metrics: { uptime: '99.99%', version: 'v7.3.1', region: 'global-pci', load: '39%' },
    tags: ['Fintech', 'Suscripciones', 'Pagos']
  },
  {
    id: 'sys-08',
    index: 8,
    name: 'Vector Database Hub',
    tagline: 'Almacenamiento semántico de alta velocidad',
    category: 'AI & Data',
    url: 'https://firebase.google.com',
    description: 'Base de datos documental y vectorial optimizada para búsquedas semánticas, grafos de conocimiento y caché distribuida.',
    status: 'upgrading',
    latencyMs: 58,
    accentColor: '#ec4899',
    icon: 'Database',
    loadingStyle: 'quantum-matrix',
    loadingDurationMs: 2600,
    metrics: { uptime: '99.75%', version: 'v3.5.0-rc', region: 'us-east-1', load: '82%' },
    tags: ['Embeddings', 'NoSQL', 'Caché']
  },
  {
    id: 'sys-09',
    index: 9,
    name: 'Customer Experience',
    tagline: 'CRM & Relaciones omnicanal',
    category: 'Negocio',
    url: 'https://hubspot.com',
    description: 'Gestión 360° del ciclo de vida del cliente, automatización de mensajería, soporte multicanal y fidelización.',
    status: 'operational',
    latencyMs: 33,
    accentColor: '#eab308',
    icon: 'Users',
    loadingStyle: 'hologram-forge',
    loadingDurationMs: 2100,
    metrics: { uptime: '99.91%', version: 'v4.2.0', region: 'us-central1', load: '48%' },
    tags: ['CRM', 'Soporte', 'Marketing']
  },
  {
    id: 'sys-10',
    index: 10,
    name: 'Observability Horizon',
    tagline: 'Rastreo y monitoreo APM 24/7',
    category: 'Operaciones',
    url: 'https://datadoghq.com',
    description: 'Visibilidad total con telemetría unificada de trazas distribuidas, métricas en vivo, registros y alertas proactivas.',
    status: 'operational',
    latencyMs: 25,
    accentColor: '#6366f1',
    icon: 'Activity',
    loadingStyle: 'orbital-grid',
    loadingDurationMs: 2000,
    metrics: { uptime: '99.97%', version: 'v5.8.0', region: 'eu-west-1', load: '41%' },
    tags: ['APM', 'Logs', 'Alertas']
  },
  {
    id: 'sys-11',
    index: 11,
    name: 'API Nexus Gateway',
    tagline: 'Punto de integración para desarrolladores',
    category: 'Infraestructura',
    url: 'https://postman.com',
    description: 'Gobierno y gestión centralizada de APIs REST, GraphQL y gRPC con límite de peticiones, caché e instrumentación.',
    status: 'operational',
    latencyMs: 19,
    accentColor: '#2dd4bf',
    icon: 'Share2',
    loadingStyle: 'neural-synapse',
    loadingDurationMs: 2000,
    metrics: { uptime: '99.96%', version: 'v3.1.2', region: 'global-edge', load: '55%' },
    tags: ['REST', 'GraphQL', 'SDKs']
  },
  {
    id: 'sys-12',
    index: 12,
    name: 'Workspace Collab',
    tagline: 'Espacio colaborativo de diseño y producto',
    category: 'Negocio',
    url: 'https://figma.com',
    description: 'Co-creación en tiempo real para especificaciones de diseño, prototipado UI/UX interactivo y documentación de sistemas.',
    status: 'operational',
    latencyMs: 38,
    accentColor: '#a855f7',
    icon: 'LayoutGrid',
    loadingStyle: 'hologram-forge',
    loadingDurationMs: 2200,
    metrics: { uptime: '99.90%', version: 'v4.6.0', region: 'us-west-1', load: '30%' },
    tags: ['Diseño', 'Prototipos', 'Docs']
  }
];
