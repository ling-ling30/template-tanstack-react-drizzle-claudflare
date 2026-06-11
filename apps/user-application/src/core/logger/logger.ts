/**
 * Generic Logger Shell
 * 
 * This is an inversion-of-control layer for your application's observability.
 * By default, this simply logs to the console. 
 * 
 * When deploying to production, DO NOT scatter Sentry or Baselime calls throughout
 * your application. Instead, drop your preferred observability SDK directly into 
 * these methods. Your entire application will automatically start routing errors 
 * and logs to the new provider.
 */

type LogContext = Record<string, any>;

class Logger {
  info(message: string, context?: LogContext) {
    if (import.meta.env?.DEV) {
      console.info(`[INFO] ${message}`, context || "");
    }
    // TODO: Add production log ingestion (e.g. Axiom, Datadog)
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || "");
    // TODO: Add production log ingestion
  }

  error(message: string, error?: unknown, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error, context || "");
    // TODO: Drop in Sentry.captureException(error) or Baselime logging here
  }

  fatal(message: string, error?: unknown, context?: LogContext) {
    console.error(`[FATAL] ${message}`, error, context || "");
    // TODO: Trigger high-priority alerts (PagerDuty, Slack Webhooks, etc.)
  }
}

export const logger = new Logger();
