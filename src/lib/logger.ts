type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  workspaceId?: string;
  requestId?: string;
  module?: string;
  action?: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

class Logger {
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.currentLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
        },
      }),
    };

    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(payload);
    }

    const badge = {
      debug: '🔍 DEBUG',
      info: '✨ INFO ',
      warn: '⚠️ WARN ',
      error: '🚨 ERROR',
    }[level];

    const ctxStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const errStr = error ? `\n   ${error.stack || error.message}` : '';
    return `[${timestamp}] ${badge}: ${message}${ctxStr}${errStr}`;
  }

  public debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  public info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  public warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  public error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const err = error instanceof Error ? error : undefined;
      const ctx = error instanceof Error ? context : ({ ...context, rawError: error } as LogContext);
      console.error(this.formatMessage('error', message, ctx, err));
    }
  }
}

export const logger = new Logger();
