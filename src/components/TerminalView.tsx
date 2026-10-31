import React, { useState, useRef, useEffect } from 'react';
import { SystemPortal } from '../types/system';
import { Terminal, Send, CornerDownLeft, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TerminalViewProps {
  systems: SystemPortal[];
  onSelectSystem: (system: SystemPortal) => void;
}

interface CommandOutput {
  id: string;
  type: 'input' | 'output' | 'error' | 'success';
  text: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({ systems, onSelectSystem }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([
    {
      id: 'init-1',
      type: 'output',
      text: 'REYPLACE ECOSISTEMA [TERMINAL DE COMANDO v4.8]'
    },
    {
      id: 'init-2',
      type: 'output',
      text: 'Escribe "help" para ver los comandos disponibles o "list" para explorar los 12 sistemas.'
    }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    soundManager.playOrbitTick();
    const newItems: CommandOutput[] = [...history, { id: String(Date.now()), type: 'input', text: `> ${raw}` }];

    const parts = raw.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (command) {
      case 'help':
        newItems.push({
          id: String(Date.now() + 1),
          type: 'output',
          text: `Comandos disponibles:
  - list: Muestra los 12 sistemas orbitales activos
  - open <número|nombre>: Abre el sistema (ej. "open 1" o "open core")
  - ping <número|nombre>: Mide la latencia y calidad de enlace
  - status: Muestra el estado operativo de la constelación
  - clear: Limpia la pantalla de la terminal`
        });
        break;

      case 'list':
      case 'ls':
        const listText = systems
          .map(
            (s) =>
              `  [#${String(s.index).padStart(2, '0')}] ${s.name.padEnd(24)} (${s.category}) -> ${s.latencyMs}ms [${s.status.toUpperCase()}]`
          )
          .join('\n');
        newItems.push({
          id: String(Date.now() + 1),
          type: 'output',
          text: `Sistemas Registrados:\n${listText}`
        });
        break;

      case 'open':
        if (!arg) {
          newItems.push({
            id: String(Date.now() + 1),
            type: 'error',
            text: 'Error: Especifica el número (1-12) o nombre del sistema. Ej: "open 1"'
          });
        } else {
          const matched = systems.find(
            (s) => s.index.toString() === arg || s.name.toLowerCase().includes(arg)
          );
          if (matched) {
            newItems.push({
              id: String(Date.now() + 1),
              type: 'success',
              text: `Enlazando a ${matched.name} [${matched.url}]...`
            });
            soundManager.playLaunch();
            setTimeout(() => onSelectSystem(matched), 500);
          } else {
            newItems.push({
              id: String(Date.now() + 1),
              type: 'error',
              text: `No se encontró ningún sistema con el término "${arg}".`
            });
          }
        }
        break;

      case 'ping':
        if (!arg) {
          newItems.push({
            id: String(Date.now() + 1),
            type: 'error',
            text: 'Especifica el sistema a probar. Ej: "ping 2"'
          });
        } else {
          const matched = systems.find(
            (s) => s.index.toString() === arg || s.name.toLowerCase().includes(arg)
          );
          if (matched) {
            newItems.push({
              id: String(Date.now() + 1),
              type: 'output',
              text: `Haciendo ping a ${matched.name} [${matched.url}] con 64 bytes de datos:\n  Respuesta desde ${matched.metrics.region}: tiempo=${matched.latencyMs}ms TTL=58\n  Paquetes: Enviados = 4, Recibidos = 4, Perdidos = 0 (0% perdidos).\n  Enlace: ÓPTIMO.`
            });
          } else {
            newItems.push({
              id: String(Date.now() + 1),
              type: 'error',
              text: `Sistema "${arg}" no alcanzable.`
            });
          }
        }
        break;

      case 'status':
        const operational = systems.filter((s) => s.status === 'operational').length;
        newItems.push({
          id: String(Date.now() + 1),
          type: 'success',
          text: `Constelación Reyplace: ${operational}/${systems.length} sistemas operacionales. Red cuántica estable.`
        });
        break;

      case 'clear':
      case 'cls':
        setHistory([]);
        setInput('');
        return;

      default:
        newItems.push({
          id: String(Date.now() + 1),
          type: 'error',
          text: `Comando no reconocido: "${command}". Escribe "help" para ver los comandos válidos.`
        });
        break;
    }

    setHistory(newItems);
    setInput('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 z-20 relative">
      <div className="glass-panel rounded-2xl border border-[#71c4bd]/40 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-[#07161b] px-4 py-3 border-b border-[#71c4bd]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#76fbe5]" />
            <span className="font-mono text-xs text-[#9df9e7] font-bold">
              reyplace-terminal@ecosistema:~
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/80" />
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-[#0b2129]/60 px-4 py-2 border-b border-[#71c4bd]/15 flex items-center gap-2 overflow-x-auto text-[10px] font-mono text-[#a8cbc7]">
          <span>Atajos:</span>
          {['help', 'list', 'status', 'ping 1', 'open 1', 'clear'].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => handleCommand(cmd)}
              className="px-2 py-0.5 rounded bg-[#07161c] hover:bg-[#163a44] text-[#76fbe5] border border-[#71c4bd]/25 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Output Screen */}
        <div className="p-4 bg-[#030d12]/90 min-h-[320px] max-h-[460px] overflow-y-auto font-mono text-xs space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className={`whitespace-pre-wrap leading-relaxed ${
                item.type === 'input'
                  ? 'text-[#76fbe5] font-bold'
                  : item.type === 'error'
                  ? 'text-[#f43f5e]'
                  : item.type === 'success'
                  ? 'text-[#34d399]'
                  : 'text-[#c6e8e2]'
              }`}
            >
              {item.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(input);
          }}
          className="bg-[#07161b] p-3 border-t border-[#71c4bd]/30 flex items-center gap-2"
        >
          <span className="font-mono text-xs text-[#76fbe5] select-none">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un comando... ('help', 'open 1', 'list')"
            className="flex-1 bg-transparent font-mono text-xs text-white focus:outline-none placeholder-[#55777a]"
            autoFocus
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-[#76fbe5] hover:bg-[#9df9e7] text-[#05171d] transition-colors"
            title="Ejecutar"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
