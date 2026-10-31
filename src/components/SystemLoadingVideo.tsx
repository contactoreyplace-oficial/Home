import React, { useEffect, useRef, useState } from 'react';
import { SystemPortal, LoadingVideoStyle } from '../types/system';
import { soundManager } from '../utils/audio';
import { FastForward, X, Shield, Sparkles, Terminal } from 'lucide-react';

interface SystemLoadingVideoProps {
  system: SystemPortal | null;
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export const SystemLoadingVideo: React.FC<SystemLoadingVideoProps> = ({
  system,
  isOpen,
  onComplete,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Iniciando secuencia de enlace...');

  useEffect(() => {
    if (!isOpen || !system) return;

    soundManager.playLaunch();
    setProgress(0);
    const duration = system.loadingDurationMs || 2200;
    const startTime = performance.now();

    const statuses = [
      'Sincronizando vector de fase cuántica...',
      'Autenticando protocolo Zero-Trust Kyber-1024...',
      'Estabilizando canal de telemetría de baja latencia...',
      'Desplegando portal de acceso seguro...',
      'Enlace completado. Saltando a destino...'
    ];

    let animId: number;

    const timer = () => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      const statusIdx = Math.min(
        statuses.length - 1,
        Math.floor((pct / 100) * statuses.length)
      );
      setStatusText(statuses[statusIdx]);

      if (pct < 100) {
        animId = requestAnimationFrame(timer);
      } else {
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    };

    animId = requestAnimationFrame(timer);

    // Procedural Canvas Animation for each style
    const canvas = canvasRef.current;
    if (canvas && (!system.customVideoUrl || system.loadingStyle !== 'custom-media')) {
      const ctx = canvas.getContext('2d');
      let renderId: number;
      let frame = 0;

      const render = () => {
        frame++;
        const w = (canvas.width = canvas.clientWidth);
        const h = (canvas.height = canvas.clientHeight);

        if (ctx) {
          ctx.fillStyle = '#02070a';
          ctx.fillRect(0, 0, w, h);

          const cx = w / 2;
          const cy = h / 2;
          const style: LoadingVideoStyle = system.loadingStyle || 'warp-drive';

          if (style === 'warp-drive') {
            // Hyperspace Warp Lines
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            for (let i = 0; i < 70; i++) {
              const angle = (i / 70) * Math.PI * 2 + frame * 0.02;
              const dist = ((frame * 12 + i * 25) % Math.max(w, h)) * 0.8;
              const x1 = cx + Math.cos(angle) * (dist * 0.2);
              const y1 = cy + Math.sin(angle) * (dist * 0.2);
              const x2 = cx + Math.cos(angle) * dist;
              const y2 = cy + Math.sin(angle) * dist;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          } else if (style === 'quantum-matrix') {
            // Digital Matrix Cascade
            ctx.fillStyle = '#10b981';
            ctx.font = '12px "Space Mono", monospace';
            const chars = '01REYPLACE_CYBER_MATRIX_NEXUS';
            for (let x = 20; x < w; x += 30) {
              const y = ((frame * 6 + x * 15) % h);
              ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
            }
          } else if (style === 'orbital-grid') {
            // 3D Wireframe Grid & Radar Sweep
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            for (let r = 40; r < Math.min(w, h) * 0.45; r += 35) {
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, Math.PI * 2);
              ctx.stroke();
            }
            const sweep = (frame * 0.05) % (Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(sweep) * 350, cy + Math.sin(sweep) * 350);
            ctx.stroke();
          } else if (style === 'neural-synapse') {
            // Neural Synapse Pulses
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            for (let i = 0; i < 18; i++) {
              const a = (i / 18) * Math.PI * 2;
              const nx = cx + Math.cos(a) * 140;
              const ny = cy + Math.sin(a) * 140;
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(nx, ny);
              ctx.stroke();
              ctx.fillStyle = '#ec4899';
              ctx.beginPath();
              ctx.arc(nx, ny, 6 + Math.sin(frame * 0.1 + i) * 3, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (style === 'hazard-core') {
            // Industrial Warning Core
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.strokeRect(cx - 100, cy - 100, 200, 200);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(frame * 0.03);
            ctx.strokeRect(-60, -60, 120, 120);
            ctx.restore();
          } else {
            // Hologram Forge
            ctx.strokeStyle = '#76fbe5';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
              const r = 50 + i * 28 + Math.sin(frame * 0.08) * 8;
              ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
            }
          }
        }
        renderId = requestAnimationFrame(render);
      };

      renderId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animId);
        cancelAnimationFrame(renderId);
      };
    }

    return () => cancelAnimationFrame(animId);
  }, [isOpen, system, onComplete]);

  if (!isOpen || !system) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010609]/90 backdrop-blur-2xl animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-[#030d12] border border-[#71c4bd]/40 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,240,255,0.3)] flex flex-col">
        {/* Top Bar */}
        <div className="p-4 px-6 border-b border-[#71c4bd]/20 flex items-center justify-between bg-[#06151c]/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-ping" />
            <span className="font-mono text-xs font-bold text-[#9df9e7] uppercase tracking-wider">
              ENLACE CUÁNTICO &gt; {system.name}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-[#0f2c36] text-[#a8cbc7] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video / Canvas Screen Area */}
        <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
          {system.customVideoUrl && system.loadingStyle === 'custom-media' ? (
            <video
              src={system.customVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <canvas ref={canvasRef} className="w-full h-full block" />
          )}

          {/* Hologram HUD Overlay over video */}
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start font-mono text-[10px] text-[#00f0ff]">
              <div>
                <p>NODO: #{String(system.index).padStart(2, '0')}</p>
                <p>SECTOR: {system.category.toUpperCase()}</p>
                <p>ANIMACIÓN: {system.loadingStyle.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p>LATENCIA: {system.latencyMs}ms</p>
                <p>CIFRADO: TLS-1.3-PQ</p>
              </div>
            </div>

            <div className="text-center font-mono">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-widest drop-shadow-[0_0_20px_#00f0ff]">
                {progress}%
              </span>
            </div>

            <div className="flex justify-between items-end font-mono text-[10px] text-[#a8cbc7]">
              <span className="truncate max-w-[340px] text-[#76fbe5]">{statusText}</span>
              <span>CANAL SEGURO</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Actions Footer */}
        <div className="p-4 px-6 bg-[#041117] border-t border-[#71c4bd]/20 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="w-full h-1.5 bg-[#081d24] rounded-full overflow-hidden border border-[#71c4bd]/30">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff] to-[#10b981] transition-all duration-150 ease-out shadow-[0_0_12px_#00f0ff]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00f0ff] hover:bg-[#76fbe5] text-[#041117] font-mono font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all active:scale-95 shrink-0"
          >
            <span>Saltar</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
