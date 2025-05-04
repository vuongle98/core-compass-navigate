
/**
 * Logging service for consistent application logging
 */
class LoggingService {
  private static instance: LoggingService | null = null;

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  public info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${message}`, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args);
  }

  public error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  public track(eventName: string, properties?: Record<string, any>): void {
    console.log(`[TRACK] ${eventName}`, properties);
    // Implement actual analytics tracking here if needed
  }
}

export default LoggingService;
