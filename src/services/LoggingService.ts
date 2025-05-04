
/**
 * Logging service for consistent application logging
 */
class LoggingService {
  private static instance: LoggingService | null = null;
  private userId?: string;
  public config = {
    enableActivityTracking: true,
    logLevel: 'info',
    environment: process.env.NODE_ENV || 'development'
  };
  
  private activityTracking: any = null;

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  public setUser(user: any): void {
    if (user && user.id) {
      this.userId = user.id;
    } else {
      this.userId = undefined;
    }
  }
  
  public setActivityTracking(tracking: any): void {
    this.activityTracking = tracking;
  }

  // Instance methods
  public info(category: string, event: string, message: string, data?: any): void {
    console.info(`[INFO][${category}][${event}] ${message}`, data || '');
  }

  public warn(category: string, event: string, message: string, data?: any): void {
    console.warn(`[WARN][${category}][${event}] ${message}`, data || '');
  }

  public error(category: string, event: string, message: string, data?: any): void {
    console.error(`[ERROR][${category}][${event}] ${message}`, data || '');
  }

  public debug(category: string, event: string, message: string, data?: any): void {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG][${category}][${event}] ${message}`, data || '');
    }
  }

  public track(eventName: string, properties?: Record<string, any>): void {
    console.log(`[TRACK] ${eventName}`, properties);
    // Implement actual analytics tracking here if needed
  }
  
  public logUserAction(action: string, details?: any): void {
    console.log(`[USER_ACTION] ${action}`, { userId: this.userId, ...details });
    // Forward to API service if configured
  }

  // Static methods that delegate to instance methods
  public static info(category: string, event: string, message: string, data?: any): void {
    LoggingService.getInstance().info(category, event, message, data);
  }

  public static warn(category: string, event: string, message: string, data?: any): void {
    LoggingService.getInstance().warn(category, event, message, data);
  }

  public static error(category: string, event: string, message: string, data?: any): void {
    LoggingService.getInstance().error(category, event, message, data);
  }

  public static debug(category: string, event: string, message: string, data?: any): void {
    LoggingService.getInstance().debug(category, event, message, data);
  }

  public static track(eventName: string, properties?: Record<string, any>): void {
    LoggingService.getInstance().track(eventName, properties);
  }
  
  public static logUserAction(action: string, details?: any): void {
    LoggingService.getInstance().logUserAction(action, details);
  }

  public static setUser(user: any): void {
    LoggingService.getInstance().setUser(user);
  }

  public static setActivityTracking(tracking: any): void {
    LoggingService.getInstance().setActivityTracking(tracking);
  }

  public static get config() {
    return LoggingService.getInstance().config;
  }
}

export default LoggingService;
