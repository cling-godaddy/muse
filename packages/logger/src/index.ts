export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(event: string, data?: Record<string, unknown>): void
  info(event: string, data?: Record<string, unknown>): void
  warn(event: string, data?: Record<string, unknown>): void
  error(event: string, data?: Record<string, unknown>): void
  child(context: { agent?: string }): Logger
}

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getLogLevel(): LogLevel {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in LEVELS) return env as LogLevel;
  return "info";
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[getLogLevel()];
}

export function createLogger(context?: { agent?: string }): Logger {
  const log = (
    level: LogLevel,
    event: string,
    data?: Record<string, unknown>,
  ) => {
    if (!shouldLog(level)) return;

    const entry = {
      level,
      ts: new Date().toISOString(),
      ...(context?.agent && { agent: context.agent }),
      event,
      ...(data && { data }),
    };

    const stream = level === "error" ? process.stderr : process.stdout;
    stream.write(JSON.stringify(entry) + "\n");
  };

  return {
    debug: (event, data) => log("debug", event, data),
    info: (event, data) => log("info", event, data),
    warn: (event, data) => log("warn", event, data),
    error: (event, data) => log("error", event, data),
    child: ctx => createLogger({ ...context, ...ctx }),
  };
}

export const logger = createLogger();
