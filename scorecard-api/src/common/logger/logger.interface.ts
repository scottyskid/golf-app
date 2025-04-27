export interface ILogger {
    debug(message: string, context?: string, meta?: Record<string, unknown>): void;
    info(message: string, context?: string, meta?: Record<string, unknown>): void;
    warn(message: string, context?: string, meta?: Record<string, unknown>): void;
    error(message: string, context?: string, meta?: Record<string, unknown>): void;
    fatal(message: string, context?: string, meta?: Record<string, unknown>): void;
    setContext(context: string): void;
}
