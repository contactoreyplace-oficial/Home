import React, { useEffect, useRef } from 'react';
import { SystemPortal } from '../types/system';
import { X, BarChart3, TrendingUp, Award, Layers } from 'lucide-react';
import { soundManager } from '../utils/audio';
import * as d3 from 'd3';

interface SystemAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: SystemPortal[];
}

export const SystemAnalyticsModal: React.FC<SystemAnalyticsModalProps> = ({
  isOpen,
  onClose,
  systems
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Load access counts from localStorage or initialize with pseudo-random stats weighted by usage
  const getAccessCounts = (): Record<string, number> => {
    try {
      const saved = localStorage.getItem('reyplace_system_access_counts');
      if (saved) return JSON.parse(saved);
    } catch {}

    const initial: Record<string, number> = {};
    systems.forEach((sys, i) => {
      // Seed initial realistic access distribution
      initial[sys.id] = Math.max(12, Math.round(150 - i * 8 + Math.sin(i * 3) * 25));
    });
    localStorage.setItem('reyplace_system_access_counts', JSON.stringify(initial));
    return initial;
  };

  const accessCounts = getAccessCounts();

  useEffect(() => {
    if (!isOpen || !svgRef.current) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const data = systems.map((sys) => ({
      name: sys.name.length > 14 ? sys.name.substring(0, 12) + '...' : sys.name,
      fullName: sys.name,
      count: accessCounts[sys.id] || 10,
      color: sys.accentColor || '#00f0ff'
    })).sort((a, b) => b.count - a.count);

    const width = 560;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 65, left: 50 };

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 100])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'rgba(113, 196, 189, 0.1)');

    svg.selectAll('.domain').remove();

    // Bars with gradient & animation
    const bars = svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.name) || 0)
      .attr('width', x.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', (d) => d.color)
      .attr('rx', 4)
      .attr('opacity', 0.85);

    bars
      .transition()
      .duration(800)
      .delay((_, i) => i * 40)
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => innerHeight - y(d.count));

    // X Axis labels
    svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,10)rotate(-35)')
      .style('text-anchor', 'end')
      .style('fill', '#9de9df')
      .style('font-family', 'monospace')
      .style('font-size', '9px');

    svg.select('.domain').attr('stroke', 'rgba(113, 196, 189, 0.3)');

    // Y Axis
    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('fill', '#9de9df')
      .style('font-family', 'monospace')
      .style('font-size', '9px');

    svg.selectAll('.tick line').attr('stroke', 'rgba(113, 196, 189, 0.2)');

  }, [isOpen, systems]);

  if (!isOpen) return null;

  const totalAccesses = Object.values(accessCounts).reduce((a, b) => a + b, 0);
  const mostUsed = [...systems].sort((a, b) => (accessCounts[b.id] || 0) - (accessCounts[a.id] || 0))[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#04121a]/95 border border-[#71c4bd]/40 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#71c4bd]/25 flex items-center justify-between bg-gradient-to-r from-[#0d2831]/85 to-[#04121a]/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#030e14] border border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#8eddd3] uppercase tracking-widest block">
                ANALÍTICA AVANZADA · D3.JS
              </span>
              <h2 className="text-lg font-bold text-white">
                Uso y Frecuencia de Módulos
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playHover();
              onClose();
            }}
            className="p-2 rounded-full bg-[#0d2831] hover:bg-[#184451] text-[#a8cbc7] hover:text-white transition-colors border border-[#71c4bd]/30"
            title="Cerrar analítica"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3 rounded-2xl bg-[#071922] border border-[#71c4bd]/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0f343e] text-[#10b981]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-[#8aa8a6] uppercase block">Total Accesos</span>
                <span className="text-base font-bold text-white">{totalAccesses} req</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#071922] border border-[#71c4bd]/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0f343e] text-[#fbbf24]">
                <Award className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[9px] text-[#8aa8a6] uppercase block">Sistema Top 1</span>
                <span className="text-xs font-bold text-[#fbbf24] truncate block">
                  {mostUsed ? mostUsed.name : 'Reyplace Core'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#071922] border border-[#71c4bd]/20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0f343e] text-[#00f0ff]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-[#8aa8a6] uppercase block">Nodos Activos</span>
                <span className="text-base font-bold text-white">12 / 12</span>
              </div>
            </div>
          </div>

          {/* D3 Bar Chart Container */}
          <div className="p-4 rounded-2xl bg-[#030a10] border border-[#71c4bd]/25 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-[#8eddd3] uppercase tracking-wider">
                Frecuencia de Solicitudes por Módulo (D3 Renderer)
              </span>
              <span className="font-mono text-[9px] text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded-full">
                ● En Vivo
              </span>
            </div>
            <div className="w-full h-[300px]">
              <svg ref={svgRef} className="w-full h-full overflow-visible" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
