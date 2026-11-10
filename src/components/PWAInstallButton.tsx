import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl apple-button px-3 py-1.5 text-xs font-mono font-medium text-[#00f0ff] hover:text-white transition-all shadow-sm ${className}`}
        title="Instalar Reyplace 3D como Progressive Web App"
      >
        <Download className="w-3.5 h-3.5" />
        {variant === 'full' ? <span>Instalar Super PWA</span> : <span>Instalar</span>}
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 rounded-xl apple-button px-3 py-1.5 text-xs font-mono font-medium text-[#00f0ff] hover:text-white transition-all shadow-sm ${className}`}
          title="Instalar en iOS iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5" />
          {variant === 'full' ? <span>Instalar en iOS</span> : <span>Instalar</span>}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl apple-glass p-6 shadow-2xl border border-[#00f0ff]/30 text-white relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f0ff]/30 to-[#a855f7]/30 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">Instalar en iPhone / iPad</h3>
                  <p className="text-[11px] text-[#8ddcd1]">Reyplace Ecosistema 3D PWA</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-sans">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Share className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                  <span>
                    1. Toca el botón <strong>Compartir</strong> en la barra de Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <PlusSquare className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                  <span>
                    2. Desplázate hacia abajo y selecciona <strong>Agregar a pantalla de inicio</strong>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl apple-button py-2.5 text-xs font-mono font-medium text-white hover:bg-[#00f0ff]/20"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
