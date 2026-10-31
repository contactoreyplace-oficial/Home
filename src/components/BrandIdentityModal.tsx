import React from 'react';
import { X, MapPin, Sparkles, Shield, Cpu, ExternalLink, Layers, Radio, Globe2, Share2, Check } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BrandIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandIdentityModal: React.FC<BrandIdentityModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    soundManager.playSelect();
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#71c4bd]/40 bg-[#04121a]/95 text-white shadow-[0_0_80px_rgba(0,240,255,0.25)] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#71c4bd]/20 custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playOrbitTick();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#081b22]/80 hover:bg-[#1a3842] border border-[#71c4bd]/30 text-[#a8cbc7] hover:text-white transition-all"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Visual Asset Display */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col items-center justify-center bg-gradient-to-b from-[#061822] to-[#020b10] relative overflow-hidden">
          {/* Subtle background ambient pulse */}
          <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none -top-10 -left-10" />
          <div className="absolute w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none -bottom-10 -right-10" />

          {/* High-Resolution Emblem Image with Frame */}
          <div className="relative group w-full max-w-[320px] rounded-2xl overflow-hidden border-2 border-[#71c4bd]/40 shadow-[0_15px_45px_rgba(0,240,255,0.25)] bg-[#03090e]">
            <img
              src="/public/assets/aistudio/559044693_1792620683899863_eafaddda.jpg"
              alt="REYPLACE.MX - Identidad de Marca Oficial"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Holographic scanner line overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-[#71c4bd] tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>IDENTIDAD OFICIAL VERIFICADA</span>
          </div>
        </div>

        {/* Right Column: Brand Philosophy & Ecosystem Details */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            {/* Header Brand */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-[0.3em] text-[#00f0ff] uppercase font-bold">
                  ECOSISTEMA DIGITAL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ACTIVO 24/7
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-[#a5e6df] to-[#00f0ff]">
                REYPLACE.MX
              </h2>
            </div>

            {/* Slogan */}
            <div className="mt-2 py-1.5 px-3 rounded-lg bg-[#081f2a]/70 border border-[#71c4bd]/25 inline-flex items-center gap-2 font-mono text-xs text-[#a5e6df] font-semibold tracking-wider">
              <span className="text-[#00f0ff]">CONECTAMOS</span>
              <span className="text-[#71c4bd]">•</span>
              <span className="text-[#d946ef]">INNOVAMOS</span>
              <span className="text-[#71c4bd]">•</span>
              <span className="text-[#f59e0b]">TRANSFORMAMOS</span>
            </div>

            {/* Geographic Origin Badge */}
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#a8cbc7]">
              <MapPin className="w-4 h-4 text-[#00f0ff] shrink-0" />
              <span>Los Mochis, Sinaloa, México</span>
            </div>

            {/* Core Pillars Description */}
            <div className="mt-6 space-y-3">
              <div className="p-3 rounded-xl bg-[#071a24]/60 border border-[#71c4bd]/20 hover:border-[#00f0ff]/40 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00f0ff]">
                  <Globe2 className="w-4 h-4" />
                  <span>CONECTAMOS</span>
                </div>
                <p className="text-[11px] text-[#c7e5df] mt-1 leading-relaxed">
                  Interconexión de sistemas distribuidos, infraestructura en la nube y microservicios sin fricción.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#071a24]/60 border border-[#71c4bd]/20 hover:border-[#d946ef]/40 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-[#d946ef]">
                  <Cpu className="w-4 h-4" />
                  <span>INNOVAMOS</span>
                </div>
                <p className="text-[11px] text-[#c7e5df] mt-1 leading-relaxed">
                  Inteligencia artificial de última generación, gráficos 3D acelerados por GPU y cifrado poscuántico.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#071a24]/60 border border-[#71c4bd]/20 hover:border-[#f59e0b]/40 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b]">
                  <Layers className="w-4 h-4" />
                  <span>TRANSFORMAMOS</span>
                </div>
                <p className="text-[11px] text-[#c7e5df] mt-1 leading-relaxed">
                  Evolución digital continua para organizaciones, optimizando operaciones y experiencias de usuario.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#71c4bd]/20 flex items-center justify-between gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#081e28] hover:bg-[#113140] border border-[#71c4bd]/30 text-xs font-mono text-[#a5e6df] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Enlace copiado!' : 'Compartir portal'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playOrbitTick();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0ea5e9] hover:from-[#38bdf8] hover:to-[#0284c7] text-[#030d14] font-bold text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
            >
              Explorar Ecosistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
