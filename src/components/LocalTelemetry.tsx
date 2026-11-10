import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Clock, Calendar, CloudSun, Minus, ChevronUp } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface LocalTelemetryProps {
  isNight: boolean;
  onNightChange?: (isNight: boolean) => void;
  widgetOpacity?: number;
}

export const LocalTelemetry: React.FC<LocalTelemetryProps> = ({
  isNight,
  onNightChange,
  widgetOpacity = 0.45
}) => {
  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('Los Mochis');
  const [coordsStr, setCoordsStr] = useState<string>('25.79°N, 108.99°W');
  const [temperature, setTemperature] = useState<string>('26°C');
  const [weatherCondition, setWeatherCondition] = useState<string>('Despejado');
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  // Default minimized so it doesn't obstruct the viewport
  const [isMinimized, setIsMinimized] = useState<boolean>(true);

  // Progressive 3D Streaming Telemetry State
  const [streamInfo, setStreamInfo] = useState<{
    stage: string;
    progress: number;
    activeLOD: string;
    fps: number;
    triangles: number;
  }>({
    stage: 'full_fidelity',
    progress: 100,
    activeLOD: 'LOD_HIGH',
    fps: 60,
    triangles: 8192
  });

  useEffect(() => {
    const handleProgress = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        setStreamInfo(custom.detail);
      }
    };
    window.addEventListener('reyplace-3d-stream-progress', handleProgress);
    return () => window.removeEventListener('reyplace-3d-stream-progress', handleProgress);
  }, []);

  // Time & Date formatters
  useEffect(() => {
    const dateFormatter = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatter = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const updateClock = () => {
      const now = new Date();
      setDateStr(dateFormatter.format(now));
      setTimeStr(timeFormatter.format(now));

      const hour = now.getHours() + now.getMinutes() / 60;
      const night = hour < 6 || hour >= 19;
      if (onNightChange && night !== isNight) {
        onNightChange(night);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isNight, onNightChange]);

  // Weather fetcher
  const fetchWeather = async (latitude: number, longitude: number) => {
    setIsLoadingWeather(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
      );
      if (!res.ok) throw new Error('Error al consultar clima');
      const data = await res.json();
      if (data.current) {
        setTemperature(`${Math.round(data.current.temperature_2m)}°C`);
        const code = data.current.weather_code;
        if (code === 0) setWeatherCondition('Despejado');
        else if (code <= 3) setWeatherCondition('Parcialmente nublado');
        else if (code <= 48) setWeatherCondition('Niebla ligera');
        else if (code <= 65) setWeatherCondition('Lluvia');
        else setWeatherCondition('Cielo cubierto');
      }
    } catch {
      setTemperature('24°C');
      setWeatherCondition('Estable');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationName('Los Mochis, SIN');
      setCoordsStr('25.79°N, 108.99°W');
      fetchWeather(25.793, -108.995);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setCoordsStr(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        fetchWeather(latitude, longitude);

        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const city =
              revData.address?.city ||
              revData.address?.town ||
              revData.address?.county ||
              revData.address?.state ||
              'Estación Activa';
            setLocationName(city);
          }
        } catch {
          setLocationName('Estación Local');
        }
      },
      () => {
        setLocationName('Los Mochis, MX');
        setCoordsStr('25.79°N, 108.99°W');
        fetchWeather(25.793, -108.995);
      },
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // When minimized, render an ultra-compact pill that does not obstruct the 3D scene
  if (isMinimized) {
    return (
      <button
        onClick={() => {
          soundManager.playHover();
          setIsMinimized(false);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#71c4bd]/35 bg-[#091c24]/80 hover:bg-[#0e2a36]/90 text-xs font-mono text-[#a5e6df] hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:scale-105 hover:border-[#00f0ff]/50"
        title="Ver telemetría local completa (clima, coordenadas, fecha)"
      >
        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
        <span className="font-bold text-[#76fbe5]">{timeStr || '12:00'}</span>
        <span className="text-[#71c4bd]/60">·</span>
        <span className="text-[#f0fffc] truncate max-w-[120px]">{locationName} ({temperature})</span>
        <span className="text-[10px] text-[#00f0ff] bg-[#00f0ff]/15 px-1.5 py-0.5 rounded-full font-bold">▾</span>
      </button>
    );
  }

  return (
    <aside
      className="glass-panel rounded-2xl p-3 sm:p-4 text-xs z-30 transition-all duration-300 backdrop-blur-xl border border-[#71c4bd]/25 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
      style={{
        backgroundColor: `rgba(9, 28, 36, ${Math.max(0.25, widgetOpacity)})`
      }}
      aria-label="Panel de Telemetría y Datos Locales"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#89e0d6]/20 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <h2 className="font-mono text-[10px] tracking-widest text-[#9de9df] uppercase font-bold">
            Telemetría Local
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundManager.playHover();
              setIsExpanded(!isExpanded);
            }}
            className="text-[10px] font-mono text-[#a8cbc7] hover:text-[#9df9e7] px-1.5 py-0.5 rounded border border-[#89e0d6]/20 bg-[#0c242c]/50 transition-colors"
          >
            {isExpanded ? 'Menos' : 'Más'}
          </button>
          <button
            onClick={() => {
              soundManager.playHover();
              setIsMinimized(true);
            }}
            className="text-[10px] font-mono text-[#00f0ff] hover:text-white px-1.5 py-0.5 rounded border border-[#00f0ff]/30 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 transition-colors"
            title="Minimizar panel"
          >
            Minimizar ▴
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {/* Ubicación */}
        <div className="min-w-0">
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#9bbfba]">
            <MapPin className="w-2.5 h-2.5 text-[#71c4bd]" />
            Ubicación
          </span>
          <p className="mt-0.5 text-[11px] font-semibold text-[#f0fffc] truncate" title={locationName}>
            {locationName}
          </p>
          <p className="font-mono text-[9px] text-[#71c4bd]/80 tracking-tight">
            {coordsStr}
          </p>
        </div>

        {/* Clima & Temperatura */}
        <div className="min-w-0">
          <span className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#9bbfba]">
            <span className="flex items-center gap-1">
              <CloudSun className="w-2.5 h-2.5 text-[#71c4bd]" />
              Clima
            </span>
            <button
              onClick={() => {
                if (coords) fetchWeather(coords.lat, coords.lon);
                else requestLocation();
              }}
              disabled={isLoadingWeather}
              className="p-0.5 hover:text-[#9df9e7] disabled:opacity-50 transition-transform active:rotate-180"
              title="Actualizar clima"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
            </button>
          </span>
          <p className="mt-0.5 text-[12px] font-bold text-[#f0fffc] flex items-center gap-1">
            {temperature}
            {weatherCondition && (
              <span className="text-[10px] font-normal text-[#a9e7df] font-sans truncate">
                · {weatherCondition}
              </span>
            )}
          </p>
          <span className="text-[9px] text-[#89e0d6]/70 font-mono">
            {isNight ? 'Noche estelar' : 'Luz diurna'}
          </span>
        </div>

        {/* Fecha */}
        <div className="min-w-0">
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#9bbfba]">
            <Calendar className="w-2.5 h-2.5 text-[#71c4bd]" />
            Fecha
          </span>
          <p className="mt-0.5 text-[11px] font-semibold text-[#f0fffc] truncate capitalize">
            {dateStr || '—'}
          </p>
        </div>

        {/* Hora */}
        <div className="min-w-0">
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#9bbfba]">
            <Clock className="w-2.5 h-2.5 text-[#71c4bd]" />
            Hora Local
          </span>
          <p className="mt-0.5 text-[12px] font-bold font-mono tracking-wider text-[#76fbe5]">
            {timeStr || '—'}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-2.5 border-t border-[#89e0d6]/15 space-y-1.5 font-mono text-[10px] text-[#a8cbc7]">
          <div className="flex justify-between items-center">
            <span>Fase Celestial:</span>
            <span className="text-[#9df9e7]">{isNight ? 'Bóveda Nocturna (Orión)' : 'Tránsito Solar'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Protocolo Enlace:</span>
            <span className="text-[#34d399]">TLS 1.3 / Quantum-Ready</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Sistemas Activos:</span>
            <span className="text-[#76fbe5]">12 / 12 Operacionales</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Motor 3D Streaming:</span>
            <span className="text-[#00f0ff] font-bold">
              {streamInfo.progress === 100 ? 'Sincronizado' : `${streamInfo.progress}%`} · {streamInfo.activeLOD} ({streamInfo.triangles} Δ)
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
