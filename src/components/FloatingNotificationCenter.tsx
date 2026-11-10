import React, { useState, useEffect } from 'react';
import { errorLogger, SystemErrorLog } from '../utils/errorLogger';
import { AlertCircle, AlertTriangle, Info, X, Bell, ShieldCheck } from 'lucide-react';

interface NotificationItem extends SystemErrorLog {
  key: string;
}

export const FloatingNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Add welcome notification
    const welcome: NotificationItem = {
      key: `notif-${Date.now()}`,
      id: 'init-0',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'System',
      message: 'Ecosistema Reyplace operativo al 100%. Conexión segura establecida.',
      reported: true
    };
    setNotifications([welcome]);

    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.key !== welcome.key));
    }, 5000);

    // Subscribe to errorLogger
    const unsubscribe = errorLogger.subscribe((err) => {
      const item: NotificationItem = {
        ...err,
        key: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      };

      setNotifications((prev) => [item, ...prev].slice(0, 5));

      // Auto dismiss after 5 seconds
      const dismissTimer = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.key !== item.key));
      }, 5000);

      return () => clearTimeout(dismissTimer);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = (key: string) => {
    setNotifications((prev) => prev.filter((n) => n.key !== key));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      {notifications.map((notif) => {
        const isError = notif.level === 'error';
        const isWarning = notif.level === 'warning';

        return (
          <div
            key={notif.key}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl apple-glass shadow-[0_15px_35px_rgba(0,0,0,0.65)] border backdrop-blur-xl animate-slideInRight transition-all ${
              isError
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : isWarning
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/80 border-[#00f0ff]/40 text-cyan-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError ? (
                <AlertCircle className="w-5 h-5 text-rose-400 animate-pulse" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <Info className="w-5 h-5 text-[#00f0ff]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase opacity-80">
                  {notif.source} · {notif.timestamp}
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                  style={{
                    backgroundColor: isError ? 'rgba(244,63,94,0.2)' : isWarning ? 'rgba(245,158,11,0.2)' : 'rgba(0,240,255,0.2)',
                    color: isError ? '#f43f5e' : isWarning ? '#f59e0b' : '#00f0ff'
                  }}
                >
                  {notif.level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-sans mt-1 leading-relaxed text-white break-words">
                {notif.message}
              </p>
            </div>

            <button
              onClick={() => handleDismiss(notif.key)}
              className="shrink-0 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
