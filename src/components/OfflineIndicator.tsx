import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl apple-glass px-3.5 py-2 text-xs font-mono text-amber-300 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.25)] animate-fadeIn">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Modo Offline Activo · Datos en caché local</span>
    </div>
  );
};
