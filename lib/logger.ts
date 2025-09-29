type LogLevel = "debug" | "info" | "warn" | "error"

// Configure log levels that should be displayed
const ENABLED_LOG_LEVELS: LogLevel[] = ["info", "warn", "error"]

// In production, we might want to send logs to a service
const isProd = process.env.NODE_ENV === "production"

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (ENABLED_LOG_LEVELS.includes("debug")) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },

  info: (message: string, ...args: any[]) => {
    if (ENABLED_LOG_LEVELS.includes("info")) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (ENABLED_LOG_LEVELS.includes("warn")) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  error: (message: string, ...args: any[]) => {
    if (ENABLED_LOG_LEVELS.includes("error")) {
      console.error(`[ERROR] ${message}`, ...args)

      // In production, you might want to send errors to a monitoring service
      if (isProd) {
        // Example: sendToErrorMonitoring(message, ...args);
      }
    }
  },
}
