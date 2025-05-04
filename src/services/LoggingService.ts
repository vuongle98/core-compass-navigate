
/**
 * Service for logging events and errors
 */
class LoggingService {
  private static instance: LoggingService;
  private currentUser: string | null = null;
  private activityTracking = false;
  private config = {
    logLevel: 'info',
    enableConsole: true
  };

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Set activity tracking
   */
  public static setActivityTracking(enabled: boolean): void {
    LoggingService.getInstance().activityTracking = enabled;
  }

  /**
   * Set current user
   */
  public static setUser(userId: string | null): void {
    LoggingService.getInstance().currentUser = userId;
  }

  /**
   * Configure logging
   */
  public static config(options: { logLevel?: string; enableConsole?: boolean }): void {
    const instance = LoggingService.getInstance();
    instance.config = { ...instance.config, ...options };
  }

  /**
   * Log information
   */
  public static info(module: string, event: string, message: string): void {
    LoggingService.getInstance().logInfo(module, event, message);
  }

  /**
   * Log a warning
   */
  public static warn(module: string, event: string, message: string, data?: any): void {
    LoggingService.getInstance().logWarning(module, event, message, data);
  }

  /**
   * Log an error
   */
  public static error(module: string, event: string, message: string, error?: any): void {
    LoggingService.getInstance().logError(module, event, message, error);
  }

  /**
   * Log a debug message
   */
  public static debug(module: string, event: string, message: string, data?: any): void {
    LoggingService.getInstance().logDebug(module, event, message, data);
  }

  /**
   * Log user action
   */
  public static logUserAction(action: string, details?: any): void {
    LoggingService.getInstance().trackUserAction(action, details);
  }

  // Instance methods
  private logInfo(module: string, event: string, message: string): void {
    if (this.shouldLog('info')) {
      console.info(`[${module}] ${event}: ${message}`);
    }
  }

  private logWarning(module: string, event: string, message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${module}] ${event}: ${message}`, data || '');
    }
  }

  private logError(module: string, event: string, message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(`[${module}] ${event}: ${message}`, error || '');
    }
  }

  private logDebug(module: string, event: string, message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[${module}] ${event}: ${message}`, data || '');
    }
  }

  private trackUserAction(action: string, details?: any): void {
    if (!this.activityTracking) return;
    
    const user = this.currentUser || 'anonymous';
    this.logInfo('user_activity', action, `User ${user} performed ${action}`);
    
    if (details) {
      this.logDebug('user_activity', `${action}_details`, '', details);
    }
  }

  private shouldLog(level: string): boolean {
    if (!this.config.enableConsole) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex >= configLevelIndex;
  }
}

export default LoggingService;
