// Real-time error logging and glitch feedback system
export interface SystemErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  source: 'WebGL' | 'Audio' | 'Network' | 'UI' | 'System';
  message: string;
  stack?: string;
  reported: boolean;
}

class ErrorLoggerService {
  private errors: SystemErrorLog[] = [];
  private listeners: ((error: SystemErrorLog) => void)[] = [];

  constructor() {
    // Global error listener
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          source: 'System',
          message: event.message || 'Unknown runtime error',
          level: 'error',
          stack: event.filename ? `${event.filename}:${event.lineno}` : undefined
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          source: 'Network',
          message: String(event.reason || 'Unhandled Promise Rejection'),
          level: 'error'
        });
      });
    }
  }

  public logError(info: {
    source: 'WebGL' | 'Audio' | 'Network' | 'UI' | 'System';
    message: string;
    level?: 'error' | 'warning' | 'info';
    stack?: string;
  }): SystemErrorLog {
    const errorLog: SystemErrorLog = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      level: info.level || 'error',
      source: info.source,
      message: info.message,
      stack: info.stack,
      reported: false
    };

    this.errors = [errorLog, ...this.errors].slice(0, 50); // Keep last 50

    // Notify listeners
    this.listeners.forEach((cb) => cb(errorLog));

    // Trigger subtle UI glitch animation if level is error
    if (errorLog.level === 'error' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('reyplace-ui-glitch', { detail: errorLog }));
    }

    return errorLog;
  }

  public getErrors(): SystemErrorLog[] {
    return this.errors;
  }

  public subscribe(cb: (error: SystemErrorLog) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public markReported(id: string) {
    this.errors = this.errors.map((e) => (e.id === id ? { ...e, reported: true } : e));
  }
}

export const errorLogger = new ErrorLoggerService();
