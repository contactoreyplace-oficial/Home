import React, { useEffect, useState } from 'react';

interface EnergyPulseWaveProps {
  triggerKey: number;
}

export const EnergyPulseWave: React.FC<EnergyPulseWaveProps> = ({ triggerKey }) => {
  const [pulses, setPulses] = useState<number[]>([]);

  useEffect(() => {
    if (triggerKey > 0) {
      setPulses((prev) => [...prev, triggerKey]);
      const timer = setTimeout(() => {
        setPulses((prev) => prev.filter((id) => id !== triggerKey));
      }, 1400); // 1.4s animation duration
      return () => clearTimeout(timer);
    }
  }, [triggerKey]);

  if (pulses.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center">
      {pulses.map((id) => (
        <div
          key={id}
          className="absolute rounded-full border-2 border-[#00f0ff] animate-ping opacity-80"
          style={{
            width: '100px',
            height: '100px',
            animationDuration: '1.2s',
            boxShadow: '0 0 50px rgba(0, 240, 255, 0.8), inset 0 0 30px rgba(168, 85, 247, 0.6)',
            transform: 'scale(1)',
            animation: 'energyWaveExpand 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards'
          }}
        />
      ))}
      <style>{`
        @keyframes energyWaveExpand {
          0% {
            width: 100px;
            height: 100px;
            opacity: 1;
            border-color: #00f0ff;
            box-shadow: 0 0 40px rgba(0,240,255,0.9);
          }
          50% {
            border-color: #c084fc;
          }
          100% {
            width: 2400px;
            height: 2400px;
            opacity: 0;
            border-color: #f43f5e;
            box-shadow: 0 0 120px rgba(244,63,94,0);
          }
        }
      `}</style>
    </div>
  );
};
