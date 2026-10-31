import React, { useState } from 'react';
import { SystemPortal, SystemCategory } from '../types/system';
import { SystemIcon } from './SystemIcon';
import { Search, ExternalLink, Activity, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MatrixViewProps {
  systems: SystemPortal[];
  onSelectSystem: (system: SystemPortal) => void;
}

const CATEGORIES: ('Todos' | SystemCategory)[] = [
  'Todos',
  'Core',
  'AI & Data',
  'Infraestructura',
  'Seguridad',
  'Operaciones',
  'Negocio'
];

export const MatrixView: React.FC<MatrixViewProps> = ({ systems, onSelectSystem }) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'Todos' | SystemCategory>('Todos');

  const filtered = systems.filter((s) => {
    const matchesCat = selectedCat === 'Todos' || s.category === selectedCat;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 z-20 relative">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6 glass-panel rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#71c4bd] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, palabra clave o etiqueta..."
            className="w-full bg-[#07171e] border border-[#55777a] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#8aa8a6] focus:outline-none focus:border-[#76fbe5]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundManager.playOrbitTick();
                setSelectedCat(cat);
              }}
              className={`text-[11px] font-mono px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-[#76fbe5] text-[#05171d] font-bold shadow-[0_0_12px_rgba(118,251,229,0.4)]'
                  : 'bg-[#0d262f] text-[#a8cbc7] hover:text-white border border-[#4a7275]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of System Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((sys) => (
          <div
            key={sys.id}
            onClick={() => {
              soundManager.playSelect();
              onSelectSystem(sys);
            }}
            className="glass-card rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#76fbe5]/60 group relative flex flex-col justify-between"
          >
            <div>
              {/* Header: Index, Category, Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#8eddd3] tracking-wider">
                  NODO #{String(sys.index).padStart(2, '0')}
                </span>
                <span
                  className="inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: `${sys.accentColor}50`,
                    backgroundColor: `${sys.accentColor}15`,
                    color: sys.accentColor
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sys.accentColor }}
                  />
                  {sys.status.toUpperCase()}
                </span>
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-2.5 my-2">
                <div
                  className="p-2 rounded-xl bg-[#081a20] border border-[#71c4bd]/30 text-[#76fbe5] group-hover:scale-105 transition-transform shrink-0"
                >
                  <SystemIcon name={sys.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-white group-hover:text-[#76fbe5] transition-colors truncate">
                    {sys.name}
                  </h3>
                  <p className="font-mono text-[10px] text-[#9df9e7] truncate">
                    {sys.category}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#c5deda] line-clamp-2 my-2 leading-relaxed">
                {sys.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 my-2">
                {sys.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0b2028] text-[#8eddd3] border border-[#4a7275]/30"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Telemetry & Quick Action */}
            <div className="mt-3 pt-3 border-t border-[#89e0d6]/15 flex items-center justify-between text-[10px] font-mono text-[#9bbfba]">
              <span className="flex items-center gap-1 text-[#34d399]">
                <Activity className="w-3 h-3" />
                {sys.latencyMs}ms
              </span>
              <span className="text-[#8eddd3]">
                {sys.metrics.uptime}
              </span>
              <button
                type="button"
                className="flex items-center gap-1 text-[#76fbe5] group-hover:underline"
              >
                Acceder <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-2xl">
          <p className="text-sm font-mono text-[#a8cbc7]">
            No se encontraron sistemas coincidentes con "{search}"
          </p>
        </div>
      )}
    </div>
  );
};
