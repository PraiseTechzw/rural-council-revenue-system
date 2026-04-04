import { env } from "./env";

type LogLevel = "debug" | "info" | "warn" | "error";

const levels: LogLevel[] = ["debug", "info", "warn", "error"];
const minimumLevelIndex = levels.indexOf(env.LOG_LEVEL);

function shouldLog(level: LogLevel) {
  return levels.indexOf(level) >= minimumLevelIndex;
}

function write(level: LogLevel, ...args: unknown[]) {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === "error") {
    console.error(prefix, ...args);
    return;
  }

  if (level === "warn") {
    console.warn(prefix, ...args);
    return;
  }

  console.log(prefix, ...args);
}

export const logger = {
  debug: (...args: unknown[]) => write("debug", ...args),
  info: (...args: unknown[]) => write("info", ...args),
  warn: (...args: unknown[]) => write("warn", ...args),
  error: (...args: unknown[]) => write("error", ...args)
};

export function logError(error: unknown, context?: Record<string, unknown>) {
  logger.error(context ?? {}, error);
}
